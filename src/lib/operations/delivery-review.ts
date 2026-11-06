export function deliveryReviewState(versions: Array<{ approvals: Array<{ status: string }> }>) {
  if (!versions.length) return 'PENDING' as const;
  if (versions.some(version => version.approvals.some(approval => approval.status === 'REJECTED'))) return 'REJECTED' as const;
  if (versions.some(version => version.approvals.some(approval => approval.status === 'CHANGES_REQUESTED'))) return 'CHANGES_REQUESTED' as const;
  if (versions.some(version => !version.approvals.length || version.approvals.some(approval => approval.status !== 'APPROVED'))) return 'PENDING' as const;
  return 'APPROVED' as const;
}
