export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'too-large' | 'invalid-json' };

export async function readBoundedJsonBody(stream: ReadableStream<Uint8Array> | null, maxBytes: number): Promise<BoundedJsonResult> {
  if (!stream || !Number.isSafeInteger(maxBytes) || maxBytes < 0) return { ok: false, reason: 'invalid-json' };

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: 'too-large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'invalid-json' };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
}