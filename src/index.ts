import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

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

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const app = express();
const PORT = process.env.PORT || 5509;

// Middleware
app.use(cors({
    origin: [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/193\.28\.89\.151:5509$/] // both http and https for my ip and all localhosts
}));

app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigsRoutes);

app.listen(PORT, () => {
    console.log(`rig garage API, version 0.3.0`);
    console.log(`Server running at http://localhost:${PORT}`);
});