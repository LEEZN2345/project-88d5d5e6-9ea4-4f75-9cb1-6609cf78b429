import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({ meta: [{ title: "今日上新 · 东大门蚂蚁" }] }),
  component: NewArrivals,
});

function NewArrivals() {
  const list = PRODUCTS.filter((p) => p.isNew);
  return (
    <MobileShell>
      <MobileHeader title="今日上新" back />
      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="text-base font-semibold">档口直采新款</span>
        </div>
        <div className="mt-1 text-xs opacity-90">每日 09:00 同步东大门档口上新,款号即下单即锁。</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-6">
        {list.map((p) => (
          <Link
            key={p.id}
            to="/products/$id"
            params={{ id: p.id }}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[3/4]">
              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">新款</Badge>
            </div>
            <div className="p-2">
              <div className="line-clamp-1 text-xs">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-semibold">{formatKRW(p.priceKRW)}</span>
                <span className="text-[10px] text-muted-foreground">≈{formatCNY(krwToCny(p.priceKRW))}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{p.internalCode}</div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}