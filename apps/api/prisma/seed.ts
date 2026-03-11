import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  // 기존 테스트 데이터 정리
  await prisma.chatMember.deleteMany()
  await prisma.message.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.match.deleteMany()
  await prisma.like.deleteMany()
  await prisma.request.deleteMany()
  await prisma.user.deleteMany()

  // 유저 2명
  const traveler = await prisma.user.create({
    data: {
      email: 'traveler@example.com',
      passwordHash,
      nickname: 'Traveler',
      type: 'TRAVELER',
      languages: ['en'],
    },
  })

  const local = await prisma.user.create({
    data: {
      email: 'local1@example.com',
      passwordHash,
      nickname: 'Min',
      type: 'LOCAL',
      languages: ['ko', 'en'],
    },
  })

  // 요청 1개
  const request = await prisma.request.create({
    data: {
      travelerId: traveler.id,
      city: 'Seoul',
      startDate: new Date('2026-03-10T00:00:00.000Z'),
      endDate: new Date('2026-03-12T00:00:00.000Z'),
      tags: ['food', 'culture'],
      description: 'Looking for locals',
      modeInfoOnly: false,
      modeChat: true,
      modeOffline: false,
      status: 'MATCHED',
    },
  })

  // match + chat
  const match = await prisma.match.create({
    data: {
      requestId: request.id,
      travelerId: traveler.id,
      localId: local.id,
      status: 'ACTIVE',
    },
  })

  const chat = await prisma.chat.create({
    data: {
      matchId: match.id,
    },
  })

  // chat member
  await prisma.chatMember.createMany({
    data: [
      {
        chatId: chat.id,
        userId: traveler.id,
      },
      {
        chatId: chat.id,
        userId: local.id,
      },
    ],
  })

  // 메시지 3개
  const m1 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: traveler.id,
      content: 'Hello! I will visit Seoul next week.',
    },
  })

  const m2 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: local.id,
      content: 'Nice to meet you! I can recommend great food places.',
    },
  })

  const m3 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: traveler.id,
      content: 'That sounds awesome. Thank you!',
    },
  })

  // 읽음 상태도 넣어주기
  await prisma.chatMember.update({
    where: {
      chatId_userId: {
        chatId: chat.id,
        userId: traveler.id,
      },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMsgId: m3.id,
    },
  })

  await prisma.chatMember.update({
    where: {
      chatId_userId: {
        chatId: chat.id,
        userId: local.id,
      },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMsgId: m2.id,
    },
  })

  console.log('✅ Seed done')
  console.log({
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