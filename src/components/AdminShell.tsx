import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wallet,
  Undo2,
  Truck,
  Users2,
  Gift,
  Settings2,
} from "lucide-react";

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
  group?: string;
};
const NAV: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "概览", exact: true, group: "经营" },
  { to: "/admin/orders", icon: ClipboardList, label: "订单", group: "经营" },
  { to: "/admin/groups", icon: Users2, label: "拼单管理", group: "经营" },
  { to: "/admin/refunds", icon: Undo2, label: "退款工单", group: "经营" },
  { to: "/admin/products", icon: Package, label: "商品管理", group: "商品" },
  { to: "/admin/shops", icon: Package, label: "档口管理", group: "商品" },
  { to: "/admin/logistics", icon: Truck, label: "物流导入", group: "商品" },
  { to: "/admin/users", icon: Users2, label: "用户 / KYC", group: "用户与增长" },
  { to: "/admin/points-mall", icon: Gift, label: "积分商城", group: "用户与增长" },
  { to: "/admin/payment-accounts", icon: Wallet, label: "商户号", group: "资金" },
  { to: "/admin/config", icon: Settings2, label: "汇率与配置", group: "系统" },
];

const GROUP_ORDER = ["经营", "商品", "用户与增长", "资金", "系统"] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-background md:block">
        <div className="border-b border-border px-5 py-4">
          <div className="text-sm font-semibold">东大门订货通</div>
          <div className="text-xs text-muted-foreground">运营后台 · M1</div>
        </div>
        <nav className="flex flex-col gap-3 p-2">
          {GROUP_ORDER.map((g) => (
            <div key={g}>
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {g}
              </div>
              {NAV.filter((n) => n.group === g).map(({ to, icon: Icon, label, exact }) => {
                const active = exact ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to as string}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-x-hidden">
        <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <span className="text-sm font-semibold">运营后台</span>
          <Link to="/" className="text-xs text-muted-foreground">
            返回买手端 →
          </Link>
        </header>
        <div className="flex flex-wrap gap-1 border-b border-border bg-background px-2 py-2 md:hidden">
          {NAV.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to as string}
                className={cn(
                  "rounded-md px-2 py-1 text-xs",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}