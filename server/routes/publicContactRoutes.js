import express from 'express';
import { submitContactMessage } from '../controllers/publicContactController.js';

const router = express.Router();

router.post('/', submitContactMessage);

export default router;
