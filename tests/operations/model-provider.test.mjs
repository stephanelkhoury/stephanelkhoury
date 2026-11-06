import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anthropicCompatibleSchema, generateStructuredJson, generateText, ModelProviderError } from '../../src/lib/operations/model-provider.ts';

const schema = {
  type: 'object',
  properties: { connected: { type: 'boolean' } },
  required: ['connected'],
  additionalProperties: false,
};

function overrideEnvironment(overrides) {
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  for (const [key, value] of Object.entries(overrides)) process.env[key] = value;
  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

test('Claude structured output uses server auth, current schema format, and reported usage', async () => {
  const restoreEnvironment = overrideEnvironment({ ANTHROPIC_API_KEY: 'test-claude-key', ANTHROPIC_MODEL: 'claude-sonnet-5-5' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.anthropic.com/v1/messages');
    assert.equal(new Headers(init.headers).get('x-api-key'), 'test-claude-key');
    assert.equal(new Headers(init.headers).get('anthropic-version'), '2026-10-21');
    const body = JSON.parse(init.body);
    assert.equal(body.model, 'claude-sonnet-5-5');
    assert.deepEqual(body.output_config.format, { type: 'json_schema', schema });
    assert.equal(body.max_tokens, 64);
    return new Response(JSON.stringify({
      model: body.model,
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '{"connected":true}' }],
      usage: { input_tokens: 2, output_tokens: 3 },
    }), { status: 200 });
  };
  try {
    const result = await generateStructuredJson({ provider: 'anthropic', prompt: 'Check the connection.', schema, maxOutputTokens: 64 });
    assert.deepEqual(result.value, { connected: true });
    assert.equal(result.provider, 'anthropic');
    assert.equal(result.inputTokens, 2);
    assert.equal(result.outputTokens, 3);
    assert.equal(result.estimatedCostUsd, 0.000034);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test('OpenAI structured output uses Responses API without storing request data', async () => {
  const restoreEnvironment = overrideEnvironment({ OPENAI_API_KEY: 'test-openai-key', OPENAI_CODEX_MODEL: 'gpt-6.1-sol' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test-openai-key');
    const body = JSON.parse(init.body);
    assert.equal(body.store, false);
    assert.equal(body.text.format.name, 'structured_response');
    assert.equal(body.text.format.strict, true);
    assert.deepEqual(body.text.format.schema, schema);
    return new Response(JSON.stringify({
      model: body.model,
      status: 'completed',
      output_text: '{"connected":true}',
      usage: { input_tokens: 2, output_tokens: 3 },
    }), { status: 200 });
  };
  try {
    const result = await generateStructuredJson({ provider: 'openai', prompt: 'Check the connection.', schema, maxOutputTokens: 64 });
    assert.deepEqual(result.value, { connected: true });
    assert.equal(result.provider, 'openai');
    assert.equal(result.model, 'gpt-6.1-sol');
    assert.equal(result.estimatedCostUsd, 0.000034);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test('provider failures are sanitized and missing credentials fail before network access', async () => {
  const restoreEnvironment = overrideEnvironment({ ANTHROPIC_API_KEY: 'test-claude-key' });
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify({ error: { message: 'secret-bearing provider payload' } }), { status: 429 });
  };
  try {
    await assert.rejects(
      generateStructuredJson({ provider: 'anthropic', prompt: 'test', schema, maxOutputTokens: 32 }),
      error => error instanceof ModelProviderError && error.status === 429 && !error.message.includes('secret-bearing'),
    );
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(
      generateStructuredJson({ provider: 'openai', prompt: 'test', schema, maxOutputTokens: 32 }),
      error => error instanceof ModelProviderError && error.status === 503 && error.message.includes('OPENAI_API_KEY'),
    );
    assert.equal(fetchCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test('Claude refusals, token truncation, and unsupported providers do not become success-shaped output', async () => {
  const restoreEnvironment = overrideEnvironment({ ANTHROPIC_API_KEY: 'test-claude-key' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    return new Response(JSON.stringify({
      model: body.model,
      stop_reason: 'max_tokens',
      content: [{ type: 'text', text: '{"connected":' }],
      usage: { input_tokens: 2, output_tokens: 32 },
    }), { status: 200 });
  };
  try {
    await assert.rejects(
      generateStructuredJson({ provider: 'anthropic', prompt: 'test', schema, maxOutputTokens: 32 }),
      error => error instanceof ModelProviderError && error.status === 422,
    );
    await assert.rejects(
      generateStructuredJson({ provider: 'codex-cli', prompt: 'test', schema, maxOutputTokens: 32 }),
      error => error instanceof ModelProviderError && error.message.includes('not supported'),
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test('Anthropic schema transformation removes unsupported constraints without weakening application validation', () => {
  const transformed = anthropicCompatibleSchema({
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-z]+$' },
      tasks: { type: 'array', minItems: 2, maxItems: 10, items: { type: 'string' } },
      slug: { type: 'string', format: 'uuid' },
    },
    required: ['title', 'tasks', 'slug'],
    additionalProperties: false,
  });
  assert.deepEqual(transformed, {
    type: 'object',
    properties: {
      title: { type: 'string' },
      tasks: { type: 'array', items: { type: 'string' } },
      slug: { type: 'string', format: 'uuid' },
    },
    required: ['title', 'tasks', 'slug'],
    additionalProperties: false,
  });
});

test('plain text chat can use Claude or OpenAI without exposing stored responses', async () => {
  const restoreEnvironment = overrideEnvironment({ ANTHROPIC_API_KEY: 'test-claude-key', OPENAI_API_KEY: 'test-openai-key' });
  const originalFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    seen.push({ url, body });
    if (url === 'https://api.anthropic.com/v1/messages') {
      return new Response(JSON.stringify({ model: body.model, stop_reason: 'end_turn', content: [{ type: 'text', text: 'Claude reply' }], usage: { input_tokens: 4, output_tokens: 2 } }), { status: 200 });
    }
    return new Response(JSON.stringify({ model: body.model, status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'OpenAI reply' }] }], usage: { input_tokens: 5, output_tokens: 3 } }), { status: 200 });
  };
  try {
    const claude = await generateText({ provider: 'anthropic', prompt: 'A visitor asks a question.', maxOutputTokens: 64 });
    const openai = await generateText({ provider: 'openai', prompt: 'A visitor asks a question.', maxOutputTokens: 64 });
    assert.equal(claude.text, 'Claude reply');
    assert.equal(openai.text, 'OpenAI reply');
    assert.equal(seen[1].body.store, false);
    assert.equal(seen[1].body.text.format.type, 'text');
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});