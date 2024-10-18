import ProductManager from '../managers/ProductManager.js';

export const getProducts = async (req, res) => {
    await ProductManager.loadProducts();
    const limit = parseInt(req.query.limit);
    const products = (!isNaN(limit) && limit > 0) ? ProductManager.products.slice(0, limit) : ProductManager.products;
    res.status(200).json(products);
};

export const getProductById = async (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = ProductManager.findProduct(productId);
    if (!product) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }
    res.status(200).json(product);
};

export const createProduct = async (req, res) => {
    const newProduct = ProductManager.addProduct(req.body);
    await ProductManager.saveProducts();
    res.status(201).json(newProduct);
};

export const updateProduct = async (req, res) => {
    const productId = parseInt(req.params.pid);
    const updatedProduct = ProductManager.updateProduct(productId, req.body);
    if (!updatedProduct) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }
    await ProductManager.saveProducts();
    res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req, res) => {
    const productId = parseInt(req.params.pid);
    ProductManager.deleteProduct(productId);
    await ProductManager.saveProducts();
    res.status(204).send();
};
