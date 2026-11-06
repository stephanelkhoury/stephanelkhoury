import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicContent } from '@/lib/bootstrap';
import { featuredProjectCopy, featuredProjectSlugs } from '@/lib/featured-projects';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { consumeRateLimit } from '@/lib/rate-limit';
import { rateLimitClientKey } from '@/lib/operations/rate-limit-memory';
import { defaultModelForProvider, generateText, isModelProviderConfigured, ModelProviderError, resolveModelProvider } from '@/lib/operations/model-provider';
import { z } from 'zod';

export const runtime = 'nodejs';

const chatBodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  sessionId: z.string().trim().min(1).max(128).nullable().optional(),
  visitorId: z.string().trim().min(1).max(160).optional(),
}).passthrough();

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const parsedBody = await readBoundedJsonBody(request.body, 16_384);
  if (!parsedBody.ok) return NextResponse.json({ error: parsedBody.reason === 'too-large' ? 'Chat request is too large.' : 'Request body must be valid JSON.' }, { status: parsedBody.reason === 'too-large' ? 413 : 400 });
  const parsed = chatBodySchema.safeParse(parsedBody.value);
  if (!parsed.success) return NextResponse.json({ error: 'Provide a message with at most 4,000 characters.' }, { status: 400 });
  const { message } = parsed.data;
  const sessionId = parsed.data.sessionId || null;
  const visitorId = parsed.data.visitorId || 'anonymous';

  const rateLimit = await consumeRateLimit(rateLimitClientKey(request, 'portfolio-chat'), 20, 15 * 60 * 1000);
  if (rateLimit.storage === 'unavailable') return NextResponse.json({ error: 'Chat rate-limit protection is unavailable.' }, { status: 503 });
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many chat requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } });

  let provider;
  try { provider = resolveModelProvider(process.env.PORTFOLIO_CHAT_PROVIDER || 'gemini'); }
  catch { return NextResponse.json({ error: 'PORTFOLIO_CHAT_PROVIDER must be gemini, anthropic, or openai.' }, { status: 500 }); }
  if (!isModelProviderConfigured(provider)) {
    const keyName = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY';
    return NextResponse.json({ error: `${provider} is not configured. Set ${keyName} on the server.` }, { status: 503 });
  }

  const [content, chatSession] = await Promise.all([
    getPublicContent(),
    sessionId
      ? prisma.chatSession.findUnique({ where: { id: sessionId } })
      : prisma.chatSession.create({
          data: {
            visitorId,
            title: 'Website visitor chat',
          },
        }),
  ]);

  const actualSession = chatSession;
  if (!actualSession) {
    return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: actualSession.id,
      role: 'user',
      content: message,
    },
  });

  const systemsText = content.systems
    .map((system: { name: string; experience: string }) => `${system.name}: ${system.experience}`)
    .join('\n');

  const contactBlock = content.blocks.find((block) => block.slug === 'contact-main');
  const contactDetails = contactBlock?.content as { email?: string } | undefined;
  const contactEmail = contactDetails?.email || 'stephanelkhoury2000@gmail.com';

  const projectsList = content.projects
    .filter((project) => featuredProjectSlugs.has(project.slug) && Boolean(project.liveUrl))
    .map((project) => `- ${project.title}: ${featuredProjectCopy[project.slug].description}`)
    .join('\n');
  const profileBlockSlugs = new Set(['experience-main', 'skills-main', 'contact-main']);
  const profileBlocks = content.blocks
    .filter((block) => profileBlockSlugs.has(block.slug))
    .map((block) => `${block.title}: ${JSON.stringify(block.content)}`)
    .join('\n');

  const prompt = `You are the AI assistant for Stephan El Khoury's portfolio website.
Your job is to answer visitor questions clearly and honestly based on the profile data below.

## Rules
1. For project/work inquiries (e.g. "can you build X for me?", "can we collaborate on Y?", "do you do freelance?"):
   - Start with a clear YES or NO based on whether the request matches Stephan's tech stack (listed below).
   - Briefly explain WHY — mention the specific technologies from his stack that apply.
  - Then direct the visitor to the contact section or email at ${contactEmail} to discuss next steps.
2. For availability/rates questions: explain that current availability and pricing should be discussed directly, and provide ${contactEmail}.
3. For general questions, answer concisely from the profile data only.
4. Never make up information not in the data.
5. Keep answers friendly, professional, and to the point.
6. Reply in plain text without Markdown markers or formatting.

## Contact & Appointment Information
- Email (preferred): ${contactEmail}
- Contact form: bottom of this page (#contact section), which opens an email draft
- LinkedIn: available via the social links on this site
- Next steps and scheduling are discussed directly by email.

## Profile Blocks
${profileBlocks}

## Current Projects
${projectsList}

## Supported Systems / Tech Stack
${systemsText}

---
Visitor question: ${message}`;

  const configuredModel = process.env.PORTFOLIO_CHAT_MODEL?.trim();
  const models = provider === 'gemini' && !configuredModel
    ? ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite']
    : [configuredModel || defaultModelForProvider(provider)];
  let answer = '';
  let degraded = false;

  for (const model of models) {
    try {
      const response = await generateText({ provider, model, prompt, maxOutputTokens: 900 });
      answer = response.text;
      if (answer) break;
    } catch (error) {
      const shouldTryFallback = provider === 'gemini' && error instanceof ModelProviderError && [404, 429, 503].includes(error.status ?? 0);
      if (!shouldTryFallback) break;
    }
  }

  if (!answer) {
    degraded = true;
    answer = `The AI assistant is temporarily unavailable. You can reach Stephan directly at ${contactEmail} or use the contact form below.`;
  }

  await prisma.chatMessage.create({
    data: {
      sessionId: actualSession.id,
      role: 'assistant',
      content: answer,
    },
  });

  return NextResponse.json({
    sessionId: actualSession.id,
    answer,
    degraded,
  });
}
