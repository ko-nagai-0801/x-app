/* app/api/posts/[id]/route.ts */
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

/**
 * 未指定: undefined（更新しない）
 * null: null（クリア）
 * string: Date（パースしてセット）
 */
function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return undefined; // 不正な日付は「未指定扱い」
  return d;
}

interface UpdatePostInput {
  title?: string | null;
  body?: string;
  status?: PostStatus;
  purpose?: PostPurpose;
  tags?: string;
  scheduledAt?: Date | null;
  postedAt?: Date | null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;

  const json: unknown = await request.json();
  if (!isRecord(json)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: UpdatePostInput = {};

  // title: string | null | undefined を許容
  const titleRaw = json.title;
  if (typeof titleRaw === "string") {
    const trimmed = titleRaw.trim();
    update.title = trimmed ? titleRaw : null;
  } else if (titleRaw === null) {
    update.title = null;
  }

  if (typeof json.body === "string") {
    update.body = json.body;
  }

  if (isPostStatus(json.status)) {
    update.status = json.status;
  }

  if (isPostPurpose(json.purpose)) {
    update.purpose = json.purpose;
  }

  if (json.tags !== undefined) {
    update.tags = parseTagsCsv(json.tags);
  }

  const scheduledAt = parseOptionalDate(json.scheduledAt);
  if (scheduledAt !== undefined) {
    update.scheduledAt = scheduledAt;
  }

  const postedAt = parseOptionalDate(json.postedAt);
  if (postedAt !== undefined) {
    update.postedAt = postedAt;
  }

  const updated = await prisma.post.update({
    where: { id },
    data: update,
    select: { id: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ id });
}
