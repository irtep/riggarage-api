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

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const app = express();
const PORT = process.env.PORT || 5510;

// Middleware
app.use(
    cors({
        origin: [
            // Local development
            "http://localhost:3000",
            "http://localhost:5509",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5509",

            "https://irtep.github.io",

            "https://irtep.github.io/riggarage"
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);

app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigsRoutes);

/*
app.listen(PORT, () => {
    console.log(`rig garage API, version 0.4.1`);
    console.log(`Server running at http://localhost:${PORT}`);
});
*/
https.createServer(options, app).listen(PORT, () => {
  console.log('version 1.1.0');
  console.log(`HTTPS server running on https://193.28.89.151:${PORT}`);
});