import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5-5';
export const DEFAULT_OPENAI_MODEL = 'gpt-6.1-sol';

export const DEFAULT_OLLAMA_MODEL = 'qwen3:8b';

export type ModelProviderId = 'gemini' | 'anthropic' | 'openai' | 'ollama';

// For Ollama this holds the local server URL rather than an API key.
const PROVIDER_ENV: Record<ModelProviderId, string> = {
  gemini: 'GEMINI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  ollama: 'OLLAMA_BASE_URL',
};

const PRICING_USD_PER_MILLION_TOKENS: Record<string, [number, number]> = {
  'gemini:default': [0.75, 3.75],
  'anthropic:claude-sonnet-5-5': [2, 10],
  'anthropic:claude-sonnet-5': [2, 10],
  'anthropic:claude-opus-5-5': [4, 20],
  'anthropic:claude-haiku-5-5': [0.1, 0.5],
  'openai:gpt-6-astra': [10, 50],
  'openai:gpt-6.1-sol': [2, 10],
  'openai:gpt-6.1-terra': [1, 5],
  'openai:gpt-6-luna': [0.1, 0.5],
  'openai:gpt-5.5': [5, 30],
  'openai:gpt-5.4': [2.5, 15],
  'openai:gpt-5.4-mini': [0.75, 4.5],
  'openai:gpt-5.3-codex': [1.75, 14],
};

export type StructuredModelResult = {
  value: unknown;
  provider: ModelProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number | null;
};

export type TextModelResult = {
  text: string;
  provider: ModelProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number | null;
};

export class ModelProviderError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ModelProviderError';
    this.status = status;
  }
}

export function resolveModelProvider(value?: string | null): ModelProviderId {
  const defaultProvider = process.env.MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER || 'gemini';
  const provider = (value || defaultProvider).trim().toLowerCase();
  if (provider === 'claude') return 'anthropic';
  if (provider === 'codex') return 'openai';
  if (provider === 'gemini' || provider === 'anthropic' || provider === 'openai' || provider === 'ollama') return provider;
  throw new ModelProviderError(`Model provider ${provider} is not supported.`);
}

export function defaultModelForProvider(provider: ModelProviderId) {
  if (provider === 'anthropic') return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;
  if (provider === 'openai') return process.env.OPENAI_CODEX_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  if (provider === 'ollama') return process.env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL;
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function isModelProviderConfigured(provider: ModelProviderId) {
  return Boolean(process.env[PROVIDER_ENV[provider]]?.trim());
}

function estimateModelCost(provider: ModelProviderId, model: string, inputTokens: number, outputTokens: number) {
  if (provider === 'ollama') return 0;
  const rates = PRICING_USD_PER_MILLION_TOKENS[`${provider}:${model}`]
    ?? (provider === 'gemini' ? PRICING_USD_PER_MILLION_TOKENS['gemini:default'] : undefined);
  if (!rates) return null;
  return Number(((inputTokens * rates[0] + outputTokens * rates[1]) / 1_000_000).toFixed(6));
}
export function hasModelPricing(provider: ModelProviderId, model: string) {
  return provider === 'gemini' || provider === 'ollama' || `${provider}:${model}` in PRICING_USD_PER_MILLION_TOKENS;
}

export function anthropicCompatibleSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(anthropicCompatibleSchema);
  if (typeof schema !== 'object' || schema === null) return schema;
  return Object.fromEntries(Object.entries(schema)
    .filter(([key, value]) => !['minimum', 'maximum', 'multipleOf', 'minLength', 'maxLength', 'maxItems', 'pattern'].includes(key)
      && !(key === 'minItems' && typeof value === 'number' && value > 1))
    .map(([key, value]) => [key, anthropicCompatibleSchema(value)]));
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal | undefined, provider: string) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(120_000)]) : AbortSignal.timeout(120_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') throw new ModelProviderError(`${provider} request timed out.`, 504);
    if (error instanceof Error && error.name === 'AbortError') throw new ModelProviderError(`${provider} request was canceled.`, 499);
    throw new ModelProviderError(`${provider} could not be reached.`, 502);
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? `${provider} rejected the configured API key or model access.`
      : response.status === 429
        ? `${provider} rate limit or usage quota was reached.`
        : response.status >= 500
          ? `${provider} is temporarily unavailable.`
          : `${provider} rejected the structured request. Check the selected model and schema.`;
    throw new ModelProviderError(message, response.status);
  }
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new ModelProviderError(`${provider} returned an invalid response.`, 502);
  }
  return result as Record<string, unknown>;
}

function ollamaChatUrl(baseUrl: string) {
  let url: URL;
  try { url = new URL('/api/chat', baseUrl); } catch { throw new ModelProviderError('OLLAMA_BASE_URL is not a valid URL.', 503); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new ModelProviderError('OLLAMA_BASE_URL must use http or https.', 503);
  return url.toString();
}

// Returns loaded model names, or null when Ollama is not configured or unreachable.
export async function ollamaLoadedModels(): Promise<Set<string> | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim();
  if (!baseUrl) return null;
  try {
    const response = await fetch(new URL('/api/ps', baseUrl), { signal: AbortSignal.timeout(1500), cache: 'no-store' });
    if (!response.ok) return null;
    const body = await response.json() as { models?: Array<{ name?: string; model?: string }> };
    return new Set((body.models ?? []).flatMap(item => [item.name, item.model]).filter((name): name is string => Boolean(name)));
  } catch {
    return null;
  }
}

export async function wakeOllamaModel(model: string) {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim();
  if (!baseUrl) throw new ModelProviderError('Ollama is not configured.', 503);
  const response = await fetch(new URL('/api/generate', baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, keep_alive: '30m' }), signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new ModelProviderError('Ollama could not load the model.', response.status);
}

async function ollamaChat(baseUrl: string, body: Record<string, unknown>, signal: AbortSignal | undefined) {
  const result = await postJson(ollamaChatUrl(baseUrl), {}, { stream: false, ...body }, signal, 'Ollama');
  const message = typeof result.message === 'object' && result.message !== null ? result.message as Record<string, unknown> : {};
  return {
    text: typeof message.content === 'string' ? message.content : '',
    model: typeof result.model === 'string' ? result.model : undefined,
    inputTokens: numberOrZero(result.prompt_eval_count),
    outputTokens: numberOrZero(result.eval_count),
    truncated: result.done_reason === 'length',
  };
}

function parseJsonText(text: string | undefined, provider: string) {
  if (!text) throw new ModelProviderError(`${provider} returned no structured output.`, 502);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ModelProviderError(`${provider} returned output that was not valid JSON.`, 502);
  }
}

export async function generateStructuredJson(input: {
  prompt: string;
  schema: Record<string, unknown>;
  provider?: string | null;
  model?: string;
  maxOutputTokens: number;
  signal?: AbortSignal;
}): Promise<StructuredModelResult> {
  const provider = resolveModelProvider(input.provider);
  const model = input.model?.trim() || defaultModelForProvider(provider);
  const apiKey = process.env[PROVIDER_ENV[provider]]?.trim();
  if (!apiKey) throw new ModelProviderError(`${provider} is not configured. Set ${PROVIDER_ENV[provider]} on the server.`, 503);

  let outputText: string | undefined;
  let responseModel = model;
  let inputTokens = 0;
  let outputTokens = 0;

  if (provider === 'ollama') {
    const result = await ollamaChat(apiKey, { model, messages: [{ role: 'user', content: input.prompt }], format: input.schema, options: { num_predict: input.maxOutputTokens, temperature: 0 } }, input.signal);
    if (result.truncated) throw new ModelProviderError('Ollama response reached its output-token limit.', 422);
    outputText = result.text;
    responseModel = result.model || model;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
  } else if (provider === 'gemini') {
    const client = new GoogleGenAI({ apiKey });
    try {
      const result = await client.interactions.create({
        model,
        input: input.prompt,
        response_format: { type: 'text', mime_type: 'application/json', schema: input.schema },
        generation_config: { max_output_tokens: input.maxOutputTokens, thinking_level: 'low' },
        store: false,
        ...(input.signal ? { signal: input.signal } : {}),
      });
      outputText = result.output_text;
      responseModel = result.model || model;
      inputTokens = numberOrZero(result.usage?.total_input_tokens);
      outputTokens = numberOrZero(result.usage?.total_output_tokens);
    } catch (error) {
      if (error instanceof ModelProviderError) throw error;
      const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : undefined;
      throw new ModelProviderError(status === 503 ? 'Gemini is temporarily unavailable.' : 'Gemini could not complete the structured request.', status);
    }
  } else if (provider === 'anthropic') {
    const result = await postJson('https://api.anthropic.com/v1/messages', {
      'x-api-key': apiKey,
      'anthropic-version': '2026-10-21',
    }, {
      model,
      max_tokens: input.maxOutputTokens,
      messages: [{ role: 'user', content: input.prompt }],
      output_config: { format: { type: 'json_schema', schema: anthropicCompatibleSchema(input.schema) } },
    }, input.signal, 'Claude');
    const usage = typeof result.usage === 'object' && result.usage !== null ? result.usage as Record<string, unknown> : {};
    const blocks = Array.isArray(result.content) ? result.content : [];
    const textBlock = blocks.find((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'text');
    outputText = typeof textBlock === 'object' && textBlock !== null && 'text' in textBlock && typeof textBlock.text === 'string' ? textBlock.text : undefined;
    responseModel = typeof result.model === 'string' ? result.model : model;
    inputTokens = numberOrZero(usage.input_tokens) + numberOrZero(usage.cache_read_input_tokens) + numberOrZero(usage.cache_creation_input_tokens);
    outputTokens = numberOrZero(usage.output_tokens);
    if (result.stop_reason === 'refusal') throw new ModelProviderError('Claude refused the structured request.', 422);
    if (result.stop_reason === 'max_tokens') throw new ModelProviderError('Claude response reached its output-token limit.', 422);
  } else {
    const result = await postJson('https://api.openai.com/v1/responses', {
      authorization: `Bearer ${apiKey}`,
    }, {
      model,
      input: input.prompt,
      max_output_tokens: input.maxOutputTokens,
      store: false,
      text: { format: { type: 'json_schema', name: 'structured_response', strict: true, schema: input.schema } },
    }, input.signal, 'OpenAI');
    const usage = typeof result.usage === 'object' && result.usage !== null ? result.usage as Record<string, unknown> : {};
    responseModel = typeof result.model === 'string' ? result.model : model;
    inputTokens = numberOrZero(usage.input_tokens);
    outputTokens = numberOrZero(usage.output_tokens);
    if (result.status === 'incomplete') throw new ModelProviderError('OpenAI returned an incomplete structured response.', 422);
    if (typeof result.output_text === 'string') outputText = result.output_text;
    else if (Array.isArray(result.output)) {
      const blocks = result.output.flatMap((item) => typeof item === 'object' && item !== null && 'content' in item && Array.isArray(item.content) ? item.content : []);
      const textBlock = blocks.find((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'output_text');
      outputText = typeof textBlock === 'object' && textBlock !== null && 'text' in textBlock && typeof textBlock.text === 'string' ? textBlock.text : undefined;
      if (blocks.some((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'refusal')) {
        throw new ModelProviderError('OpenAI refused the structured request.', 422);
      }
    }
  }

  return {
    value: parseJsonText(outputText, provider),
    provider,
    model: responseModel,
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateModelCost(provider, model, inputTokens, outputTokens),
  };
}

export async function testModelProvider(provider: string) {
  const result = await generateStructuredJson({
    provider,
    prompt: 'Return the JSON object {"connected":true}.',
    schema: { type: 'object', properties: { connected: { type: 'boolean' } }, required: ['connected'], additionalProperties: false },
    maxOutputTokens: 32,
  });
  const validationErrors = validateJsonSchemaValue(result.value, { type: 'object', properties: { connected: { type: 'boolean' } }, required: ['connected'], additionalProperties: false });
  if (validationErrors.length || (result.value as { connected?: unknown }).connected !== true) {
    throw new ModelProviderError(`${result.provider} connection test returned an unexpected response.`, 502);
  }
  return result;
}

export async function generateText(input: {
  prompt: string;
  provider?: string | null;
  model?: string;
  maxOutputTokens: number;
  signal?: AbortSignal;
}): Promise<TextModelResult> {
  const provider = resolveModelProvider(input.provider);
  const model = input.model?.trim() || defaultModelForProvider(provider);
  const apiKey = process.env[PROVIDER_ENV[provider]]?.trim();
  if (!apiKey) throw new ModelProviderError(`${provider} is not configured. Set ${PROVIDER_ENV[provider]} on the server.`, 503);

  let text = '';
  let responseModel = model;
  let inputTokens = 0;
  let outputTokens = 0;

  if (provider === 'ollama') {
    const result = await ollamaChat(apiKey, { model, messages: [{ role: 'user', content: input.prompt }], options: { num_predict: input.maxOutputTokens } }, input.signal);
    text = result.text;
    responseModel = result.model || model;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
  } else if (provider === 'gemini') {
    const client = new GoogleGenAI({ apiKey });
    try {
      const response = await client.models.generateContent({ model, contents: input.prompt });
      text = response.text || '';
      responseModel = response.modelVersion || model;
      const usage = response.usageMetadata;
      inputTokens = numberOrZero(usage?.promptTokenCount);
      outputTokens = numberOrZero(usage?.candidatesTokenCount);
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : undefined;
      throw new ModelProviderError(status === 503 ? 'Gemini is temporarily unavailable.' : 'Gemini could not complete the request.', status);
    }
  } else if (provider === 'anthropic') {
    const result = await postJson('https://api.anthropic.com/v1/messages', {
      'x-api-key': apiKey,
      'anthropic-version': '2026-10-21',
    }, {
      model,
      max_tokens: input.maxOutputTokens,
      messages: [{ role: 'user', content: input.prompt }],
    }, input.signal, 'Claude');
    const usage = typeof result.usage === 'object' && result.usage !== null ? result.usage as Record<string, unknown> : {};
    const blocks = Array.isArray(result.content) ? result.content : [];
    const textBlock = blocks.find((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'text');
    text = typeof textBlock === 'object' && textBlock !== null && 'text' in textBlock && typeof textBlock.text === 'string' ? textBlock.text : '';
    responseModel = typeof result.model === 'string' ? result.model : model;
    inputTokens = numberOrZero(usage.input_tokens) + numberOrZero(usage.cache_read_input_tokens) + numberOrZero(usage.cache_creation_input_tokens);
    outputTokens = numberOrZero(usage.output_tokens);
    if (result.stop_reason === 'refusal') throw new ModelProviderError('Claude refused the request.', 422);
    if (result.stop_reason === 'max_tokens') throw new ModelProviderError('Claude response reached its output-token limit.', 422);
  } else {
    const result = await postJson('https://api.openai.com/v1/responses', {
      authorization: `Bearer ${apiKey}`,
    }, {
      model,
      input: input.prompt,
      max_output_tokens: input.maxOutputTokens,
      store: false,
      text: { format: { type: 'text' } },
    }, input.signal, 'OpenAI');
    const usage = typeof result.usage === 'object' && result.usage !== null ? result.usage as Record<string, unknown> : {};
    responseModel = typeof result.model === 'string' ? result.model : model;
    inputTokens = numberOrZero(usage.input_tokens);
    outputTokens = numberOrZero(usage.output_tokens);
    if (result.status === 'incomplete') throw new ModelProviderError('OpenAI returned an incomplete response.', 422);
    if (typeof result.output_text === 'string') text = result.output_text;
    else if (Array.isArray(result.output)) {
      const blocks = result.output.flatMap((item) => typeof item === 'object' && item !== null && 'content' in item && Array.isArray(item.content) ? item.content : []);
      const textBlock = blocks.find((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'output_text');
      text = typeof textBlock === 'object' && textBlock !== null && 'text' in textBlock && typeof textBlock.text === 'string' ? textBlock.text : '';
      if (blocks.some((block) => typeof block === 'object' && block !== null && 'type' in block && block.type === 'refusal')) {
        throw new ModelProviderError('OpenAI refused the request.', 422);
      }
    }
  }

  if (!text.trim()) throw new ModelProviderError(`${provider} returned no text.`, 502);
  return { text, provider, model: responseModel, inputTokens, outputTokens, estimatedCostUsd: estimateModelCost(provider, model, inputTokens, outputTokens) };
}

export function validateJsonSchemaValue(value: unknown, schema: unknown, path = '$'): string[] {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) return [`${path}: invalid output schema.`];
  const definition = schema as Record<string, unknown>;
  const errors: string[] = [];
  const type = definition.type;
  const types = Array.isArray(type) ? type : [type];
  const matchesType = types.some((candidate) => {
    if (candidate === 'null') return value === null;
    if (candidate === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
    if (candidate === 'array') return Array.isArray(value);
    if (candidate === 'integer') return typeof value === 'number' && Number.isInteger(value);
    if (candidate === 'number') return typeof value === 'number' && Number.isFinite(value);
    if (candidate === 'string') return typeof value === 'string';
    if (candidate === 'boolean') return typeof value === 'boolean';
    return false;
  });
  if (!matchesType) return [`${path}: value does not match the declared type.`];

  if (Array.isArray(definition.enum) && !definition.enum.some((item) => Object.is(item, value))) {
    errors.push(`${path}: value is not in the allowed enum.`);
  }

  if (typeof value === 'string') {
    if (typeof definition.minLength === 'number' && value.length < definition.minLength) errors.push(`${path}: string is too short.`);
    if (typeof definition.maxLength === 'number' && value.length > definition.maxLength) errors.push(`${path}: string is too long.`);
    if (typeof definition.pattern === 'string') {
      try {
        if (!new RegExp(definition.pattern).test(value)) errors.push(`${path}: string does not match the required pattern.`);
      } catch {
        errors.push(`${path}: string pattern is invalid.`);
      }
    }
  }
  if (typeof value === 'number') {
    if (typeof definition.minimum === 'number' && value < definition.minimum) errors.push(`${path}: number is below its minimum.`);
    if (typeof definition.maximum === 'number' && value > definition.maximum) errors.push(`${path}: number exceeds its maximum.`);
  }

  if (Array.isArray(value)) {
    if (typeof definition.minItems === 'number' && value.length < definition.minItems) errors.push(`${path}: array has too few items.`);
    if (typeof definition.maxItems === 'number' && value.length > definition.maxItems) errors.push(`${path}: array has too many items.`);
    if (definition.items !== undefined) value.forEach((item, index) => errors.push(...validateJsonSchemaValue(item, definition.items, `${path}[${index}]`)));
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;
    const properties = typeof definition.properties === 'object' && definition.properties !== null
      ? definition.properties as Record<string, unknown>
      : {};
    if (Array.isArray(definition.required)) {
      for (const requiredKey of definition.required) {
        if (typeof requiredKey === 'string' && !(requiredKey in objectValue)) errors.push(`${path}.${requiredKey}: required field is missing.`);
      }
    }
    for (const [key, propertyValue] of Object.entries(objectValue)) {
      if (key in properties) errors.push(...validateJsonSchemaValue(propertyValue, properties[key], `${path}.${key}`));
      else if (definition.additionalProperties === false) errors.push(`${path}.${key}: additional property is not allowed.`);
      else if (typeof definition.additionalProperties === 'object') errors.push(...validateJsonSchemaValue(propertyValue, definition.additionalProperties, `${path}.${key}`));
    }
  }

  return errors;
}