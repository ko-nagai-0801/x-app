/* app/posts/new/page.tsx */
import PageShell from "@/components/PageShell";
import PostForm from "@/components/PostForm";
import { labels } from "@/lib/labels";

export default function NewPostPage() {
  return (
    <PageShell title={labels.actions.create} description="新規投稿を作成します。">
      <PostForm mode="create" />
    </PageShell>
  );
}
