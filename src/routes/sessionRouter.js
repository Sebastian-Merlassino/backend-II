import { Router } from "express";
import userModel from "../models/userModel.js";
import { createHash, isValidPassword } from "../utils.js";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = Router();
const SECRET = process.env.JWT_SECRET || "secretJWT";

// Registro de usuario
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, age, email, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            return res
                .status(400)
                .send({ status: "error", message: "Faltan campos obligatorios" });
        }
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res
                .status(400)
                .send({ status: "error", message: "El usuario ya existe" });
        }
        const hashedPassword = createHash(password);
        const user = await userModel.create({
            first_name,
            last_name,
            age,
            email,
            password: hashedPassword,
        });
        res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

// Login de usuario
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .send({ status: "error", message: "Credenciales inválidas" });
        }
        if (!isValidPassword(password, user.password)) {
            return res
                .status(401)
                .send({ status: "error", message: "Credenciales inválidas" });
        }
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, SECRET, { expiresIn: "24h" });
        res.cookie("token", token, { httpOnly: true });
        res.send({ status: "success", payload: { token } });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

// Ruta protegida para obtener el usuario actual
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.send({ status: "success", payload: req.user });
    }
);

export default router;
