import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { TicketPercent } from "lucide-react";

export const Route = createFileRoute("/discounts")({
  head: () => ({ meta: [{ title: "档口折扣 · 东大门蚂蚁" }] }),
  component: Discounts,
});

function Discounts() {
  const list = PRODUCTS.filter((p) => p.discount);
  return (
    <MobileShell>
      <MobileHeader title="档口折扣" back />
      <div className="bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-5 text-white">
        <div className="flex items-center gap-2">
          <TicketPercent className="h-5 w-5" />
          <span className="text-base font-semibold">档口直降专区</span>
        </div>
        <div className="mt-1 text-xs opacity-90">每日 10:00 / 20:00 更新,数量有限先到先得。</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-6">
        {list.map((p) => {
          const finalKRW = Math.round(p.priceKRW * (1 - (p.discount ?? 0) / 100));
          return (
            <Link
              key={p.id}
              to="/products/$id"
              params={{ id: p.id }}
              className="block overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[3/4]">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                <Badge className="absolute left-2 top-2 bg-rose-500 text-white">-{p.discount}%</Badge>
              </div>
              <div className="p-2">
                <div className="line-clamp-1 text-xs">{p.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-rose-500">{formatKRW(finalKRW)}</span>
                  <span className="text-[10px] text-muted-foreground line-through">{formatKRW(p.priceKRW)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">≈{formatCNY(krwToCny(finalKRW))}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}