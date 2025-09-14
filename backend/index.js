import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//configs
import connectDB from './src/config/db.js';

//routes
import authRoutes from './src/routes/authRoutes.js'
import pdfRoutes from './src/routes/pdfRoutes.js'
import highlightRoutes from './src/routes/highlightRoutes.js'

const app = express();
dotenv.config();
app.use(cors({
    origin: [process.env.LOCALHOST_FRONTEND_URL, process.env.PRODUCTION_FRONTEND_URL],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes)
app.use('/api/pdfs', pdfRoutes)
app.use('/api/highlights', highlightRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});