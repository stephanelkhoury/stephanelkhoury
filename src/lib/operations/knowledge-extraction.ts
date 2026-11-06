import { Unzip, UnzipInflate } from 'fflate';

const MAX_EXTRACTED_TEXT_CHARS = 250_000;
const MAX_PDF_PAGES = 100;
const MAX_DOCX_ARCHIVE_ENTRIES = 128;
const MAX_DOCX_EXPANDED_BYTES = 12 * 1024 * 1024;

export type KnowledgeExtractionErrorCode = 'UNSUPPORTED_FILE' | 'INVALID_FILE' | 'EMPTY_TEXT' | 'TEXT_LIMIT' | 'PARSER_FAILED';

export class KnowledgeExtractionError extends Error {
  readonly code: KnowledgeExtractionErrorCode;

  constructor(code: KnowledgeExtractionErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'KnowledgeExtractionError';
  }
}

export function preflightDocxArchive(bytes: Uint8Array) {
  let entryCount = 0;
  let expandedBytes = 0;
  let hasContentTypes = false;
  let hasDocumentXml = false;
  let failure: KnowledgeExtractionError | null = null;
  const unzip = new Unzip((file) => {
    entryCount += 1;
    if (entryCount > MAX_DOCX_ARCHIVE_ENTRIES) {
      failure = new KnowledgeExtractionError('TEXT_LIMIT', `DOCX archives are limited to ${MAX_DOCX_ARCHIVE_ENTRIES} entries.`);
      return;
    }
    if (file.name === '[Content_Types].xml') hasContentTypes = true;
    if (file.name === 'word/document.xml') hasDocumentXml = true;
    if ((file.originalSize ?? 0) > MAX_DOCX_EXPANDED_BYTES || expandedBytes + (file.originalSize ?? 0) > MAX_DOCX_EXPANDED_BYTES) {
      failure = new KnowledgeExtractionError('TEXT_LIMIT', 'DOCX expanded content exceeds the 12 MiB safety limit.');
      return;
    }
    file.ondata = (error, chunk) => {
      if (error) {
        failure = new KnowledgeExtractionError('INVALID_FILE', 'The DOCX archive contains an invalid compressed entry.');
        file.terminate();
        return;
      }
      expandedBytes += chunk.byteLength;
      if (expandedBytes > MAX_DOCX_EXPANDED_BYTES) {
        failure = new KnowledgeExtractionError('TEXT_LIMIT', 'DOCX expanded content exceeds the 12 MiB safety limit.');
        file.terminate();
      }
    };
    try {
      file.start();
    } catch {
      failure = new KnowledgeExtractionError('INVALID_FILE', 'The DOCX archive uses an unsupported compression format.');
    }
  });
  unzip.register(UnzipInflate);
  try {
    unzip.push(bytes, true);
  } catch {
    throw new KnowledgeExtractionError('INVALID_FILE', 'The DOCX archive structure is invalid.');
  }
  if (failure) throw failure;
  if (entryCount === 0 || !hasContentTypes || !hasDocumentXml) {
    throw new KnowledgeExtractionError('INVALID_FILE', 'The ZIP archive is not a valid DOCX document.');
  }
}

function normalizeText(text: string) {
  const normalized = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) throw new KnowledgeExtractionError('EMPTY_TEXT', 'No searchable text was found in the document.');
  if (normalized.length > MAX_EXTRACTED_TEXT_CHARS) {
    throw new KnowledgeExtractionError('TEXT_LIMIT', `Extracted text exceeds the ${MAX_EXTRACTED_TEXT_CHARS.toLocaleString()} character limit.`);
  }
  return normalized;
}

export async function extractKnowledgeText(fileName: string, bytes: Uint8Array) {
  const extension = fileName.toLowerCase().split('.').pop();
  const buffer = Buffer.from(bytes);

  if (extension === 'txt' || extension === 'md' || extension === 'csv') {
    if (buffer.includes(0)) {
      throw new KnowledgeExtractionError('INVALID_FILE', 'This file contains binary data and is not valid UTF-8 text.');
    }

    try {
      return normalizeText(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } catch (error) {
      if (error instanceof KnowledgeExtractionError) throw error;
      throw new KnowledgeExtractionError('INVALID_FILE', 'This text file is not valid UTF-8.');
    }
  }

  if (extension === 'pdf') {
    const header = buffer.subarray(0, 1024).toString('ascii');
    if (!header.includes('%PDF-')) {
      throw new KnowledgeExtractionError('INVALID_FILE', 'The file does not contain a valid PDF header.');
    }

    let destroyLoadingTask: (() => Promise<void>) | undefined;
    try {
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });
      destroyLoadingTask = () => loadingTask.destroy();
      const pdfDocument = await loadingTask.promise;
      if (pdfDocument.numPages > MAX_PDF_PAGES) {
        await loadingTask.destroy();
        throw new KnowledgeExtractionError('TEXT_LIMIT', `PDF exceeds the ${MAX_PDF_PAGES} page extraction limit.`);
      }

      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const pageText = await page.getTextContent();
        pages.push(pageText.items.map((item) => ('str' in item ? item.str : '')).join(' '));
        page.cleanup();
      }
      await loadingTask.destroy();
      return normalizeText(pages.join('\n\n'));
    } catch (error) {
      if (error instanceof KnowledgeExtractionError) throw error;
      await destroyLoadingTask?.().catch(() => undefined);
      throw new KnowledgeExtractionError('PARSER_FAILED', 'PDF text extraction failed. The file may be damaged or image-only.');
    }
  }

  if (extension === 'docx') {
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    if (!isZip) throw new KnowledgeExtractionError('INVALID_FILE', 'The file does not contain a valid DOCX container.');
    preflightDocxArchive(bytes);

    try {
      const mammoth = await import('mammoth');
      const extractor = mammoth.extractRawText ?? mammoth.default?.extractRawText;
      if (!extractor) throw new Error('DOCX text extractor is unavailable.');
      const result = await extractor({ buffer });
      return normalizeText(result.value);
    } catch (error) {
      if (error instanceof KnowledgeExtractionError) throw error;
      throw new KnowledgeExtractionError('PARSER_FAILED', 'DOCX text extraction failed. The file may be damaged or unsupported.');
    }
  }

  throw new KnowledgeExtractionError('UNSUPPORTED_FILE', 'Supported files are UTF-8 TXT, Markdown, CSV, PDF, and DOCX.');
}

export function chunkKnowledgeText(text: string, chunkSize = 1200, overlap = 120) {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf('\n', end);
      if (boundary > start + Math.floor(chunkSize * 0.6)) end = boundary;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}
