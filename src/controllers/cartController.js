import CartManager from '../managers/CartManager.js';

export const createCart = async (req, res) => {
    const newCart = CartManager.createCart();
    await CartManager.saveCarts();
    res.status(201).json(newCart);
};

export const getCartById = async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = CartManager.findCart(cartId);
    if (!cart) {
        return res.status(404).json({ error: `Carrito con id ${cartId} no encontrado.` });
    }
    res.status(200).json(cart.products);
};

export const addProductToCart = async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const cart = CartManager.addProductToCart(cartId, productId);
    if (!cart) {
        return res.status(404).json({ error: `Carrito con id ${cartId} no encontrado.` });
    }
    await CartManager.saveCarts();
    res.status(200).json(cart.products);
};
