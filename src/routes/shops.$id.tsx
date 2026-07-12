import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS, PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Sparkles, Tag, Heart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shops/$id")({
  component: ShopDetail,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-8 text-center text-sm">档口不存在</div>
    </MobileShell>
  ),
});

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-07-12");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

function getFavShops(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("fav_shops") || "[]") as string[];
  } catch {
    return [];
  }
}

function setFavShops(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fav_shops", JSON.stringify(ids));
}

type Filter = "all" | "new" | "sale";

function ShopDetail() {
  const { id } = Route.useParams();
  const shop = SHOPS.find((s) => s.id === id);
  if (!shop) throw notFound();
  const allProducts = PRODUCTS.filter((p) => p.shopId === id);
  const [filter, setFilter] = useState<Filter>("all");
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(getFavShops().includes(id));
  }, [id]);

  const toggleFav = () => {
    const favs = getFavShops();
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [...favs, id];
    setFavShops(next);
    setIsFav(!isFav);
  };

  const products = useMemo(() => {
    const list =
      filter === "new"
        ? allProducts.filter((p) => p.isNew || daysAgo(p.uploadedAt) <= 14)
        : filter === "sale"
        ? allProducts.filter((p) => p.discount)
        : allProducts;
    return [...list].sort(
      (a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt),
    );
  }, [allProducts, filter]);

  const newestUpload = allProducts
    .map((p) => p.uploadedAt)
    .sort()
    .at(-1);
  const saleCount = allProducts.filter((p) => p.discount).length;
  const newCount = allProducts.filter(
    (p) => p.isNew || daysAgo(p.uploadedAt) <= 14,
  ).length;
  const singleBuy = shop.minOrderQty === 1;

  const title = shop.brand || shop.name;

  return (
    <MobileShell>
      <MobileHeader title={shop.name} back />
      <div className="relative h-44">
        <img src={shop.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="-mt-10 px-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xl font-bold leading-tight">{title}</div>
              {shop.brand && shop.brand !== shop.name && (
                <div className="text-xs text-muted-foreground">{shop.name}</div>
              )}
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                位置：{shop.building} {shop.floor}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-lg font-semibold">{shop.productCount}</div>
              <div className="text-muted-foreground">在售款</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              className={cn(
                "text-[11px] font-medium",
                singleBuy
                  ? "bg-emerald-500 text-white hover:bg-emerald-500"
                  : "bg-amber-500 text-white hover:bg-amber-500",
              )}
            >
              <Package className="mr-1 h-3 w-3" />
              {singleBuy ? "支持单件购买" : "同款 2 件起订"}
            </Badge>
            {shop.tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-[11px] font-medium"
              >
                {t}
              </Badge>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mt-3 w-full text-xs",
              isFav && "border-rose-500 text-rose-500 hover:text-rose-500",
            )}
            onClick={toggleFav}
          >
            <Heart
              className={cn(
                "mr-1 h-4 w-4",
                isFav && "fill-rose-500 text-rose-500",
              )}
            />
            {isFav ? "已收藏档口" : "收藏档口"}
          </Button>

          {newestUpload && (
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                最新上新 {daysAgo(newestUpload)} 天前
              </span>
              {saleCount > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-rose-500" />
                  {saleCount} 款打折中
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 px-4">
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: `全部 ${allProducts.length}` },
              { key: "new", label: `上新 ${newCount}` },
              { key: "sale", label: `打折 ${saleCount}` },
            ] as { key: Filter; label: string }[]
          ).map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                filter === c.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-6">
        {products.map((p) => (
          <Link
            key={p.id}
            to="/products/$id"
            params={{ id: p.id }}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[3/4]">
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-full w-full object-cover"
              />
              {p.discount ? (
                <Badge className="absolute left-2 top-2 bg-rose-500 text-white">
                  -{p.discount}%
                </Badge>
              ) : p.isNew ? (
                <Badge className="absolute left-2 top-2 bg-blue-500 text-white">
                  新款
                </Badge>
              ) : null}
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                {daysAgo(p.uploadedAt) === 0
                  ? "今日上新"
                  : `${daysAgo(p.uploadedAt)}天前`}
              </span>
            </div>
            <div className="p-2">
              <div className="line-clamp-1 text-xs">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-semibold">
                  {formatKRW(p.priceKRW)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ≈{formatCNY(krwToCny(p.priceKRW))}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {p.internalCode}
              </div>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
            当前筛选下暂无商品
          </div>
        )}
      </div>
    </MobileShell>
  );
}
