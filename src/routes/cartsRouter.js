import { Router } from 'express';
import CartsRepository from '../repositories/cartsRepository.js';
import ProductsRepository from '../repositories/productsRepository.js';
import TicketsRepository from '../repositories/ticketsRepository.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const cartsRepo = new CartsRepository();
const productsRepo = new ProductsRepository();
const ticketsRepo = new TicketsRepository();

router.post('/', authorizeRoles('user', 'admin'), async (req, res) => {
    try {
        const cart = await cartsRepo.create({ products: [] });
        res.status(201).send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.post('/:cid/product/:pid', authorizeRoles('user'), async (req, res) => {
    try {
        const cart = await cartsRepo.findById(req.params.cid);
        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        const product = await productsRepo.findById(req.params.pid);
        if (!product) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        const quantity = parseInt(req.body.quantity) || 1;
        const existing = cart.products.find(p => p.product.toString() === product._id.toString());
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.products.push({ product: product._id, quantity });
        }
        await cart.save();
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

router.post('/:cid/purchase', authorizeRoles('user'), async (req, res) => {
    try {
        const cart = await cartsRepo.findById(req.params.cid);
        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        const purchasedProducts = [];
        const outOfStock = [];
        for (const item of cart.products) {
            const product = await productsRepo.findById(item.product);
            if (!product) continue;
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save();
                purchasedProducts.push({ product: product._id, quantity: item.quantity, price: product.price });
            } else {
                outOfStock.push({ product: product._id, available: product.stock, requested: item.quantity });
            }
        }
        if (purchasedProducts.length === 0) {
            return res.status(400).send({ status: 'error', message: 'No hay productos en stock' });
        }
        const amount = purchasedProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
        const ticketData = {
            code: uuidv4(),
            amount,
            purchaser: req.user.email,
            products: purchasedProducts.map(({ product, quantity }) => ({ product, quantity })),
        };
        const ticket = await ticketsRepo.create(ticketData);
        cart.products = cart.products.filter(item =>
            !purchasedProducts.find(p => p.product.toString() === item.product.toString())
        );
        await cart.save();
        res.send({
            status: 'success',
            payload: {
                ticket,
                outOfStock,
            },
        });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

export default router;
