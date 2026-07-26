import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hot-shops")({
  head: () => ({
    meta: [
      { title: "热门档口 · 东大门蚂蚁" },
      { name: "description", content: "东大门人气档口推荐,精选高销量与买手热门补货档口。" },
    ],
  }),
  component: HotShopsPage,
});

function HotShopsPage() {
  return (
    <MobileShell>
      <MobileHeader title="热门档口" back />
      <div className="space-y-3 px-4 py-3">
        {SHOPS.map((s) => (
          <Link
            key={s.id}
            to="/shops/$id"
            params={{ id: s.id }}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img src={s.cover} alt={s.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.building} · {s.floor}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="shrink-0 self-center text-xs text-muted-foreground">
                {s.productCount} 款
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}