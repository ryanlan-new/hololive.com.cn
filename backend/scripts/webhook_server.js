import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Utilities for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 3000;
const SECRET = process.env.WEBHOOK_SECRET || 'changeme'; // Should be set in environment
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy_local.sh');

const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Gitee sends the secret in the X-Gitee-Token header
        const token = req.headers['x-gitee-token'];

        // Also strictly verify user-agent
        const userAgent = req.headers['user-agent'];

        console.log(`[Webhook] Received request from ${userAgent}`);

        if (token !== SECRET) {
            console.error('[Webhook] Invalid Token');
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        if (req.url === '/webhook/gitee') {
            console.log('[Webhook] Triggering deployment...');

            // Execute shell script
            const deploy = spawn('bash', [DEPLOY_SCRIPT], {
                cwd: path.dirname(__dirname), // backend/
                stdio: 'inherit' // Pipe output to parent process (systemd logs)
            });

            deploy.on('close', (code) => {
                console.log(`[Deployment] Child process exited with code ${code}`);
            });

            res.writeHead(200);
            res.end('Deployment Triggered');
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Webhook server listening on 127.0.0.1:${PORT}`);
});
