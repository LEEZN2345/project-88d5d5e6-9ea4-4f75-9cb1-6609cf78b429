import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS, PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/shops/$id")({
  component: ShopDetail,
  notFoundComponent: () => <MobileShell><div className="p-8 text-center text-sm">档口不存在</div></MobileShell>,
});

function ShopDetail() {
  const { id } = Route.useParams();
  const shop = SHOPS.find((s) => s.id === id);
  if (!shop) throw notFound();
  const products = PRODUCTS.filter((p) => p.shopId === id);
  return (
    <MobileShell>
      <MobileHeader title={shop.name} back />
      <div className="relative h-40">
        <img src={shop.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="-mt-8 px-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-semibold">{shop.name}</div>
              <div className="text-xs text-muted-foreground">{shop.nameKo}</div>
              <div className="mt-1 text-xs text-muted-foreground">{shop.building} · {shop.floor}</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-lg font-semibold">{shop.productCount}</div>
              <div className="text-muted-foreground">在售款</div>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {shop.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
          </div>
        </div>
      </div>

      <div className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto">
          {["全部", "上新", "外套", "针织", "裤装", "鞋包"].map((c) => (
            <Badge key={c} variant="outline" className="shrink-0">{c}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {products.map((p) => (
          <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="block overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-[3/4]">
              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              {p.isNew && <Badge className="absolute left-2 top-2 bg-blue-500 text-white">新款</Badge>}
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
        ))}
      </div>
    </MobileShell>
  );
}