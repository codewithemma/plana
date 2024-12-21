import * as dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
const app = express();
const PORT = 3000;

// router
import authRouter from "./routes/authRoutes";

//middleware
import errorHandlerMiddleware from "./middleware/error-handler";

// middlewares
app.use(express.json());

// routes
app.use("/api/v1/auth", authRouter);

app.use(errorHandlerMiddleware);

app.get("/", (req, res) => {
  res.send("Plana App");
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
