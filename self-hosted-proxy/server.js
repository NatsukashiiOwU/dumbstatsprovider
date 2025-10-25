/**
 * Self-Hosted Proxy Server for OverStats API
 * Deploy this on your own VPS in another country to bypass ISP blocks
 *
 * Features:
 * - Full CORS support
 * - Request caching
 * - Rate limiting
 * - Health monitoring
 * - Easy deployment
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Target API
const TARGET_API = 'https://overstat.gg';

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow all origins for now - restrict in production if needed
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: false,
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${ip} - ${req.get('User-Agent') || 'Unknown'}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const startTime = Date.now();

        // Test connection to target API
        const testResponse = await fetch(`${TARGET_API}/api/settings/match_list/13yog`, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'OverStats-Proxy-Health-Check/1.0'
            },
            timeout: 10000
        });

        const responseTime = Date.now() - startTime;

        const health = {
            status: 'healthy',
            proxy: {
                version: '1.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                pid: process.pid
            },
            target: {
                url: TARGET_API,
                reachable: testResponse.ok,
                responseTime: responseTime,
                status: testResponse.status,
                statusText: testResponse.statusText
            },
            timestamp: new Date().toISOString(),
            server: {
                node: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        res.json(health);
    } catch (error) {
        console.error('[HEALTH] Error:', error.message);

        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Status page
app.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OverStats Self-Hosted Proxy</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #0d1117;
            color: #c9d1d9;
            line-height: 1.5;
        }
        .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .status {
            background: #161b22;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #238636;
        }
        .example {
            background: #21262d;
            padding: 15px;
            border-radius: 8px;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            overflow-x: auto;
            border: 1px solid #30363d;
        }
        .url {
            color: #58a6ff;
            word-break: break-all;
        }
        .btn {
            display: inline-block;
            background: #238636;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            margin: 4px;
            font-size: 14px;
        }
        .btn:hover {
            background: #2ea043;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .feature {
            background: #161b22;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #30363d;
        }
        .feature h4 {
            margin: 0 0 10px 0;
            color: #58a6ff;
        }
        pre {
            background: #0d1117;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #30363d;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 OverStats Self-Hosted Proxy</h1>
        <p>Your private proxy server for bypassing country restrictions</p>
    </div>

    <div class="status">
        <h3>✅ Proxy Status: Online</h3>
        <p><strong>Server Location:</strong> Your VPS</p>
        <p><strong>Target API:</strong> ${TARGET_API}</p>
        <p><strong>CORS:</strong> Enabled for all origins</p>
        <p><strong>Rate Limit:</strong> 1000 requests per 15 minutes per IP</p>
        <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
    </div>

    <h3>📖 Usage Instructions</h3>

    <div class="example">
        <strong>Original API:</strong><br>
        <span class="url">https://overstat.gg/api/match/12345</span><br><br>

        <strong>Your Proxy:</strong><br>
        <span class="url">${baseUrl}/api/match/12345</span>
    </div>

    <h3>🧪 Test Endpoints</h3>
    <a href="${baseUrl}/api/settings/match_list/13yog" class="btn" target="_blank">Test Match List</a>
    <a href="${baseUrl}/health" class="btn">Health Check</a>

    <h3>🌟 Features</h3>
    <div class="feature-list">
        <div class="feature">
            <h4>🛡️ Security</h4>
            <p>Rate limiting, CORS protection, request filtering</p>
        </div>
        <div class="feature">
            <h4>⚡ Performance</h4>
            <p>Compression, caching, optimized routing</p>
        </div>
        <div class="feature">
            <h4>📊 Monitoring</h4>
            <p>Health checks, request logging, error tracking</p>
        </div>
        <div class="feature">
            <h4>🌍 Global</h4>
            <p>Bypass country blocks, ISP filtering, geo-restrictions</p>
        </div>
    </div>

    <h3>🔧 Integration</h3>
    <p>Update your scoreboard configuration:</p>
    <div class="example">
        <pre>// In src/utils/deployedProxy.ts
const DEPLOYED_PROXIES = [
    {
        name: 'Your VPS Proxy',
        url: '${baseUrl}',
        type: 'direct',
        priority: 1,
        regions: ['global']
    }
];</pre>
    </div>

    <h3>📊 Performance Benefits</h3>
    <ul>
        <li>✅ <strong>Dedicated Resources:</strong> No sharing with other users</li>
        <li>✅ <strong>Custom Optimization:</strong> Tuned for your specific needs</li>
        <li>✅ <strong>Reliable Uptime:</strong> Full control over server maintenance</li>
        <li>✅ <strong>Low Latency:</strong> Choose server location closest to users</li>
        <li>✅ <strong>No Rate Limits:</strong> Set your own reasonable limits</li>
        <li>✅ <strong>Full Monitoring:</strong> Complete visibility into performance</li>
    </ul>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #30363d;">
        <p style="color: #7c3aed;">
            <strong>Self-Hosted OverStats Proxy Server</strong><br>
            <small>Powered by Node.js • Express • Your VPS</small>
        </p>
    </div>
</body>
</html>`;

    res.send(html);
});

// Proxy middleware configuration
const proxyMiddleware = createProxyMiddleware({
    target: TARGET_API,
    changeOrigin: true,
    secure: true,
    followRedirects: true,
    timeout: 30000,

    // Custom headers to avoid detection
    onProxyReq: (proxyReq, req, res) => {
        // Remove problematic headers
        proxyReq.setHeader('host', 'overstat.gg');
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');

        // Add headers to look like regular browser traffic
        // proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        // proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        // proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
        // proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
        // proxyReq.setHeader('Cache-Control', 'no-cache');
        // proxyReq.setHeader('Pragma', 'no-cache');
        // proxyReq.setHeader('Sec-Fetch-Site', 'cross-site');
        // proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
        // proxyReq.setHeader('Sec-Fetch-Dest', 'empty');
        proxyReq.setHeader('User-Agent', 'curl/8.0 (proxy-check)');
        proxyReq.setHeader('Accept', '*/*');

        console.log(`[PROXY] ${req.method} ${TARGET_API}${req.url} - ${req.ip}`);
    },

    onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.url}`);

        // Ensure CORS headers are set
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent';
        proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Type';

        // Add cache headers for better performance
        if (req.method === 'GET' && proxyRes.statusCode === 200) {
            proxyRes.headers['Cache-Control'] = 'public, max-age=300'; // 5 minutes
        }
    },

    onError: (err, req, res) => {
        console.error(`[PROXY] Error for ${req.url}:`, err.message);

        res.status(502).json({
            error: 'Proxy Error',
            message: 'Failed to fetch data from target API',
            details: err.message,
            timestamp: new Date().toISOString(),
            url: req.url
        });
    }
});

// Apply proxy to /api/* routes
app.use('/api', proxyMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found',
        availableEndpoints: [
            '/ - Status page',
            '/health - Health check',
            '/api/* - Proxy to overstat.gg/api/*'
        ],
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[SERVER] Error:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 OverStats Self-Hosted Proxy Server Started');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🌐 Proxying: ${TARGET_API} -> http://localhost:${PORT}/api`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🎯 Ready to bypass country restrictions!');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});