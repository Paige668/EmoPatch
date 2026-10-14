import { MAX_REQUEST_BODY_BYTES, processGatewayRequest, type GatewayRequest } from '../server/openaiGateway';

interface ApiRequest {
  method?: string;
  body?: GatewayRequest | string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

// Best-effort, per-instance limiter for a public demo. One full reflection uses
// 4–6 requests, and judges at one venue often share an IP, so the default is
// generous. Configure RATE_LIMIT_MAX_REQUESTS per deployment, and rely on an
// OpenAI project spend limit as the hard cap.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 80;
const requestWindows = new Map<string, { count: number; resetAt: number }>();

const header = (req: ApiRequest, name: string): string | undefined => {
  const value = req.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
};

const getClientAddress = (req: ApiRequest): string => {
  const forwarded = header(req, 'x-forwarded-for')?.split(',')[0];
  return forwarded?.trim() || req.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (clientAddress: string): boolean => {
  const now = Date.now();
  if (requestWindows.size > 5_000) {
    for (const [key, window] of requestWindows) {
      if (window.resetAt <= now) requestWindows.delete(key);
    }
  }
  const current = requestWindows.get(clientAddress);
  if (!current || current.resetAt <= now) {
    requestWindows.set(clientAddress, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
};

// Browsers always send Origin on cross-site POSTs. Rejecting foreign origins
// keeps other sites from using this endpoint as a free OpenAI proxy.
// ALLOWED_ORIGINS (comma-separated) can add extra origins, e.g. a custom domain.
const isAllowedOrigin = (req: ApiRequest): boolean => {
  const origin = header(req, 'origin');
  if (!origin) return true;
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;
  try {
    const host = header(req, 'x-forwarded-host') || header(req, 'host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: { code: 'method_not_allowed', message: 'POST only.' } });
    return;
  }

  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: { code: 'forbidden_origin', message: 'Origin not allowed.' } });
    return;
  }

  if (Number(header(req, 'content-length')) > MAX_REQUEST_BODY_BYTES) {
    res.status(413).json({ error: { code: 'payload_too_large', message: 'Request body is too large.' } });
    return;
  }

  if (isRateLimited(getClientAddress(req))) {
    res.status(429).json({
      error: { code: 'demo_rate_limit', message: 'Too many requests. Please try again in a few minutes.' },
    });
    return;
  }

  let body: GatewayRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body as GatewayRequest;
  } catch {
    res.status(400).json({ error: { code: 'invalid_json', message: 'Invalid JSON body.' } });
    return;
  }

  const result = await processGatewayRequest(body, process.env.OPENAI_API_KEY);
  res.status(result.status).json(result.body);
}
