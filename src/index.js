import dotenv from 'dotenv';
import databaseConnection from './db/db.js';
import { app } from './app.js';
dotenv.config({
    path: './.env'
})

databaseConnection()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is listning at port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(`Database Connection Failed !!!`, error)
})