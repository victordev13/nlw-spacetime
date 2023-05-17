import cors from '@fastify/cors'
import fastify from 'fastify'
import { memories } from './routes/memories'

const app = fastify()

app.register(memories)
app.register(cors, {
  origin: [process.env.APP_URL || 'http://localhost:3333'],
})

app
  .listen({ port: Number(process.env.APP_PORT || 3333) })
  .then(() => console.log(`🚀 server running on ${process.env.APP_URL}...`))
