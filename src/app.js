import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parse'

const app = express();

app.use(express.json({limit: '100kb'}));
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(cookieParser());


export {app}