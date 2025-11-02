import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true,
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
   res.send('Welcome to the RAG DSA Backend!');
})

import problemRouter from './routes/problem.route.js';

app.use('/api/v1/problems', problemRouter);

export default app;