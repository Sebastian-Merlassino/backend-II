import { Router } from 'express';
import ProductsRepository from '../repositories/productsRepository.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';

const router = Router();
const productsRepo = new ProductsRepository();

router.get('/', async (req, res) => {
    try {
        const products = await productsRepo.findAll();
        res.send({ status: 'success', payload: products });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productsRepo.findById(req.params.pid);
        if (!product) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.post('/', authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await productsRepo.create(req.body);
        res.status(201).send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.put('/:pid', authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await productsRepo.updateById(req.params.pid, req.body);
        if (!product) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.delete('/:pid', authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await productsRepo.deleteById(req.params.pid);
        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

export default router;
