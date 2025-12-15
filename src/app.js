import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import userRouter from "./routes/userRouter.js";
import sessionRouter from "./routes/sessionRouter.js";
import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import passwordRouter from "./routes/passwordRouter.js";
import configurePassport from "./config/passport.config.js";

dotenv.config();
const app = express();

// Conexión a MongoDB

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
const MONGO_DB = process.env.MONGO_DB || "ecommerce";
mongoose
    .connect(MONGO_URI, { dbName: MONGO_DB })
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

// Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de Passport

configurePassport();
app.use(passport.initialize());

// Rutas

app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/password", passwordRouter);

// Manejo de rutas no encontradas

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Start Server in Port ${PORT}`);
});
