import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS, PRODUCTS, REFERENCE_RATE, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Flame, Sparkles, TicketPercent, TrendingUp } from "lucide-react";
import { useBanner } from "@/lib/banners";
import { BrandPlate, SignBoard } from "@/components/SignBoard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "东大门订货通 · 首页" },
      { name: "description", content: "为东大门买手与 B 端客户提供档口全量货源:新款抢先、折扣促销、一键下单、全程物流跟踪。" },
      { property: "og:title", content: "东大门订货通" },
      { property: "og:description", content: "档口直采 · 一键代购 · 全程跟踪" },
    ],
  }),
  component: Index,
});

function Index() {
  const newProducts = PRODUCTS.filter((p) => p.isNew);
  const dealProducts = PRODUCTS.filter((p) => p.discount);
  const today = new Date().toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  const krwPerCny = 1 / REFERENCE_RATE; // 1 CNY ≈ ? KRW
  const homeHero = useBanner("home_hero");
  return (
    <MobileShell>
      <MobileHeader
        title="apM 订货通"
        right={<Link to="/admin" className="text-xs text-muted-foreground">运营后台</Link>}
      />
      {/* apM brand hero — bag-style plate */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        <BrandPlate brand="apM" tagline="Worldwide Market" className="col-span-2" />
        <BrandPlate brand="Place" tagline="Wholesale" variant="place" />
      </div>
      <div className="mx-4 mt-2 flex flex-wrap gap-1.5">
        <SignBoard label="apM" code="7F" size="sm" variant="apm" />
        <SignBoard label="Place" code="8F" size="sm" variant="place" />
        <SignBoard label="Luxe" code="7F" size="sm" variant="luxe" />
      </div>
      {homeHero?.enabled !== false && homeHero?.image && (
        <Link
          to={homeHero.link || "/shops"}
          className="mx-4 mt-3 block overflow-hidden rounded-xl border border-border"
        >
          <div className="relative aspect-[5/2] bg-muted">
            <img src={homeHero.image} alt={homeHero.title || ""} className="h-full w-full object-cover" />
            {(homeHero.title || homeHero.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 text-white">
                {homeHero.title && <div className="text-base font-bold">{homeHero.title}</div>}
                {homeHero.subtitle && <div className="text-[11px] opacity-90">{homeHero.subtitle}</div>}
              </div>
            )}
          </div>
        </Link>
      )}
      <div className="mx-4 mt-3 rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">今日参考汇率 · {today}</div>
              <div className="text-sm font-semibold">
                1 CNY ≈ <span className="text-primary">{krwPerCny.toFixed(2)}</span> KRW
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">1000 KRW</div>
            <div className="text-sm font-semibold">≈ {formatCNY(krwToCny(1000))}</div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          仅供参考,实际以代付小票当日锁定汇率为准
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索款号 / 档口 / 品类" className="pl-9 bg-muted/50" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {[
          { to: "/shops", icon: Flame, label: "热门档口", color: "text-orange-500" },
          { to: "/new-arrivals", icon: Sparkles, label: "今日上新", color: "text-primary" },
          { to: "/discounts", icon: TicketPercent, label: "档口折扣", color: "text-rose-500" },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={label} to={to} className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-3">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="mt-1 text-xs text-muted-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <Section title="新款抢先" linkTo="/new-arrivals" linkLabel="更多新款">
        <div className="grid grid-cols-2 gap-3 px-4">
          {newProducts.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>

      <Section title="折扣促销" linkTo="/discounts" linkLabel="全部折扣">
        <div className="grid grid-cols-2 gap-3 px-4">
          {dealProducts.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>

      <Section title="推荐档口" linkTo="/shops" linkLabel="全部档口">
        <div className="space-y-3 px-4">
          {SHOPS.slice(0, 3).map((s) => (
            <Link key={s.id} to="/shops/$id" params={{ id: s.id }} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <img src={s.cover} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.building} · {s.floor}</div>
                </div>
                <div className="flex gap-1">
                  {s.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              </div>
              <div className="self-center text-xs text-muted-foreground">{s.productCount} 款</div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="h-6" />
    </MobileShell>
  );
}

function Section({ title, linkTo, linkLabel, children }: { title: string; linkTo: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to={linkTo} className="text-xs text-muted-foreground">{linkLabel} →</Link>
      </div>
      {children}
    </section>
  );
}

function ProductCard({ p }: { p: (typeof PRODUCTS)[number] }) {
  return (
    <Link to="/products/$id" params={{ id: p.id }} className="block overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[3/4]">
        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
        {p.isNew && <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">新款</Badge>}
        {p.discount && <Badge className="absolute left-2 top-2 bg-rose-500 text-white">-{p.discount}%</Badge>}
      </div>
      <div className="p-2">
        <div className="line-clamp-1 text-xs">{p.name}</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-sm font-semibold">{formatKRW(p.priceKRW)}</span>
          <span className="text-[10px] text-muted-foreground">≈{formatCNY(krwToCny(p.priceKRW))}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">{p.internalCode}</div>
      </div>
    </Link>
  );
}
