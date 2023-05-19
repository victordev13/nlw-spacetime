import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

type GithubApiUserResponse = {
  id: number
  login: string
  name: string
  avatar_url: string
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    const { code } = bodySchema.parse(request.body)

    const accessTokenResponse = await axios.post<{ access_token: string }>(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const { access_token } = accessTokenResponse.data

    const { data: githubUser } = await axios.get<GithubApiUserResponse>(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      },
    )

    let user = await prisma.user.findUnique({
      where: { githubId: githubUser.id },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: githubUser.id,
          avatarUrl: githubUser.avatar_url,
          login: githubUser.login,
          name: githubUser.name,
        },
      })
    }

    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '7 days',
      },
    )

    return { token }
  })
}
