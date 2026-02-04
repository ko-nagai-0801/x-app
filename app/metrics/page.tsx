/* app/metrics/page.tsx */
import { labels } from "@/lib/labels";
import PageShell from "@/components/PageShell";

export default function MetricsPage() {
  return (
    <PageShell
      title={labels.pages.metrics}
      description="投稿後の実績を手入力で記録します。"
    >
      <div className="text-sm opacity-80">準備中</div>
    </PageShell>
  );
}
