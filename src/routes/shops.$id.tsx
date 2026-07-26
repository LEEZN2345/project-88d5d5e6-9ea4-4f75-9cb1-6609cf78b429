import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { SHOPS, PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Package,
  Heart,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Crown, Sparkles } from "lucide-react";
import catNewImg from "@/assets/cat-new.jpg";
import catSaleImg from "@/assets/cat-sale.jpg";
import { useBanner } from "@/lib/banners";

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

type SortKey = "newest" | "oldest";
type DiscountFilter = "all" | "sale";
type NewFilter = "all" | "new";

function fmtDateLabel(d: string) {
  const dt = new Date(d);
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  const ago = daysAgo(d);
  const wd = ["日", "一", "二", "三", "四", "五", "六"][dt.getDay()];
  if (ago === 0) return `${m}/${day} (今天)`;
  if (ago === 1) return `${m}/${day} (昨天)`;
  return `${m}/${day} (周${wd})`;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ShopDetail() {
  const { id } = Route.useParams();
  const shop = SHOPS.find((s) => s.id === id);
  if (!shop) throw notFound();
  const allProducts = PRODUCTS.filter((p) => p.shopId === id);

  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");
  const [newFilter, setNewFilter] = useState<NewFilter>("all");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateListExpanded, setDateListExpanded] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const memberBanner = useBanner("shop_member");

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

  const dateGroups = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      map.set(p.uploadedAt, (map.get(p.uploadedAt) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count, isNew: daysAgo(date) <= 2 }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [allProducts]);

  const latestDate = dateGroups[0]?.date;

  const uploadDateSet = useMemo(
    () => new Set(dateGroups.map((g) => g.date)),
    [dateGroups],
  );

  const products = useMemo(() => {
    let list = allProducts;
    if (newFilter === "new") list = list.filter((p) => p.isNew);
    if (discountFilter === "sale") list = list.filter((p) => p.discount);
    if (selectedDates.length > 0)
      list = list.filter((p) => selectedDates.includes(p.uploadedAt));
    return [...list].sort((a, b) => {
      const diff = +new Date(b.uploadedAt) - +new Date(a.uploadedAt);
      return sortBy === "newest" ? diff : -diff;
    });
  }, [allProducts, newFilter, discountFilter, selectedDates, sortBy]);

  const toggleDate = (d: string) => {
    setSelectedDates((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const singleBuy = shop.minOrderQty === 1;
  const title = shop.brand || shop.name;

  return (
    <MobileShell>
      <MobileHeader title={shop.name} back />
      <div className="px-4 pt-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xl font-bold leading-tight">{title}</div>
          {shop.brand && shop.brand !== shop.name && (
            <div className="text-xs text-muted-foreground">{shop.name}</div>
          )}
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            位置：{shop.building} {shop.floor}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Badge
              className={cn(
                "flex-1 justify-center py-1 text-[11px] font-medium",
                singleBuy
                  ? "bg-emerald-500 text-white hover:bg-emerald-500"
                  : "bg-amber-500 text-white hover:bg-amber-500",
              )}
            >
              <Package className="mr-1 h-3 w-3" />
              {singleBuy ? "支持单件购买" : "同款 2 件起订"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 shrink-0 px-3 text-xs",
                isFav && "border-rose-500 text-rose-500 hover:text-rose-500",
              )}
              onClick={toggleFav}
            >
              <Heart
                className={cn(
                  "mr-1 h-3.5 w-3.5",
                  isFav && "fill-rose-500 text-rose-500",
                )}
              />
              {isFav ? "已收藏" : "收藏档口"}
            </Button>
          </div>
        </div>
      </div>

      {/* 排序 & 筛选 */}
      <div className="mt-4 flex gap-2 px-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
              排序：{sortBy === "newest" ? "最新上架" : "最早上架"}
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start">
            {(
              [
                { k: "newest", label: "最新上架" },
                { k: "oldest", label: "最早上架" },
              ] as { k: SortKey; label: string }[]
            ).map((o) => (
              <button
                key={o.k}
                onClick={() => setSortBy(o.k)}
                className={cn(
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted",
                  sortBy === o.k && "font-medium",
                )}
              >
                {o.label}
                {sortBy === o.k && <Check className="h-3 w-3" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setNewFilter((v) => (v === "new" ? "all" : "new"))}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs",
            newFilter === "new"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-muted/40",
          )}
        >
          档口新款
        </button>

        <button
          onClick={() =>
            setDiscountFilter((v) => (v === "sale" ? "all" : "sale"))
          }
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs",
            discountFilter === "sale"
              ? "border-rose-500 bg-rose-50 text-rose-600"
              : "border-border bg-muted/40",
          )}
        >
          档口打折
        </button>
      </div>

      {/* 会员专享 banner */}
      {memberBanner?.enabled !== false && (
      <div className="mt-3 px-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 via-rose-500 to-amber-500 p-3 text-white shadow-sm">
          {memberBanner?.image && (
            <img
              src={memberBanner.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}
          <div className="relative">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 shrink-0 text-amber-200" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[13px] font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                {memberBanner?.title || "快人一步，档口新款抢先预定"}
              </div>
              <div className="text-[10px] text-white/85">
                {memberBanner?.subtitle || "会员专享 · 独家上新提前锁定"}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
              开通会员
            </span>
          </div>
          </div>
        </div>
      </div>
      )}

      {/* 分类入口：档口新款 & 档口打折 */}
      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        <button
          onClick={() => {
            setNewFilter("new");
            setDiscountFilter("all");
          }}
          className={cn(
            "group relative aspect-[16/10] overflow-hidden rounded-xl border text-left",
            newFilter === "new"
              ? "border-primary ring-2 ring-primary/40"
              : "border-border",
          )}
        >
          <img
            src={catNewImg}
            alt="档口新款"
            loading="lazy"
            width={768}
            height={512}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
            <div className="text-sm font-bold">档口新款</div>
            <div className="text-[10px] text-white/80">最新上架 · 抢先预定</div>
          </div>
          <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            NEW
          </span>
        </button>

        <button
          onClick={() => {
            setDiscountFilter("sale");
            setNewFilter("all");
          }}
          className={cn(
            "group relative aspect-[16/10] overflow-hidden rounded-xl border text-left",
            discountFilter === "sale"
              ? "border-rose-500 ring-2 ring-rose-500/40"
              : "border-border",
          )}
        >
          <img
            src={catSaleImg}
            alt="档口打折"
            loading="lazy"
            width={768}
            height={512}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
            <div className="text-sm font-bold">档口打折</div>
            <div className="text-[10px] text-white/80">限时特惠 · 折扣好物</div>
          </div>
          <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-medium text-white">
            SALE
          </span>
        </button>
      </div>

      {/* 按新款日期 */}
      <div className="mt-3 px-4">
        <div className="rounded-xl border border-border bg-card">
          <button
            onClick={() => setDateListExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-xs"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              按新款日期
              {selectedDates.length > 0 ? (
                <Badge className="ml-1 bg-foreground text-background">
                  已选 {selectedDates.length}
                </Badge>
              ) : latestDate ? (
                <span className="truncate text-muted-foreground">
                  · 最新 {fmtDateLabel(latestDate)}上新
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
                dateListExpanded && "rotate-180",
              )}
            />
          </button>

          {dateListExpanded && (
            <div className="border-t border-border p-3">
              <div className="mb-2 text-[11px] text-muted-foreground">
                请选择上架日期 (可多选)
              </div>
              <div className="space-y-1">
                {dateGroups.slice(0, 6).map((g) => {
                  const active = selectedDates.includes(g.date);
                  return (
                    <button
                      key={g.date}
                      onClick={() => toggleDate(g.date)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs",
                        active
                          ? "border-foreground bg-foreground/5"
                          : "border-border",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                            active
                              ? "border-foreground bg-foreground"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {active && (
                            <Check className="h-2.5 w-2.5 text-background" />
                          )}
                        </span>
                        {fmtDateLabel(g.date)}
                        <span className="text-muted-foreground">
                          {g.count}款
                        </span>
                        {g.isNew && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    查看全部日期
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates.map((d) => new Date(d))}
                    onSelect={(dates) => {
                      const arr = (dates || []).map((d) => toISO(d as Date));
                      setSelectedDates(arr.filter((d) => uploadDateSet.has(d)));
                    }}
                    modifiers={{
                      hasUpload: (date) => uploadDateSet.has(toISO(date)),
                    }}
                    modifiersClassNames={{
                      hasUpload:
                        "relative before:absolute before:bottom-0.5 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:bg-rose-500",
                    }}
                    className={cn("pointer-events-auto p-3")}
                  />
                </PopoverContent>
              </Popover>

              {selectedDates.length > 0 && (
                <button
                  onClick={() => setSelectedDates([])}
                  className="mt-2 w-full text-center text-[11px] text-muted-foreground underline"
                >
                  清除日期筛选
                </button>
              )}
            </div>
          )}
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