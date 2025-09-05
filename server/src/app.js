import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";
import { config } from "./config/index.js";

const app = express();

app.use(cors(config.cors));

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const parts = message.split(" ");
        const logObject = {
          method: parts[0],
          url: parts[1],
          status: parts[2],
          responseTime: parts[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(express.json({ limit: "50kb" }));

app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//routes import
import userRouter from "./features/user/user.routes.js";
import healthRouter from "./routes/health.routes.js";

//routes declaration
app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);
export default app;
