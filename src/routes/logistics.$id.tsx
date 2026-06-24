import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHIPMENT_EVENTS } from "@/lib/mock-data";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/logistics/$id")({
  component: Logistics,
});

const FULL_NODES = ["韩国仓入库", "打包出库", "起运", "到港清关", "国内派送", "已签收"] as const;

function Logistics() {
  const { id } = Route.useParams();
  const events = SHIPMENT_EVENTS[id] ?? [];
  const reached = new Set(events.map((e) => e.node));

  return (
    <MobileShell>
      <MobileHeader title="物流跟踪" back />
      <div className="px-4 pt-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">运单号</div>
          <div className="font-mono text-sm">{id}</div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="text-sm font-medium">物流时间线</div>
        <div className="mt-3 space-y-0">
          {FULL_NODES.map((node, idx) => {
            const ev = events.find((e) => e.node === node);
            const done = reached.has(node);
            return (
              <div key={node} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  {idx < FULL_NODES.length - 1 && <div className={`mt-1 h-10 w-px ${done ? "bg-primary" : "bg-border"}`} />}
                </div>
                <div className="-mt-0.5 pb-6">
                  <div className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>{node}</div>
                  {ev && (
                    <>
                      <div className="text-[11px] text-muted-foreground">{ev.time}</div>
                      {ev.note && <div className="text-[11px] text-muted-foreground">{ev.note}</div>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}