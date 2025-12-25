import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.json({limit: '100kb'}));
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(cookieParser());


// Import Routes
import userRoutes from './routes/user.routes.js'

// Routes Declearation
app.use("/api/v1/users", userRoutes)


export {app}