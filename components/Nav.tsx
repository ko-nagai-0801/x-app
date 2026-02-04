/* components/Nav.tsx */
import Link from "next/link";
import { labels } from "@/lib/labels";

const items = [
  { href: "/posts", label: labels.nav.posts },
  { href: "/calendar", label: labels.nav.calendar },
  { href: "/metrics", label: labels.nav.metrics },
  { href: "/settings", label: labels.nav.settings },
] as const;

export default function Nav() {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md border px-3 py-2 text-sm hover:bg-black/5"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
