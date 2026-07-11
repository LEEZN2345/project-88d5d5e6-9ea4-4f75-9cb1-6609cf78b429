import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, formatCNY, krwToCny } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Share2, Flame } from "lucide-react";

export const Route = createFileRoute("/groups")({
  head: () => ({ meta: [{ title: "拼单广场 · 东大门订货通" }] }),
  component: GroupsPlaza,
});

type GroupItem = {
  productId: string;
  joined: number;
  need: number;
  endsIn: string;
  leader: string;
};

const GROUPS: GroupItem[] = [
  { productId: "p1", joined: 3, need: 4, endsIn: "23:59:12", leader: "小美" },
  { productId: "p2", joined: 2, need: 3, endsIn: "05:12:44", leader: "阿龙" },
  { productId: "p3", joined: 1, need: 2, endsIn: "11:03:28", leader: "Lily" },
  { productId: "p4", joined: 4, need: 5, endsIn: "02:20:07", leader: "老王" },
];

function GroupsPlaza() {
  return (
    <MobileShell>
      <MobileHeader title="拼单广场" />
      <div className="bg-gradient-to-br from-sky-500 to-indigo-500 px-4 py-4 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="h-4 w-4" /> 正在拼的团 · 差 1 人即可成团享 13% 毛利价
        </div>
        <div className="mt-1 text-xs opacity-90">加入他人的拼团,无需自己开团、无需邀请好友</div>
      </div>

      <div className="space-y-3 p-4">
        {GROUPS.map((g) => {
          const p = PRODUCTS.find((x) => x.id === g.productId);
          if (!p) return null;
          const groupCNY = krwToCny(p.priceKRW) * 1.13;
          const soloCNY = krwToCny(p.priceKRW) * 1.2;
          const saved = soloCNY - groupCNY;
          const remain = g.need - g.joined;
          return (
            <div key={g.productId} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex gap-3">
                <Link to="/products/$id" params={{ id: p.id }} className="shrink-0">
                  <img src={p.images[0]} alt={p.name} className="h-20 w-20 rounded-lg object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">团长 {g.leader} · 内部款号 {p.internalCode}</div>
                    </div>
                    <Badge className="shrink-0 bg-sky-500 text-white">拼单价</Badge>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-sky-600">{formatCNY(groupCNY)}</span>
                    <span className="text-[11px] text-muted-foreground line-through">{formatCNY(soloCNY)}</span>
                    <span className="text-[11px] text-amber-600">省 {formatCNY(saved)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-600" />
                  <span>{g.joined}/{g.need} 人</span>
                  <span className="text-muted-foreground">· 还差</span>
                  <b className="text-rose-500">{remain}</b>
                  <span className="text-muted-foreground">人</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {g.endsIn}
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Share2 className="h-3.5 w-3.5" /> 分享此团
                </Button>
                <Button size="sm" className="flex-1">加入拼单</Button>
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          没有合适的团?去 <Link to="/" className="text-primary underline underline-offset-2">首页</Link> 挑选商品自己开一个。
        </div>
      </div>
    </MobileShell>
  );
}