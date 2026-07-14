import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Badge } from "@/components/ui/badge";
import { EXCHANGES, EXCHANGE_STATUS_LABEL, EXCHANGE_REASON_LABEL } from "@/lib/mock-data";
import { Undo2 } from "lucide-react";

export const Route = createFileRoute("/exchanges/")({
  head: () => ({ meta: [{ title: "售后 / 换货 · 东大门订货通" }] }),
  component: BuyerExchanges,
});

function BuyerExchanges() {
  return (
    <MobileShell>
      <MobileHeader title="售后 / 换货" back />
      <div className="mx-4 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
        <div className="mb-0.5 flex items-center gap-1.5 font-medium">
          <Undo2 className="h-3.5 w-3.5" /> 平台仅支持换货，不支持退货
        </div>
        <div>签收 7 天内可申请。审核通过后请将货物寄回平台<b>国内集运仓</b>，由平台统一转寄韩国档口配货后再重新发出。</div>
      </div>

      <div className="space-y-3 px-4 pt-3 pb-6">
        {EXCHANGES.map((e) => (
          <Link
            key={e.id}
            to="/exchanges/$id"
            params={{ id: e.id }}
            className="block rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] text-muted-foreground">{e.id}</div>
              <Badge variant={e.status === "rejected" ? "outline" : e.status === "completed" ? "secondary" : "default"}>
                {EXCHANGE_STATUS_LABEL[e.status]}
              </Badge>
            </div>
            <div className="mt-2 flex gap-3">
              <img src={e.item.image} alt="" className="h-16 w-16 rounded-md object-cover" />
              <div className="flex-1 text-xs">
                <div className="line-clamp-2">{e.item.productName}</div>
                <div className="mt-1 text-muted-foreground">
                  <span className="line-through">{e.item.fromColor}/{e.item.fromSize}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium text-foreground">{e.item.toColor}/{e.item.toSize}</span>
                  <span className="ml-1">×{e.item.qty}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  原因：{EXCHANGE_REASON_LABEL[e.reason]} · 提交 {e.createdAt}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}