import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/mailer.js';
import UsersRepository from '../repositories/usersRepository.js';
import { createHash, isValidPassword } from '../utils.js';

const router = Router();
const usersRepo = new UsersRepository();
const SECRET = process.env.RESET_SECRET || 'resetSecret';
const APP_URL = process.env.APP_URL || 'http://localhost:8080';

router.post('/forgot', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await usersRepo.findByEmail(email);
        if (!user) {
            return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
        }
        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
        const resetLink = `${APP_URL}/api/password/reset?token=${token}`;
        const html = `<p>Hola ${user.first_name},</p><p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><a href=\"${resetLink}\">Restablecer contraseña</a><p>Este enlace caducará en 1 hora.</p>`;
        await sendEmail({ to: email, subject: 'Restablecer contraseña', html });
        res.send({ status: 'success', message: 'Correo enviado' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.post('/reset', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token) return res.status(400).send({ status: 'error', message: 'Token requerido' });
        const decoded = jwt.verify(token, SECRET);
        const user = await usersRepo.findById(decoded.id);
        if (!user) {
            return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
        }
        if (isValidPassword(password, user.password)) {
            return res.status(400).send({ status: 'error', message: 'La nueva contraseña debe ser diferente de la actual' });
        }
        const hashed = createHash(password);
        await usersRepo.updateById(user._id, { password: hashed });
        res.send({ status: 'success', message: 'Contraseña actualizada' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).send({ status: 'error', message: 'El enlace de restablecimiento ha expirado' });
        }
        res.status(500).send({ status: 'error', message: error.message });
    }
});

export default router;
