/* app/settings/page.tsx */
import { labels } from "@/lib/labels";
import PageShell from "@/components/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      title={labels.nav.settings}
      description="テンプレ・タグ候補などを管理します。"
    >
      <div className="rounded-md border p-4 text-sm opacity-80">
        ここに設定UIを追加していきます。
      </div>
    </PageShell>
  );
}
