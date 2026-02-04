/* app/api/posts/route.ts */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostPurpose, PostStatus } from "@/generated/prisma";

function parseTagsCsv(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
}

function isPostStatus(v: unknown): v is PostStatus {
  return typeof v === "string" && Object.values(PostStatus).includes(v as PostStatus);
}

function isPostPurpose(v: unknown): v is PostPurpose {
  return typeof v === "string" && Object.values(PostPurpose).includes(v as PostPurpose);
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

    const title = typeof b.title === "string" ? b.title : null;
    const postBody = typeof b.body === "string" ? b.body : "";
    const status: PostStatus = isPostStatus(b.status) ? b.status : PostStatus.DRAFT;
    const purpose: PostPurpose = isPostPurpose(b.purpose) ? b.purpose : PostPurpose.OTHER;
    const tags = parseTagsCsv(b.tags);

    const scheduledAt =
      typeof b.scheduledAt === "string" && b.scheduledAt ? new Date(b.scheduledAt) : null;

    const postedAt =
      typeof b.postedAt === "string" && b.postedAt ? new Date(b.postedAt) : null;

    if (!postBody.trim()) {
      return NextResponse.json({ error: "本文は必須です。" }, { status: 400 });
    }

    const created = await prisma.post.create({
      data: {
        title,
        body: postBody,
        status,
        purpose,
        tags,
        scheduledAt,
        postedAt,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "作成に失敗しました。" }, { status: 500 });
  }
}
