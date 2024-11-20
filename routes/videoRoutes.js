import express from 'express'
const router = express.Router()
import {videoCropping} from '../controllers/videoController.js'

router.post('/cropVideo', videoCropping)

export default router