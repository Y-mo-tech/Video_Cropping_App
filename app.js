import express from 'express'
import video from './routes/videoRoutes.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express();
app.use(express.json());
app.use('/api', video)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})