import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staffRoles = ["ADMIN", "HOST", "CO_HOST", "PRODUCER", "SOUND_ENGINEER", "CONTENT_MANAGER", "TECHNICAL_SUPPORT"]
    if (!staffRoles.includes(user.role) || !user.isApproved) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id } = await params
    const transcription = await prisma.transcription.findUnique({
      where: { audiobookId: id }
    })

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Error fetching transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staffRoles = ["ADMIN", "HOST", "CO_HOST", "PRODUCER", "SOUND_ENGINEER", "CONTENT_MANAGER", "TECHNICAL_SUPPORT"]
    if (!staffRoles.includes(user.role) || !user.isApproved) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, language = 'en', format = 'plain_text' } = body

    const transcription = await prisma.transcription.upsert({
      where: { audiobookId: id },
      update: {
        content,
        language,
        format,
        lastEditedBy: user.id,
        lastEditedAt: new Date()
      },
      create: {
        content,
        language,
        format,
        audiobookId: id,
        lastEditedBy: user.id,
        lastEditedAt: new Date()
      }
    })

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Error saving transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staffRoles = ["ADMIN", "HOST", "CO_HOST", "PRODUCER", "SOUND_ENGINEER", "CONTENT_MANAGER", "TECHNICAL_SUPPORT"]
    if (!staffRoles.includes(user.role) || !user.isApproved) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, language, format, isEditable } = body

    const updateData: any = {
      lastEditedBy: user.id,
      lastEditedAt: new Date()
    }

    if (content) updateData.content = content
    if (language) updateData.language = language
    if (format) updateData.format = format
    if (isEditable !== undefined) updateData.isEditable = isEditable

    const transcription = await prisma.transcription.update({
      where: { audiobookId: id },
      data: updateData
    })

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Error updating transcription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}