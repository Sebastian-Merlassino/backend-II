import { Router } from "express";
import userModel from '../models/userModel.js';

const router = Router();

router.post("/register", async (req, res) => {
    const { name, age, email, password } = req.body;
    // Lógica para registrar al usuario
    try {
        const result = await userModel.create({name, age, email, password});
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // Lógica para autenticar al usuario
    try {
        const user = await userModel.findOne({email: email});
        if (!user) {
            return res.status(401).send({
                status: 'error',
                message: 'Invalid credentials'
            });
        }
        if (user.password !== password) {
            return res.status(401).send({
                status: 'error',
                message: 'Invalid credentials'
            });
        }
        res.send({
            status: 'success',
            payload: user
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
});   



export default router;