import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { taskReadiness } from '@/lib/operations/task-readiness';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const projectId = request.nextUrl.searchParams.get('projectId');
  try {
    const tasks = await prisma.operationsTask.findMany({
      where: { workspaceId: access.workspaceId, ...(projectId ? { projectId } : {}) }, orderBy: [{ updatedAt: 'desc' }, { sortOrder: 'asc' }], take: 250,
      include: { project: { select: { id: true, name: true } }, agent: { select: { name: true, enabled: true, versions: { where: { status: 'APPROVED' }, take: 1, select: { id: true } } } }, dependencies: { select: { dependsOn: { select: { id: true, title: true, status: true } } } }, approvals: { select: { status: true } }, workflowRun: { select: { id: true, acceptedAt: true, status: true, cancelRequestedAt: true } } },
    });
    return NextResponse.json({ tasks: tasks.map(task => ({ id: task.id, title: task.title, description: task.description, status: task.status, error: task.error, updatedAt: task.updatedAt, project: task.project, agent: task.agent?.name ?? null, workflowRunId: task.workflowRunId, runStatus: task.workflowRun?.status, acceptanceCriteria: task.acceptanceCriteria, dependencies: task.dependencies.map(link => link.dependsOn), readiness: taskReadiness({ status: task.status, accepted: Boolean(task.workflowRun?.acceptedAt), cancelRequested: Boolean(task.workflowRun?.cancelRequestedAt), enabled: task.agent?.enabled ?? false, approved: Boolean(task.agent?.versions.length), dependencies: task.dependencies.map(link => link.dependsOn), approvals: task.approvals }) })), limit: 250 });
  } catch { return NextResponse.json({ error: 'Task board could not be loaded.' }, { status: 503 }); }
}
