import express from "express";
import fs from "fs/promises";
import path from "path";

const PORT = 8080;
const app = express();
app.use(express.json());



const productosPath = path.resolve('./data/productos.json');
const carritoPath = path.resolve('./data/carritos.json');
const docsPath = path.resolve('./data/docs.txt');

let products = [];
let carts = [];
let docs = [];

const loadDocs = async () => {
    try {
        const data = await fs.readFile(docsPath, 'utf-8');
        return data; // Devuelve el contenido del archivo de texto
    } catch (error) {
        console.error("Error al cargar documentos:", error);
        return null; // Devuelve null en caso de error
    }
};

const loadProducts = async () => {
    try {
        const data = await fs.readFile(productosPath, 'utf-8');
        products = JSON.parse(data) || [];
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
};

const loadCarts = async () => {
    try {
        const data = await fs.readFile(carritoPath, 'utf-8');
        carts = JSON.parse(data) || [];
    } catch (error) {
        console.error("Error al cargar carritos:", error);
    }
};

const saveProducts = async () => {
    try {
        await fs.writeFile(productosPath, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al guardar productos:", error);
    }
};

const saveCarts = async () => {
    try {
        await fs.writeFile(carritoPath, JSON.stringify(carts, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al guardar carritos:", error);
    }
};

// Middleware para validar campos de producto
const validateProductFields = (req, res, next) => {
    const { title, description, code, price, stock, category } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto 'thumbnails'." });
    }
    next();
};

// Funciones auxiliares
const findCart = (cid) => carts.find(cart => cart.id === cid);
const findProduct = (pid) => products.find(product => product.id === pid);

const checkProductsAndCarts = (req, res, next) => {
    if (products.length === 0) {
        return res.status(404).json({ error: "No hay productos disponibles." });
    }
    if (carts.length === 0) {
        return res.status(404).json({ error: "No hay carritos disponibles." });
    }
    next();
};

// Cargar productos y carritos al iniciar el servidor
const initializeData = async () => {
    await Promise.all([loadProducts(), loadCarts()]);
};

initializeData();

// Rutas
app.get("/api/products", (req, res) => {
    const limit = parseInt(req.query.limit);
    const result = (!isNaN(limit) && limit > 0) ? products.slice(0, limit) : products;
    res.status(200).json(result);
});

app.get("/api/products/:pid", (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = findProduct(productId);

    if (!product) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }
    return res.status(200).json(product);
});

app.post("/api/products", validateProductFields, async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };

    products.push(newProduct);
    await saveProducts();
    res.status(201).json(newProduct);
});

app.put("/api/products/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }

    products[productIndex] = {
        ...products[productIndex],
        ...req.body,
        thumbnails: req.body.thumbnails || products[productIndex].thumbnails
    };

    await saveProducts();
    res.status(200).json(products[productIndex]);
});

app.delete("/api/products/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }

    products.splice(productIndex, 1);
    await saveProducts();
    res.status(204).send();
});

app.post("/api/carts", async (req, res) => {
    const newId = carts.length > 0 ? Math.max(...carts.map(cart => cart.id)) + 1 : 1;
    const newCart = { id: newId, products: [] };

    carts.push(newCart);
    await saveCarts();
    res.status(201).json(newCart);
});

app.get("/api/carts/:cid", checkProductsAndCarts, (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = findCart(cartId);

    if (!cart) {
        return res.status(404).json({ error: `Carrito con id ${cartId} no encontrado.` });
    }

    res.status(200).json(cart.products);
});

app.post("/api/carts/:cid/product/:pid", checkProductsAndCarts, async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const cart = findCart(cartId);
    
    if (!cart) {
        return res.status(404).json({ error: `Carrito con id ${cartId} no encontrado.` });
    }

    const productExists = findProduct(productId);
    if (!productExists) {
        return res.status(404).json({ error: `Producto con id ${productId} no encontrado.` });
    }

    const existingProduct = cart.products.find(p => p.product === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: productId, quantity: 1 });
    }

    await saveCarts();
    res.status(200).json(cart.products);
});

app.get("/api/docs", async (req, res) => {
    const docsContent = await loadDocs();
    if (docsContent) {
        res.setHeader('Content-Type','text/html');
        res.status(200).send(docsContent); 
    } else {
        res.status(500).json({ error: "No se pudo cargar el contenido del documento." });
    }
});

app.use((req, res, next) => {
    res.status(404).json({ 
        error: "Ruta no encontrada", 
        requestedUrl: req.originalUrl, 
        method: req.method,
        docs: "/api/docs"
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto: ${PORT}.`);
});
