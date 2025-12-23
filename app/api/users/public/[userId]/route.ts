import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
        createdAt: true,
        bio: true,
        username: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
            playlists: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      joinedAt: user.createdAt,
      stats: {
        comments: user._count.comments,
        favorites: user._count.favorites,
        playlists: user._count.playlists,
      },
    };

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("[PUBLIC_PROFILE_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
