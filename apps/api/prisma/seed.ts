import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1) Users (enum 이름이 불명확하므로 문자열로 넣음)
  const traveler = await prisma.user.upsert({
    where: { email: 'traveler@example.com' },
    update: {},
    create: {
      email: 'traveler@example.com',
      passwordHash,
      nickname: 'Traveler',
      type: 'TRAVELER',
      languages: ['en'],
    },
  })

  const local = await prisma.user.upsert({
    where: { email: 'local1@example.com' },
    update: {},
    create: {
      email: 'local1@example.com',
      passwordHash,
      nickname: 'Min',
      type: 'LOCAL',
      languages: ['ko', 'en'],
    },
  })

  // 2) Request (purpose 제거, status는 ACTIVE)
  const request = await prisma.request.create({
    data: {
      travelerId: traveler.id,
      city: 'Seoul',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-12'),
      tags: ['food', 'culture'],
      description: 'Looking for locals',
      status: 'ACTIVE',
    },
  })

  // 3) Match + Chat
  const match = await prisma.match.create({
    data: {
      requestId: request.id,
      travelerId: traveler.id,
      localId: local.id,
    },
  })

  const chat = await prisma.chat.create({
    data: { matchId: match.id },
  })

  // 4) ChatMember
  await prisma.chatMember.createMany({
    data: [
      { chatId: chat.id, userId: traveler.id },
      { chatId: chat.id, userId: local.id },
    ],
    skipDuplicates: true,
  })

  // 5) Messages
  await prisma.message.createMany({
    data: [
      { chatId: chat.id, senderId: traveler.id, content: 'Hello! I will visit Seoul.' },
      { chatId: chat.id, senderId: local.id, content: 'Nice! I can guide you.' },
      { chatId: chat.id, senderId: traveler.id, content: 'Perfect. See you soon!' },
    ],
  })

  console.log('✅ Seed done:', {
    traveler: traveler.email,
    local: local.email,
    requestId: request.id,
    matchId: match.id,
    chatId: chat.id,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })