import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import messageRoute from "./routes/message.route.js";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";
dotenv.config();

const PORT = process.env.PORT || 8000;

const __dirname = path.resolve();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const CorsOptions = {
  origin: "https://bit-mitra.onrender.com",
  credentials: true,
};

app.use(cors(CorsOptions));

// yha pr apniapi aayengea

app.use("/api/v1/user", userRoute);

app.use("/api/v1/message", messageRoute);
app.use("/api/v1/post", postRoute);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
})

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
