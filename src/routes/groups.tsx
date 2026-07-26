import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, formatCNY, krwToCny } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Clock, Share2, Flame, Store, User as UserIcon, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/groups")({
  head: () => ({ meta: [{ title: "拼单广场 · 东大门蚂蚁" }] }),
  component: GroupsPlaza,
});

type GroupItem = {
  productId: string;
  joined: number;
  need: number;
  endsIn: string;
  leader: string;
  leaderId: string;
};

const INITIAL_GROUPS: GroupItem[] = [
  { productId: "p1", joined: 1, need: 2, endsIn: "23:59:12", leader: "小美", leaderId: "@xiaomei_88" },
  { productId: "p2", joined: 1, need: 2, endsIn: "05:12:44", leader: "阿龙", leaderId: "@along_kr" },
  { productId: "p3", joined: 1, need: 2, endsIn: "11:03:28", leader: "Lily", leaderId: "@lily_ddm" },
  { productId: "p4", joined: 1, need: 2, endsIn: "02:20:07", leader: "老王", leaderId: "@laowang01" },
];

function GroupsPlaza() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
  const [shareOf, setShareOf] = useState<GroupItem | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareOf ? `https://ddm.app/groups/${shareOf.productId}` : "";
  const shareProduct = shareOf ? PRODUCTS.find((x) => x.id === shareOf.productId) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("链接已复制");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("复制失败，请手动选择");
    }
  };

  return (
    <MobileShell>
      <MobileHeader title="拼单广场" />
      <div className="bg-gradient-to-br from-sky-500 to-primary px-4 py-4 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="h-4 w-4" /> 正在拼的团 · 满 2 人即可成团享拼单价
        </div>
        <div className="mt-1 text-xs opacity-90">加入他人的拼团,无需自己开团、无需邀请好友</div>
      </div>

      <div className="space-y-3 p-4">
        {groups.map((g) => {
          const p = PRODUCTS.find((x) => x.id === g.productId);
          if (!p) return null;
          const shop = SHOPS.find((s) => s.id === p.shopId);
          const groupCNY = krwToCny(p.priceKRW) * 1.15;
          const soloCNY = krwToCny(p.priceKRW) * 1.2;
          const saved = soloCNY - groupCNY;
          const remain = g.need - g.joined;
          const full = remain <= 0;
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
                      {shop && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Store className="h-3 w-3 shrink-0" />
                          <span className="truncate">{shop.name} · {shop.building} {shop.floor}</span>
                        </div>
                      )}
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <UserIcon className="h-3 w-3 shrink-0" />
                        <span>团长 {g.leaderId}</span>
                      </div>
                    </div>
                    <Badge className={`shrink-0 ${full ? "bg-emerald-500" : "bg-sky-500"} text-white`}>
                      {full ? "已成团" : "拼单价"}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-bold text-sky-600">{formatCNY(groupCNY)}</span>
                    <span className="text-[11px] text-muted-foreground line-through">{formatCNY(soloCNY)}</span>
                    <span className="text-[11px] text-amber-600">省 {formatCNY(saved)}（对比单件直购）</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-600" />
                  <span>{g.joined}/{g.need} 人</span>
                  {full ? (
                    <span className="text-emerald-600">· 已满员</span>
                  ) : (
                    <>
                      <span className="text-muted-foreground">· 还差</span>
                      <b className="text-rose-500">{remain}</b>
                      <span className="text-muted-foreground">人</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {g.endsIn}
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => setShareOf(g)}
                >
                  <Share2 className="h-3.5 w-3.5" /> 分享此团
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={full}
                  onClick={() =>
                    navigate({
                      to: "/products/$id",
                      params: { id: g.productId },
                      search: { tier: "group" },
                    })
                  }
                >
                  {full ? "已成团" : "加入拼单"}
                </Button>
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          没有合适的团?去 <Link to="/" className="text-primary underline underline-offset-2">首页</Link> 挑选商品自己开一个。
        </div>
      </div>

      {/* 分享此团 */}
      <Dialog open={!!shareOf} onOpenChange={(o) => !o && setShareOf(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>分享此团</DialogTitle>
            <DialogDescription>把链接发给好友，Ta 点击加入即可成团</DialogDescription>
          </DialogHeader>
          {shareProduct && (
            <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-2">
              <img src={shareProduct.images[0]} alt={shareProduct.name} className="h-14 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-medium">{shareProduct.name}</div>
                <div className="mt-0.5 text-muted-foreground">团长 {shareOf?.leaderId}</div>
                <div className="mt-0.5 text-sky-600 font-semibold">
                  {formatCNY(krwToCny(shareProduct.priceKRW) * 1.15)}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
            <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{shareUrl}</div>
            <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={handleCopy}>复制链接分享</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </MobileShell>
  );
}