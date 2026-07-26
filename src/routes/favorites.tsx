import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "我的收藏 · 东大门蚂蚁" }] }),
  component: Favorites,
});

const TABS = ["商品", "档口"];

function Favorites() {
  const favs = PRODUCTS.slice(0, 4);
  const favShops = SHOPS.slice(0, 2);
  return (
    <MobileShell>
      <MobileHeader title="我的收藏" back />
      <div className="sticky top-12 z-30 flex gap-2 border-b border-border bg-background px-4 py-2">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`rounded-full px-3 py-1 text-xs ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {favs.map((p) => (
          <Link
            key={p.id}
            to="/products/$id"
            params={{ id: p.id }}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[3/4]">
              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              <Heart className="absolute right-2 top-2 h-4 w-4 fill-rose-500 text-rose-500" />
              {p.discount && (
                <Badge className="absolute left-2 top-2 bg-rose-500 text-white">-{p.discount}%</Badge>
              )}
            </div>
            <div className="p-2">
              <div className="line-clamp-1 text-xs">{p.name}</div>
              <div className="mt-1 text-sm font-semibold">{formatKRW(p.priceKRW)}</div>
              <div className="text-[10px] text-muted-foreground">≈{formatCNY(krwToCny(p.priceKRW))}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 px-4 text-xs text-muted-foreground">收藏的档口</div>
      <div className="mt-2 space-y-2 px-4 pb-6">
        {favShops.map((s) => (
          <Link
            key={s.id}
            to="/shops/$id"
            params={{ id: s.id }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <img src={s.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1 text-sm">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.building} · {s.floor}</div>
            </div>
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}