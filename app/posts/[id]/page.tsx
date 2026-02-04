/* app/posts/[id]/page.tsx */
import PageShell from "@/components/PageShell";
import PostForm from "@/components/PostForm";
import { prisma } from "@/lib/db";

function toDatetimeLocalString(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    return (
      <PageShell title="見つかりません" description="投稿が見つかりませんでした。">
        <div className="rounded-md border p-4 text-sm opacity-70">
          指定された投稿は存在しません。
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="投稿を編集" description={`ID: ${post.id}`}>
      <PostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          body: post.body,
          status: post.status,
          purpose: post.purpose,
          tags: post.tags,
          scheduledAt: toDatetimeLocalString(post.scheduledAt),
          postedAt: toDatetimeLocalString(post.postedAt),
        }}
      />
    </PageShell>
  );
}
