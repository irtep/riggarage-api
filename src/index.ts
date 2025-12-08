import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';

import authRoutes from './routes/auth';
import rigsRoutes from './routes/rigs';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const app = express();
const PORT = process.env.PORT || 5510;

app.use(helmet());

app.use(cors({
  origin: "https://riggarage.irtep.com", // <-- your frontend domain
  credentials: true,                      // if you send cookies / auth headers
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigsRoutes);

// Test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    corsHeaders: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

https.createServer(options, app).listen(PORT, () => {
  console.log('🚀 DEBUG MODE: Permissive CORS enabled');
  console.log(`📋 Version: 1.1.8-DEBUG`);
  console.log(`🔐 Server: https://193.28.89.151:${PORT}`);
  console.log(`⚠️  WARNING: This configuration is for debugging only!`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
});