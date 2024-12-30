import * as dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
const app = express();
const PORT = 3000;

// router
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import eventRouter from "./routes/eventRoutes";
import paymentSubscriptionRouter from "./routes/paymentSubscriptionRoutes";

//middleware
import errorHandlerMiddleware from "./middleware/error-handler";
import notFound from "./middleware/notFound";

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload({ useTempFiles: true }));

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/payments", paymentSubscriptionRouter);

app.use(errorHandlerMiddleware);
app.use(notFound);

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
