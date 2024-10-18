import express from 'express';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import docRoutes from './routes/docRoutes.js';

const app = express();

app.use(express.json());

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/docs', docRoutes);
app.use((req, res, next) => {
    res.status(404).json({ 
        error: "Ruta no encontrada", 
        requestedUrl: req.originalUrl, 
        method: req.method,
        docs: "/api/docs"
    });
});



app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});
