import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const databaseConnection = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log(`/n Database Connected !!! connection host is ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error: ", error);
        process.exit(1);
    }
}

export default databaseConnection