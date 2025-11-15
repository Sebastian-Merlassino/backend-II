import { Router } from 'express';
import userModel from '../models/userModel.js';
import { createHash, isValidPassword } from '../utils.js';

const router = Router();

// Consultar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userModel.find().lean();
        res.send({
            status: 'success',
            payload: users
        });
    }
    catch (error) {
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }


});

// Crear un usuario (CRUD)
router.post("/", async (req, res) => {
    try {
        const { first_name, last_name, age, email, password, role, cart } = req.body;
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
            role: role || "user",
            cart: cart || null,
        });
        res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

// Actualizar un usuario (CRUD)
router.put("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userModel.findById(uid);
        if (!user)
            return res
                .status(404)
                .send({ status: "error", message: "Usuario no encontrado" });

        const { first_name, last_name, age, email, password, role } = req.body;
        if (email && email !== user.email) {
            const exist = await userModel.findOne({ email });
            if (exist) {
                return res
                    .status(400)
                    .send({ status: "error", message: "El email ya está en uso" });
            }
            user.email = email;
        }
        user.first_name = first_name ?? user.first_name;
        user.last_name = last_name ?? user.last_name;
        user.age = age ?? user.age;
        user.role = role ?? user.role;
        if (password) {
            user.password = createHash(password);
        }
        await user.save();
        res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

// Eliminar usuario (CRUD)
router.delete("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const result = await userModel.deleteOne({ _id: uid });
        res.send({ status: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});

export default router;