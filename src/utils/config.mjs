import { config } from "dotenv";

export const initConfig = () => {
    config();
    const port = process.env.PORT || 8080;

    const connectionString = process.env.MONGODB_CONNECTION_STRING

    if (!connectionString) {
        throw new Error("MONGODB_connectionString is not set");
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
        throw new Error("jwtSecret is not set");
    }

    return {
        port: port,
        connectionString: connectionString,
        jwtSecret: jwtSecret
    };
}


