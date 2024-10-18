import fs from "fs/promises";
import path from "path";

const docsPath = path.resolve('./data/docs.txt');

class DocManager {
    async loadDocs() {
        try {
            const data = await fs.readFile(docsPath, 'utf-8');
            return data;
        } catch (error) {
            console.error("Error al cargar documentos:", error);
            return null;
        }
    }
}

export default new DocManager();
