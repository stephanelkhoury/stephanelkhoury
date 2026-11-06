import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deflateRawSync } from 'node:zlib';
import {
  chunkKnowledgeText,
  extractKnowledgeText,
  KnowledgeExtractionError,
  preflightDocxArchive,
} from '../../src/lib/operations/knowledge-extraction.ts';

const bytes = (value) => new TextEncoder().encode(value);

function makePdfFixture() {
  const stream = 'BT /F1 18 Tf 72 720 Td (PDF fixture text) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  const parts = ['%PDF-1.4\n'];
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(parts.join('')));
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(parts.join(''));
  parts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) parts.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new TextEncoder().encode(parts.join(''));
}

function crc32(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  }
  return (value ^ 0xffffffff) >>> 0;
}

function makeDocxFixture(documentText = 'DOCX fixture text') {
  const files = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${documentText}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>`],
  ];
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [name, content] of files) {
    const fileName = Buffer.from(name);
    const data = Buffer.from(content);
    const compressed = deflateRawSync(data);
    const checksum = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localParts.push(localHeader, fileName, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, fileName);
    offset += localHeader.length + fileName.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...localParts, centralDirectory, end]));
}

test('extracts and normalizes UTF-8 text', async () => {
  const extracted = await extractKnowledgeText('brief.md', bytes('\uFEFFHeading\r\n\r\nBody   \r\n'));
  assert.equal(extracted, 'Heading\n\nBody');
});

test('extracts plain text from real minimal PDF and DOCX containers', async () => {
  const pdfText = await extractKnowledgeText('fixture.pdf', makePdfFixture());
  const docxText = await extractKnowledgeText('fixture.docx', makeDocxFixture());
  assert.match(pdfText, /PDF fixture text/);
  assert.match(docxText, /DOCX fixture text/);
});

test('rejects a compressed DOCX expansion above the preflight byte cap before Mammoth parsing', () => {
  const zipBomb = makeDocxFixture('x'.repeat(12 * 1024 * 1024 + 1));
  assert.ok(zipBomb.length < 4 * 1024 * 1024);
  assert.throws(() => preflightDocxArchive(zipBomb), (error) => error instanceof KnowledgeExtractionError && error.code === 'TEXT_LIMIT');
});

test('rejects unsupported, invalid, and empty files explicitly', async () => {
  await assert.rejects(extractKnowledgeText('clip.mp4', bytes('content')), (error) => error instanceof KnowledgeExtractionError && error.code === 'UNSUPPORTED_FILE');
  await assert.rejects(extractKnowledgeText('notes.txt', new Uint8Array([0xff, 0xfe])), (error) => error instanceof KnowledgeExtractionError && error.code === 'INVALID_FILE');
  await assert.rejects(extractKnowledgeText('empty.txt', bytes(' \n')), (error) => error instanceof KnowledgeExtractionError && error.code === 'EMPTY_TEXT');
  await assert.rejects(extractKnowledgeText('broken.pdf', bytes('not a pdf')), (error) => error instanceof KnowledgeExtractionError && error.code === 'INVALID_FILE');
});

test('chunks long text with overlap and no gaps', () => {
  const source = 'x'.repeat(3000);
  const chunks = chunkKnowledgeText(source, 1200, 120);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].slice(-120), chunks[1].slice(0, 120));
  assert.equal(chunks[1].slice(-120), chunks[2].slice(0, 120));
  assert.equal(chunks.join('').length, 3240);
});
