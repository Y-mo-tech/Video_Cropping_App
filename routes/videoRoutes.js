import express from 'express';
import multer from 'multer';
import path from 'path';
import { videoCropping } from '../controllers/videoController.js';

const __dirname = path.resolve();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads'); 
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`; 
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/cropVideo', upload.array('videos', 10), videoCropping);

export default router;
