import { Router } from 'express';
import { getDocs } from '../controllers/docController.js';

const router = Router();

router.get("/", getDocs);

export default router;
