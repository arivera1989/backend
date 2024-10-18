import { Router } from 'express';
import { createCart, getCartById, addProductToCart } from '../controllers/cartController.js';

const router = Router();

router.post("/", createCart);
router.get("/:cid", getCartById);
router.post("/:cid/products/:pid", addProductToCart);

export default router;
