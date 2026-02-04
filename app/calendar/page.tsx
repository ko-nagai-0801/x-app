/* app/calendar/page.tsx */
import { labels } from "@/lib/labels";
import PageShell from "@/components/PageShell";

export default function CalendarPage() {
  return (
    <PageShell
      title={labels.pages.calendar}
      description="予約投稿を俯瞰します。"
    >
      <div className="text-sm opacity-80">準備中</div>
    </PageShell>
  );
}
