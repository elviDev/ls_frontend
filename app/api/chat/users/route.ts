import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { broadcastId, action, targetUserId, duration, reason } = body

    if (!broadcastId || !action || !targetUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create moderation record
    const moderation = await prisma.chatModerationAction.create({
      data: {
        broadcastId,
        targetUserId,
        moderatorId: 'system', // You may want to get this from auth
        actionType: action,
        duration: duration || null,
        reason: reason || `User ${action}ed`,
        expiresAt: duration ? new Date(Date.now() + duration * 1000) : null,
      },
    })

    return NextResponse.json({ moderation })
  } catch (error) {
    console.error('Error moderating user:', error)
    return NextResponse.json({ error: 'Failed to moderate user' }, { status: 500 })
  }
}
