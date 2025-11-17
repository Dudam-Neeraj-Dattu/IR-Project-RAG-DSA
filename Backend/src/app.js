import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true,
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

const staticDir = path.join(process.cwd(), 'build');
app.use(express.static(staticDir));

app.get('/', (req, res) => {
   res.sendFile(path.join(staticDir, 'index.html'));
})

import problemRouter from './routes/problem.route.js';

app.use('/api/v1/problems', problemRouter);

export default app;