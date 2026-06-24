import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BuildingFilterSheet, type BuildingSelection } from "@/components/BuildingFilterSheet";
import { Filter, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState<"商城档口" | "推荐的档口" | "我交易的档口">("商城档口");
  const [filters, setFilters] = useState<BuildingSelection[]>([]);
  const filtered = filters.length === 0
    ? SHOPS
    : SHOPS.filter((s) =>
        filters.some((f) =>
          s.building?.toLowerCase().includes(f.building.toLowerCase()) &&
          (f.floor === "全部" || s.floor === f.floor)
        )
      );
  return (
    <MobileShell>
      <MobileHeader
        title="档口"
        right={
          <div className="flex items-center gap-3 text-muted-foreground">
            <Search className="h-5 w-5" />
            <ShoppingCart className="h-5 w-5" />
          </div>
        }
      />
      <div className="flex items-center gap-6 border-b border-border px-4 pt-2">
        {(["商城档口", "推荐的档口", "我交易的档口"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative pb-2 text-sm",
              tab === t ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 pt-3">
        <Input placeholder="搜索档口名 / 商场 / 楼层" className="bg-muted/50" />
        <BuildingFilterSheet
          value={filters}
          onChange={setFilters}
          trigger={
            <button className="flex h-9 shrink-0 items-center gap-1 rounded-md border border-border px-3 text-xs">
              <Filter className="h-4 w-4" />
              商场
              {filters.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {filters.length}
                </span>
              )}
            </button>
          }
        />
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-2">
          {filters.map((f) => (
            <Badge key={`${f.building}-${f.floor}`} variant="secondary" className="text-[11px]">
              {f.building}{f.floor !== "全部" ? ` / ${f.floor}` : ""}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-3 px-4">
        {filtered.map((s) => (
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
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            该楼层暂无档口，请调整筛选
          </div>
        )}
      </div>
    </MobileShell>
  );
}