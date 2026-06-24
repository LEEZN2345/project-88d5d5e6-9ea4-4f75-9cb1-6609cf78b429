import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/shops/")({
  head: () => ({
    meta: [
      { title: "档口列表 · 东大门订货通" },
      { name: "description", content: "浏览东大门核心商场档口的全量货源。" },
    ],
  }),
  component: ShopsIndex,
});

function ShopsIndex() {
  return (
    <MobileShell>
      <MobileHeader title="档口" />
      <div className="px-4 pt-3">
        <Input placeholder="搜索档口名 / 商场 / 楼层" className="bg-muted/50" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {["全部", "Migliore", "Doota", "apM", "Hello apM", "Maxtyle"].map((b) => (
            <Badge key={b} variant="outline" className="shrink-0">{b}</Badge>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-3 px-4">
        {SHOPS.map((s) => (
          <Link key={s.id} to="/shops/$id" params={{ id: s.id }} className="flex gap-3 rounded-xl border border-border bg-card p-3">
            <img src={s.cover} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.nameKo} · {s.building} {s.floor}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            </div>
            <div className="self-center text-right">
              <div className="text-base font-semibold">{s.productCount}</div>
              <div className="text-[10px] text-muted-foreground">在售款</div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}