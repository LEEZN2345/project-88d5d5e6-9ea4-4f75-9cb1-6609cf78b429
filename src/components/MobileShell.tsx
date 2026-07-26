import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Store, Users, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { PendingCheckoutRecovery } from "@/components/PendingCheckoutRecovery";

const TABS = [
  { to: "/", icon: Home, label: "首页" },
  { to: "/shops", icon: Store, label: "档口" },
  { to: "/discover", icon: Compass, label: "发现好物" },
  { to: "/groups", icon: Users, label: "拼单广场" },
  { to: "/me", icon: User, label: "我的" },
] as const;

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <PendingCheckoutRecovery />
      <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to as string}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-display font-bold uppercase tracking-tight transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
              </span>
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
  center,
  right,
  back,
}: {
  title: string;
  center?: React.ReactNode;
  right?: React.ReactNode;
  back?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => history.back()}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ←
          </button>
        )}
        <h1 className="font-display text-base font-black tracking-tight uppercase">{title}</h1>
      </div>
      <div className="flex justify-center">{center}</div>
      <div className="flex justify-end">{right}</div>
    </header>
  );
}
