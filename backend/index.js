import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import messageRoute from './routes/message.route.js'
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from './routes/post.route.js'
import { app, server } from "./socket/socket.js";
dotenv.config();



const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I'm coming from the backend",
    success: true,
  });
});

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(CorsOptions));

// yha pr apniapi aayengea

app.use("/api/v1/user", userRoute);

app.use("/api/v1/message", messageRoute)
app.use("/api/v1/post", postRoute);

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
