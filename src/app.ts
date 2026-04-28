import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundHandler from "./app/middlewares/notFoundHandler";
import path from "path";
import cors from "cors";
import { BaseRouter } from "./app/routes";

const app: Application = express();

app.use(cors());

//Parsers
app.use(express.json());

  // ✅ static middleware FIRST
  app.use("/uploads", express.static("public/uploads"));

// Route
app.use("/api", BaseRouter);

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Global error handler
app.use(globalErrorHandler);

//Handling not found
app.use(notFoundHandler);

export default app;
