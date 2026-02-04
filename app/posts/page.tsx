/* app/posts/page.tsx */
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { prisma } from "@/lib/db";
import { tagsToArray } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusJa(s: string) {
  switch (s) {
    case "DRAFT":
      return "下書き";
    case "SCHEDULED":
      return "予約";
    case "POSTED":
      return "投稿済み";
    default:
      return s;
  }
}

function purposeJa(p: string) {
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
    default:
      return p;
  }
}

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <PageShell title="投稿" description="下書き・予約・投稿済みを管理します（MVP）">
      <div className="flex items-center gap-3">
        <Link
          href="/posts/new"
          className="rounded-md border px-3 py-2 text-sm hover:bg-black/5"
        >
          ＋ 新規投稿
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {posts.length === 0 ? (
          <div className="rounded-md border p-4 text-sm opacity-70">
            まだ投稿がありません。まずは「新規投稿」から作成してください。
          </div>
        ) : (
          posts.map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="block rounded-md border p-4 hover:bg-black/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {p.title?.trim() ? p.title : "（タイトル未設定）"}
                  </div>

                  <div className="mt-1 text-xs opacity-70">
                    {statusJa(p.status)} / {purposeJa(p.purpose)}
                  </div>
                </div>

                <div className="text-xs opacity-60">
                  {new Date(p.updatedAt).toLocaleString("ja-JP")}
                </div>
              </div>

              <div className="mt-3 line-clamp-2 whitespace-pre-wrap text-sm opacity-80">
                {p.body}
              </div>

              {p.tags ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagsToArray(p.tags).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-0.5 text-xs opacity-80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </PageShell>
  );
}
