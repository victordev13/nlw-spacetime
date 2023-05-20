import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const currentUserId = request.user.sub

    const memories = await prisma.memory.findMany({
      where: {
        userId: currentUserId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => ({
      id: memory.id,
      coverUrl: memory.coverUrl,
      excerpt: memory.content.substring(0, 115).concat('...'),
      createdAt: memory.createdAt,
    }))
  })

  app.get('/memories/:id', async (request, response) => {
    const currentUserId = request.user.sub

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findFirstOrThrow({
      where: {
        id,
        OR: [{ isPublic: true }, { userId: currentUserId }],
      },
    })

    return memory
  })

  app.post('/memories', async (request) => {
    const currentUserId = request.user.sub

    const bodySchema = z.object({
      coverUrl: z.string(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false), // "coerce" convert received to boolean
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: currentUserId,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, response) => {
    const currentUserId = request.user.sub

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      coverUrl: z.string().url(),
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (memory.userId !== currentUserId) {
      return response.status(404).send({ message: 'No Memory Found' })
    }

    memory = await prisma.memory.update({
      where: { id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, response) => {
    const currentUserId = request.user.sub

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (memory.userId !== currentUserId) {
      return response.status(404).send({ message: 'No Memory Found' })
    }

    await prisma.memory.delete({
      where: { id },
    })
  })
}
