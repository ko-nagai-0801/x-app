/* components/PostForm.tsx */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostPurpose, PostStatus } from "@/generated/prisma";
import { labels } from "@/lib/labels";

interface Initial {
  id?: string;
  title?: string | null;
  body?: string;
  status?: PostStatus;
  purpose?: PostPurpose;
  tags?: string;
  scheduledAt?: string | null; // datetime-local
  postedAt?: string | null; // datetime-local
}

interface PostFormProps {
  mode: "create" | "edit";
  initial?: Initial;
}

function toIsoOrNull(datetimeLocal: string): string | null {
  const v = datetimeLocal.trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function statusLabel(s: PostStatus) {
  switch (s) {
    case "DRAFT":
      return "下書き";
    case "SCHEDULED":
      return "予約";
    case "POSTED":
      return "投稿済み";
  }
}

function purposeLabel(p: PostPurpose) {
  switch (p) {
    case "ANNOUNCE":
      return "告知";
    case "LEARN":
      return "学び";
    case "DAILY":
      return "日々";
    case "RECAP":
      return "振り返り";
    case "OTHER":
      return "その他";
  }
}

export default function PostForm({ mode, initial }: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "DRAFT");
  const [purpose, setPurpose] = useState<PostPurpose>(
    initial?.purpose ?? "OTHER",
  );
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");
  const [postedAt, setPostedAt] = useState(initial?.postedAt ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isScheduled = status === "SCHEDULED";
  const isPosted = status === "POSTED";
  const preview = useMemo(() => body, [body]);

  async function onSave(): Promise<void> {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim() ? title : null,
        body,
        status,
        purpose,
        tags,
        scheduledAt: isScheduled ? toIsoOrNull(scheduledAt) : null,
        postedAt: isPosted ? toIsoOrNull(postedAt) : null,
      };

      if (!payload.body.trim()) {
        setError("本文は必須です。");
        return;
      }

      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data: unknown = await res.json().catch(() => null);
          const msg =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : "作成に失敗しました。";
          throw new Error(msg);
        }

        const data = (await res.json()) as { id: string };
        router.push(`/posts/${data.id}`);
        router.refresh();
        return;
      }

      if (!initial?.id) throw new Error("編集対象のIDがありません。");

      const res = await fetch(`/api/posts/${initial.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const msg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "更新に失敗しました。";
        throw new Error(msg);
      }

      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="rounded-md border p-3 text-sm">
          <span className="font-medium">エラー：</span> {error}
        </div>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium">タイトル（任意）</label>
        <input
          className="rounded-md border px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例）note更新告知（調子が上向いたとき〜）"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">本文</label>
        <textarea
          className="min-h-[180px] rounded-md border px-3 py-2 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`note更新しました。\nタイトル\n\nメッセージ\nリンク`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium">ステータス</label>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
          >
            <option value="DRAFT">{statusLabel("DRAFT")}</option>
            <option value="SCHEDULED">{statusLabel("SCHEDULED")}</option>
            <option value="POSTED">{statusLabel("POSTED")}</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">目的</label>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as PostPurpose)}
          >
            <option value="ANNOUNCE">{purposeLabel("ANNOUNCE")}</option>
            <option value="LEARN">{purposeLabel("LEARN")}</option>
            <option value="DAILY">{purposeLabel("DAILY")}</option>
            <option value="RECAP">{purposeLabel("RECAP")}</option>
            <option value="OTHER">{purposeLabel("OTHER")}</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">タグ（カンマ区切り）</label>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="note,運用,習慣"
          />
        </div>
      </div>

      {isScheduled ? (
        <div className="grid gap-2">
          <label className="text-sm font-medium">予約日時</label>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      ) : null}

      {isPosted ? (
        <div className="grid gap-2">
          <label className="text-sm font-medium">投稿日時</label>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            type="datetime-local"
            value={postedAt}
            onChange={(e) => setPostedAt(e.target.value)}
          />
        </div>
      ) : null}

      <div className="rounded-md border p-3">
        <div className="text-xs font-medium opacity-70">プレビュー</div>
        <pre className="mt-2 whitespace-pre-wrap text-sm">{preview}</pre>
      </div>

      <button
        type="button"
        disabled={saving}
        className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
        onClick={() => void onSave()}
      >
        {saving
          ? labels.actions.saving
          : mode === "create"
            ? labels.actions.createDraft
            : labels.actions.update}
      </button>
    </div>
  );
}
