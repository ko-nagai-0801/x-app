/* app/api/posts/route.ts */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostPurpose, PostStatus } from "@prisma/client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTagsCsv(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

function isPostStatus(value: unknown): value is PostStatus {
  return typeof value === "string" && value in PostStatus;
}

function isPostPurpose(value: unknown): value is PostPurpose {
  return typeof value === "string" && value in PostPurpose;
}

interface CreatePostInput {
  title?: string | null;
  body: string;
  status?: PostStatus;
  purpose?: PostPurpose;
  tags?: string;
  scheduledAt?: Date | null;
}

export async function GET(): Promise<Response> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request): Promise<Response> {
  const json: unknown = await request.json();
  if (!isRecord(json)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyValue = json.body;
  if (typeof bodyValue !== "string" || !bodyValue.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const titleRaw = json.title;
  const title =
    typeof titleRaw === "string"
      ? titleRaw.trim()
        ? titleRaw
        : null
      : titleRaw === null
        ? null
        : undefined;

  const status = isPostStatus(json.status) ? json.status : PostStatus.DRAFT;
  const purpose = isPostPurpose(json.purpose) ? json.purpose : PostPurpose.OTHER;

  const tags = parseTagsCsv(json.tags);

  const scheduledAt: Date | null =
    typeof json.scheduledAt === "string" && json.scheduledAt.trim()
      ? new Date(json.scheduledAt)
      : null;

  const created = await prisma.post.create({
    data: {
      title,
      body: bodyValue,
      status,
      purpose,
      tags,
      scheduledAt,
    } satisfies CreatePostInput,
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}
