/* components/PageShell.tsx */
import Link from "next/link";
import type React from "react";

const NAV = [
  { href: "/posts", label: "投稿" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/metrics", label: "指標" },
  { href: "/settings", label: "設定" },
] as const;

export default function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <nav className="flex flex-wrap gap-3">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-md border px-3 py-2 text-sm hover:bg-black/5"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm opacity-70">{description}</p>
        ) : null}
      </header>

      <section className="mt-8">{children}</section>
    </main>
  );
}
