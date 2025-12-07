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

//const JWT_SECRET = process.env.JWT_SECRET as string;
//const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const app = express();
const PORT = process.env.PORT || 5510;

// Middleware
app.use(cors({
  origin: "https://irtep.github.io",
  credentials: true,
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://irtep.github.io");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});

app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://irtep.github.io");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  return res.sendStatus(200);
});

app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigsRoutes);

https.createServer(options, app).listen(PORT, () => {
  console.log('version 1.1.3');
  console.log(`HTTPS server running on https://193.28.89.151:${PORT}`);
});