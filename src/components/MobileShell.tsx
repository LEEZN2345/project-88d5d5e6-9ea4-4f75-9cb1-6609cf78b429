import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Store, ShoppingBag, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", icon: Home, label: "首页" },
  { to: "/shops", icon: Store, label: "档口" },
  { to: "/cart", icon: ShoppingBag, label: "购物车" },
  { to: "/orders", icon: ClipboardList, label: "订单" },
  { to: "/me", icon: User, label: "我的" },
] as const;

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function MobileHeader({
  title,
  right,
  back,
}: {
  title: string;
  right?: React.ReactNode;
  back?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => history.back()}
            className="text-sm text-muted-foreground"
          >
            ←
          </button>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div>{right}</div>
    </header>
  );
}