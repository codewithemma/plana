import * as dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
const app = express();
const PORT = 3000;

// router
import authRouter from "./routes/authRoutes";

// middlewares
app.use(express.json());

// routes
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("hello world");
});

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error, "Something went wrong");
  }
};

start();
