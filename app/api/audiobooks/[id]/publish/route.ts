import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: audiobookId } = await params;

  const audiobook = await prisma.audiobook.findUnique({
    where: { id: audiobookId },
    include: { createdBy: true, chapters: true },
  });

  if (!audiobook) {
    return NextResponse.json(
      { message: "Audiobook not found" },
      { status: 404 }
    );
  }

  // Only author or admin can publish
  if (audiobook.createdById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Calculate total duration from chapters
  const totalDuration = audiobook.chapters.reduce(
    (sum: any, chapter: any) => sum + (chapter.duration || 0),
    0
  );

  // Update audiobook + publish chapters
  const updated = await prisma.audiobook.update({
    where: { id: audiobookId },
    data: {
      status: "PUBLISHED",
      duration: totalDuration,
      chapters: {
        updateMany: {
          where: { status: "DRAFT" },
          data: { status: "PUBLISHED" },
        },
      },
    },
  });

  return NextResponse.json({
    message: "Audiobook published",
    audiobook: updated,
  });
}
