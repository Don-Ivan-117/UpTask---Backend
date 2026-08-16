import { connectDB } from './config/db'
import { corsConfig } from './config/cors'
import type { Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'
import morgan from 'morgan'

dotenv.config()

connectDB()

const app: Express = express()
// Habilitar la configuracoin de CORS
app.use(cors(corsConfig))

//Logging
app.use(morgan('dev'))

// Leer datos de un formulario (Json)
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app