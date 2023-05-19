import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastify from 'fastify'
import { authRoutes } from './routes/auth'
import { memoriesRoutes } from './routes/memories'

const app = fastify()

app.register(cors, {
  origin: [process.env.APP_URL as string],
})

app.register(jwt, {
  secret: process.env.JWT_SECRET as string,
})

app.register(authRoutes)
app.register(memoriesRoutes)

app
  .listen({ port: Number(process.env.APP_PORT || 3333), host: '0.0.0.0' })
  .then(() => console.log(`🚀 server running on ${process.env.APP_URL}...`))
