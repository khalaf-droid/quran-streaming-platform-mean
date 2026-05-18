import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import userRouter from "./routes/User.routes.js";
import surahRouter from "./routes/Surah.routes.js";
import reciterRouter from "./routes/Reciter.routes.js";
import recitationRouter from "./routes/Recitation.routes.js";
import collectionRouter from "./routes/Collection.routes.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true
}));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static Files
app.use("/upload", express.static(path.join(__dirname, "../upload")));

// Swagger UI — only available in development
if (process.env.NODE_ENV !== "production") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "Quran App API Docs",
        customCss: `
            .swagger-ui .topbar { background: linear-gradient(135deg, #1a472a, #2d6a4f); }
            .swagger-ui .topbar-wrapper img { content: url(''); }
            .swagger-ui .topbar-wrapper::before { content: 'Quran App API'; color: white; font-size: 1.5rem; font-weight: bold; }
        `,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
        },
    }));

    // Also expose raw JSON spec for tools like Postman
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(" Swagger Docs available at: http://localhost:5000/api-docs");
}

// API Routes
app.use("/api/users", userRouter);
app.use("/api/surahs", surahRouter);
app.use("/api/reciters", reciterRouter);
app.use("/api/recitations", recitationRouter);
app.use("/api/collections", collectionRouter);

// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Quran App Clone API Running"
    });
});

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

export default app;