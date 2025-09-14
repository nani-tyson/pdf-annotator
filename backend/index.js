import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//configs
import connectDB from './src/config/db.js';

//routes
import authRoutes from './src/routes/authRoutes.js'

const app = express();
dotenv.config();
app.use(cors({
    origin: [process.env.LOCALHOST_FRONTEND_URL, process.env.PRODUCTION_FRONTEND_URL],
    credentials: true,
}));
app.use(express.json());


const PORT = process.env.PORT || 3000;

app.use('api/auth', authRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});