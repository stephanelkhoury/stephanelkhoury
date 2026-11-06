import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { characterProfileSchema } from '@/lib/operations/character-validation';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
export const runtime = 'nodejs';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ characterId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const body = await readBoundedJsonBody(request.body, 12000);
  if (!body.ok) return NextResponse.json({ error: 'Profile body must be valid JSON under 12 KiB.' }, { status: 400 });
  const parsed = characterProfileSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { characterId } = await params;
  try {
    const profile = await prisma.$transaction(async tx => {
      const updated = await tx.characterProfile.update({ where: { workspaceId_key: { workspaceId: access.workspaceId, key: characterId } }, data: parsed.data });
      await tx.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'character.updated', resource: 'CharacterProfile', resourceId: updated.id, metadata: { key: updated.key, roomKey: updated.roomKey, deskKey: updated.deskKey } } });
      return updated;
    });
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'That desk is occupied. Choose a free desk.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return NextResponse.json({ error: 'Employee profile not found.' }, { status: 404 });
    return NextResponse.json({ error: 'Employee profile could not be saved.' }, { status: 503 });
  }
}
