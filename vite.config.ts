import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { MAX_REQUEST_BODY_BYTES, processGatewayRequest, type GatewayRequest } from './server/openaiGateway';

const localApiPlugin = (apiKey?: string) => ({
  name: 'emopatch-local-api',
  configureServer(server: any) {
    server.middlewares.use('/api/ai', async (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { code: 'method_not_allowed', message: 'POST only.' } }));
        return;
      }

      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          // Mirror the Vercel body limit so oversized uploads fail locally too.
          if (size > MAX_REQUEST_BODY_BYTES) throw new Error('Request body is too large.');
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as GatewayRequest;
        const result = await processGatewayRequest(body, apiKey);
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(result.body));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: { code: 'invalid_request', message: error instanceof Error ? error.message : 'Invalid request.' },
        }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), localApiPlugin(env.OPENAI_API_KEY)],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
