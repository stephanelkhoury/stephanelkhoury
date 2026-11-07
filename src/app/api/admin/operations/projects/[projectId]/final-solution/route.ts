import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { createDepartmentDraft } from '@/lib/operations/department-draft';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const FINAL_AGENT_KEY = 'project-manager';

function digestOf(output: unknown) {
  if (output && typeof output === 'object' && 'summary' in output && typeof output.summary === 'string') return output.summary;
  return JSON.stringify(output ?? '').slice(0, 220);
}

// Drafts a Project Manager task that merges every finished task on the project into one final answer.
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { projectId } = await params;
  try {
    const limit = await consumeRateLimit(`final-solution:${access.workspaceId}:${access.userId}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: 'Final solution drafting is temporarily rate limited.' }, { status: limit.storage === 'unavailable' ? 503 : 429 });
    const tasks = await prisma.operationsTask.findMany({
      where: { workspaceId: access.workspaceId, projectId, status: 'SUCCEEDED', NOT: { agent: { key: FINAL_AGENT_KEY } } },
      orderBy: { updatedAt: 'asc' },
      select: { title: true, output: true, agent: { select: { name: true } } },
    });
    if (tasks.length < 1) return NextResponse.json({ error: 'No finished tasks to combine yet.' }, { status: 409 });
    const digest = tasks.map(task => `- ${task.agent?.name ?? 'Agent'} / ${task.title}: ${digestOf(task.output)}`).join('\n').slice(0, 1450);
    const result = await createDepartmentDraft({
      workspaceId: access.workspaceId,
      actorId: access.userId,
      projectId,
      agentKey: FINAL_AGENT_KEY,
      budgetCapUsd: 1,
      idempotencyKey: `final-solution:${projectId}:${tasks.length}`,
      handoff: { fromRunId: `final-solution:${projectId}`, summary: `Combine these finished department outputs into ONE client-ready package for the owner with these sections: 1) strategy and goals, 2) creative direction, 3) copy (English and Arabic when relevant), 4) assets and production list, 5) schedule and owners, 6) quote and payment terms, 7) open risks and missing inputs. Use only what the outputs below support and mark gaps.\n${digest}` },
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ run: result.run, duplicate: result.duplicate, combined: tasks.length }, { status: result.duplicate ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: 'Final solution could not be drafted.' }, { status: 503 });
  }
}
