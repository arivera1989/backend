import fs from "fs/promises";
import path from "path";

const carritoPath = path.resolve('./data/carritos.json');

class CartManager {
    constructor() {
        this.carts = [];
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(carritoPath, 'utf-8');
            this.carts = JSON.parse(data) || [];
        } catch (error) {
            console.error("Error al cargar carritos:", error);
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(carritoPath, JSON.stringify(this.carts, null, 2), 'utf-8');
        } catch (error) {
            console.error("Error al guardar carritos:", error);
        }
    }

    findCart(cid) {
        return this.carts.find(cart => cart.id === cid);
    }

    createCart() {
        const newId = this.carts.length > 0 ? Math.max(...this.carts.map(cart => cart.id)) + 1 : 1;
        const newCart = { id: newId, products: [] };
        this.carts.push(newCart);
        return newCart;
    }

    addProductToCart(cid, pid) {
        const cart = this.findCart(cid);
        if (cart) {
            const existingProduct = cart.products.find(p => p.product === pid);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }
        }
        return cart;
    }
}

export default new CartManager();
