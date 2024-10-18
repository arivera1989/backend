import fs from "fs/promises";
import path from "path";

const productosPath = path.resolve('./data/productos.json');

class ProductManager {
    constructor() {
        this.products = [];
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(productosPath, 'utf-8');
            this.products = JSON.parse(data) || [];
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(productosPath, JSON.stringify(this.products, null, 2), 'utf-8');
        } catch (error) {
            console.error("Error al guardar productos:", error);
        }
    }

    findProduct(pid) {
        return this.products.find(product => product.id === pid);
    }

    addProduct(product) {
        const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newId, ...product, status: true };
        this.products.push(newProduct);
        return newProduct;
    }

    updateProduct(pid, update) {
        const index = this.products.findIndex(p => p.id === pid);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...update };
            return this.products[index];
        }
        return null;
    }

    deleteProduct(pid) {
        const index = this.products.findIndex(p => p.id === pid);
        if (index !== -1) {
            this.products.splice(index, 1);
        }
    }
}

export default new ProductManager();
