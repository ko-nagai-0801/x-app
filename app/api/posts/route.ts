/* app/api/posts/route.ts */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostPurpose, PostStatus } from "@prisma/client";

interface CreatePostInput {
  title?: string | null;
  body: string;
  status?: PostStatus;
  purpose?: PostPurpose;
  tags?: string;
  scheduledAt?: string | null;
  postedAt?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPostStatus(value: unknown): value is PostStatus {
  return value === "DRAFT" || value === "SCHEDULED" || value === "POSTED";
}

function isPostPurpose(value: unknown): value is PostPurpose {
  return (
    value === "ANNOUNCE" ||
    value === "LEARN" ||
    value === "DAILY" ||
    value === "RECAP" ||
    value === "OTHER"
  );
}

function parseTagsCsv(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(",");
}

function parseIsoOrNull(input: unknown): Date | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseCreateInput(
  body: unknown,
):
  | { ok: true; data: CreatePostInput }
  | { ok: false; error: string } {
  if (!isRecord(body)) return { ok: false, error: "Invalid JSON body." };

  const rawTitle = body.title;
  const title =
    rawTitle === null
      ? null
      : typeof rawTitle === "string"
        ? rawTitle
        : undefined;

  const rawBody = body.body;
  if (typeof rawBody !== "string" || rawBody.trim().length === 0) {
    return { ok: false, error: "本文は必須です。" };
  }

  const status: PostStatus = isPostStatus(body.status) ? body.status : "DRAFT";
  const purpose: PostPurpose = isPostPurpose(body.purpose)
    ? body.purpose
    : "OTHER";

  return {
    ok: true,
    data: {
      title: title?.trim() ? title : null,
      body: rawBody,
      status,
      purpose,
      tags: parseTagsCsv(body.tags),
      scheduledAt:
        body.scheduledAt === null ? null : (body.scheduledAt as string | null),
      postedAt:
        body.postedAt === null ? null : (body.postedAt as string | null),
    },
  };
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = parseCreateInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const input = parsed.data;

    const scheduledAt =
      input.status === "SCHEDULED" ? parseIsoOrNull(input.scheduledAt) : null;
    const postedAt =
      input.status === "POSTED" ? parseIsoOrNull(input.postedAt) : null;

    const created = await prisma.post.create({
      data: {
        title: input.title ?? null,
        body: input.body,
        status: input.status ?? "DRAFT",
        purpose: input.purpose ?? "OTHER",
        tags: input.tags ?? "",
        scheduledAt,
        postedAt,
      },
      select: { id: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
