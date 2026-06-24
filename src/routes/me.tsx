import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { ChevronRight, MapPin, Heart, MessageSquare, Settings, Shield } from "lucide-react";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "我的 · 东大门订货通" }] }),
  component: Me,
});

function Me() {
  return (
    <MobileShell>
      <MobileHeader title="我的" />
      <div className="bg-gradient-to-br from-primary to-primary/70 px-4 pb-6 pt-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/20 text-xl">👤</div>
          <div>
            <div className="text-base font-semibold">张老板 · 实体店</div>
            <div className="text-xs opacity-80">B 端会员 · 享 -3% 物流费率</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { n: "1", l: "待付款" },
            { n: "2", l: "待发货" },
            { n: "3", l: "在途" },
            { n: "0", l: "售后" },
          ].map((s) => (
            <div key={s.l} className="rounded-md bg-background/10 py-2">
              <div className="text-base font-semibold">{s.n}</div>
              <div className="opacity-80">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        <Item icon={MapPin} label="收货地址" />
        <Item icon={Heart} label="我的收藏" />
        <Item icon={MessageSquare} label="联系客服" />
        <Item icon={Shield} label="实名认证" right="未认证" />
        <Item icon={Settings} label="设置" />
      </div>

      <div className="px-4 pt-4">
        <Link to="/admin" className="block rounded-xl border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
          (内部入口) 进入运营后台 →
        </Link>
      </div>
      <div className="px-4 pt-2">
        <Link to="/auth" className="block rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground">
          切换账号 / 登录
        </Link>
      </div>
    </MobileShell>
  );
}

function Item({ icon: Icon, label, right }: { icon: typeof MapPin; label: string; right?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      {right && <span className="text-xs text-muted-foreground">{right}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}