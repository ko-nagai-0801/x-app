/* app/api/posts/[id]/route.ts */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PostPurpose, PostStatus } from "@prisma/client";

interface UpdatePostInput {
  title?: string | null;
  body?: string;
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

function parseTagsCsv(input: unknown): string | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string") return undefined;
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(",");
}

function parseIsoOrNull(input: unknown): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeTitle(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") return undefined;

  const t = raw.trim();
  return t.length ? raw : null;
}

function parseUpdateInput(
  body: unknown,
): { ok: true; data: UpdatePostInput } | { ok: false; error: string } {
  if (!isRecord(body)) return { ok: false, error: "Invalid JSON body." };

  const update: UpdatePostInput = {
    title: normalizeTitle(body.title),
    body: typeof body.body === "string" ? body.body : undefined,
    status: isPostStatus(body.status) ? body.status : undefined,
    purpose: isPostPurpose(body.purpose) ? body.purpose : undefined,
    tags: parseTagsCsv(body.tags),
    scheduledAt:
      body.scheduledAt === undefined
        ? undefined
        : (body.scheduledAt as string | null),
    postedAt:
      body.postedAt === undefined ? undefined : (body.postedAt as string | null),
  };

  // prefer-optional-chain 対応 + 本文必須（更新時に body が来た場合だけ検証）
  if (update.body?.trim().length === 0) {
    return { ok: false, error: "本文は必須です。" };
  }

  return { ok: true, data: update };
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const body: unknown = await req.json();
    const parsed = parseUpdateInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const input = parsed.data;
    const status = input.status;

    const scheduledAt =
      status === "SCHEDULED"
        ? parseIsoOrNull(input.scheduledAt)
        : status === "POSTED"
          ? null
          : undefined;

    const postedAt =
      status === "POSTED"
        ? parseIsoOrNull(input.postedAt)
        : status === "SCHEDULED"
          ? null
          : undefined;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: input.title,
        body: input.body,
        status: input.status,
        purpose: input.purpose,
        tags: input.tags,
        scheduledAt,
        postedAt,
      },
      select: { id: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
