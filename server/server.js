import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import authRouter from "./routes/authRoutes.js";
import cors from "cors";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors("*"));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/auth",authRouter);

const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect(`mongodb+srv://sameersheikhmansoori:kKP9icZZROb27hHE@cluster0.wkynkce.mongodb.net/videochat?retryWrites=true&w=majority`)

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log("LISTENIN ON PORT 8000")
    });



}



start();