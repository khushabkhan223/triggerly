import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })
import express from 'express'
import cors from 'cors'
import triggersRouter from './routes/triggers.js'
import alertsRouter from './routes/alerts.js'
import resolveRouter from './routes/resolve.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/triggers', triggersRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/resolve', resolveRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`⚡ Triggerly API running on port ${PORT}`)
})
