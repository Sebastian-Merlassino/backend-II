
import { Router } from 'express';
import CartsRepository from '../repositories/cartsRepository.js';
import ProductsRepository from '../repositories/productsRepository.js';
import TicketsRepository from '../repositories/ticketsRepository.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const cartsRepo = new CartsRepository();
const productsRepo = new ProductsRepository();
const ticketsRepo = new TicketsRepository();

// Crear un carrito (usuario o admin)
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const cart = await cartsRepo.create({ products: [] });
            res.status(201).send({ status: 'success', payload: cart });
        } catch (error) {
            res.status(500).send({ status: 'error', message: error.message });
        }
    }
);

// Agregar un producto al carrito (sólo usuario)
router.post(
    '/:cid/product/:pid',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
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
    }
);

// Procesar una compra (sólo usuario)
router.post(
    '/:cid/purchase',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles('user'),
    async (req, res) => {
        try {
            const cart = await cartsRepo.findById(req.params.cid);
            if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

            const purchasedProducts = [];
            const outOfStock = [];

            for (const item of cart.products) {
                const product = await productsRepo.findById(item.product);
                if (!product) continue;

                if (product.stock >= item.quantity) {
                    // Descontar stock a través del repositorio para mantener el patrón Repository
                    await productsRepo.updateById(product._id, {
                        stock: product.stock - item.quantity
                    });
                    // Calcular el precio usando el stock anterior
                    purchasedProducts.push({
                        product: product._id,
                        quantity: item.quantity,
                        price: product.price
                    });
                    // Actualizar variable local para cálculo correcto posterior si hiciera falta
                    product.stock -= item.quantity;
                } else {
                    outOfStock.push({
                        product: product._id,
                        available: product.stock,
                        requested: item.quantity
                    });
                }
            }

            if (purchasedProducts.length === 0) {
                return res.status(400).send({ status: 'error', message: 'No hay productos en stock' });
            }

            // Calcular monto total y crear ticket
            const amount = purchasedProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
            const ticketData = {
                code: uuidv4(),
                amount,
                purchaser: req.user.email,
                products: purchasedProducts.map(({ product, quantity }) => ({
                    product,
                    quantity
                }))
            };

            const ticket = await ticketsRepo.create(ticketData);

            // Remover del carrito los productos adquiridos
            cart.products = cart.products.filter(item =>
                !purchasedProducts.find(p => p.product.toString() === item.product.toString())
            );
            await cart.save();

            res.send({
                status: 'success',
                payload: {
                    ticket,
                    outOfStock
                }
            });
        } catch (error) {
            res.status(500).send({ status: 'error', message: error.message });
        }
    }
);

export default router;
