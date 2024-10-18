import DocManager from '../managers/DocManager.js';

export const getDocs = async (req, res) => {
    const docsContent = await DocManager.loadDocs();
    if (docsContent) {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(docsContent);
    } else {
        res.status(500).json({ error: "No se pudo cargar el contenido del documento." });
    }
};
