export function redactOperationalError(error: unknown, fallback = 'Operation failed; details were redacted from activity logs.') {
  if (!(error instanceof Error)) return fallback;
  const firstLine = error.message.split(/\r?\n/, 1)[0].trim();
  if (!firstLine) return fallback;
  const redacted = firstLine
    .replace(/\b(Bearer|Basic)\s+[^\s,;]+/gi, '$1 [redacted]')
    .replace(/\b(token|api[_-]?key|password|secret|authorization)\b([:=]\s*)[^\s,;]+/gi, '$1$2[redacted]')
    .replace(/https?:\/\/[^/\s@]+:[^/@\s]+@/gi, 'https://[redacted]@')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/gi, '[redacted]')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 320);
  return redacted || fallback;
}
