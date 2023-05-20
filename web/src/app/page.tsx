import { EmptyMemories } from '@/components/EmptyMemories'
import { api } from '@/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { ArrowRight } from 'lucide-react'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

dayjs.locale(ptBr)

type Memory = {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default async function Home() {
  const isAuthenticated = cookies().has('token')

  if (!isAuthenticated) {
    return <EmptyMemories />
  }

  const token = cookies().get('token')?.value
  const { data: memories } = await api.get<Memory[]>('/memories', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })

  if (memories.length === 0) {
    return <EmptyMemories />
  }

  return (
    <div className="flex flex-col gap-10 p-8">
      {memories.map((memory) => (
        <div key={memory.id} className="space-y-4">
          <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
            {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
          </time>

          <Link href={`/memories/${memory.id}`} className="block">
            <Image
              src={memory.coverUrl}
              width={592}
              height={280}
              alt=""
              title="Ver memória"
              className="aspect-video w-full rounded-lg object-cover transition-opacity hover:opacity-70"
            />
          </Link>
          <p className="text-lg leading-relaxed text-gray-100">
            {memory.excerpt}
          </p>

          <Link
            href={`/memories/${memory.id}`}
            className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
          >
            <ArrowRight className="h-4 w-4" />
            Ler mais
          </Link>
        </div>
      ))}
    </div>
  )
}
