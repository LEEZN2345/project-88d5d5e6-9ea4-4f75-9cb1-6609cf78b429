import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  QrCode,
  Link2,
  Search,
  Sparkles,
  Store,
  Package,
  FileText,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/me/promo-links")({
  head: () => ({ meta: [{ title: "我的推广链接 · 东大门订货通" }] }),
  component: PromoLinks,
});

type LinkType = "post" | "product" | "shop";
const AUTHOR = "小A"; // mock：当前用户

type PromoItem = {
  id: string;
  type: LinkType;
  title: string;
  subtitle: string;
  cover: string;
  path: string;
  priceCNY?: number;
  commission?: number;
  clicks: number;
  orders: number;
  earned: number;
  createdAt: string;
};

function buildOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://ddm.example.com";
}

function PromoLinks() {
  const [tab, setTab] = useState<"all" | LinkType>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<PromoItem | null>(null);

  const items = useMemo<PromoItem[]>(() => {
    const products = PRODUCTS.slice(0, 4).map((p, i) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const priceCNY = krwToCny(p.priceKRW);
      return {
        id: `post-${p.id}`,
        type: "post" as LinkType,
        title: `📸 ${p.name} 好物推荐`,
        subtitle: `${shop?.name ?? "档口"} · 拼单价 ${formatCNY(priceCNY)}`,
        cover: p.images[0],
        path: `/discover/${p.id}`,
        priceCNY,
        commission: Math.round(priceCNY * 0.1 * 100) / 100,
        clicks: 120 + i * 60,
        orders: 3 + i * 2,
        earned: Math.round(priceCNY * 0.1 * (3 + i * 2) * 100) / 100,
        createdAt: `2026-07-${20 - i}`,
      };
    });
    const prods = PRODUCTS.slice(4, 6).map((p, i) => {
      const shop = SHOPS.find((s) => s.id === p.shopId);
      const priceCNY = krwToCny(p.priceKRW);
      return {
        id: `product-${p.id}`,
        type: "product" as LinkType,
        title: p.name,
        subtitle: `${shop?.name ?? "档口"} · 拼单价 ${formatCNY(priceCNY)}`,
        cover: p.images[0],
        path: `/products/${p.id}`,
        priceCNY,
        commission: Math.round(priceCNY * 0.1 * 100) / 100,
        clicks: 60 + i * 30,
        orders: 1 + i,
        earned: Math.round(priceCNY * 0.1 * (1 + i) * 100) / 100,
        createdAt: `2026-07-${15 - i}`,
      };
    });
    const shops = SHOPS.slice(0, 2).map((s, i) => ({
      id: `shop-${s.id}`,
      type: "shop" as LinkType,
      title: s.name,
      subtitle: `${s.building} · ${s.floor} ${s.position}`,
      cover: PRODUCTS.find((p) => p.shopId === s.id)?.images[0] ?? "",
      path: `/shops/${s.id}`,
      clicks: 40 + i * 25,
      orders: 2 + i,
      earned: 68 + i * 40,
      createdAt: `2026-07-${12 - i}`,
    }));
    return [...products, ...prods, ...shops];
  }, []);

  const totals = useMemo(
    () => ({
      links: items.length,
      clicks: items.reduce((s, x) => s + x.clicks, 0),
      orders: items.reduce((s, x) => s + x.orders, 0),
      earned: Math.round(items.reduce((s, x) => s + x.earned, 0) * 100) / 100,
    }),
    [items],
  );

  const list = items
    .filter((x) => (tab === "all" ? true : x.type === tab))
    .filter((x) =>
      q.trim() ? (x.title + x.subtitle).toLowerCase().includes(q.trim().toLowerCase()) : true,
    );

  const buildUrl = (path: string) =>
    `${buildOrigin()}${path}?ref=${encodeURIComponent(AUTHOR)}`;

  const copy = async (text: string, tip = "链接已复制") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(tip);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        toast.success(tip);
      } catch {
        toast.error("复制失败，请长按手动复制");
      }
      document.body.removeChild(el);
    }
  };

  return (
    <MobileShell>
      <MobileHeader title="我的推广链接" backTo="/me/posts" />

      {/* 汇总看板 */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow">
        <div className="grid grid-cols-4 gap-1 text-center">
          <Stat label="链接数" value={String(totals.links)} />
          <Stat label="总点击" value={totals.clicks.toLocaleString()} />
          <Stat label="成交单" value={String(totals.orders)} />
          <Stat label="累计佣金" value={formatCNY(totals.earned)} />
        </div>
      </div>

      {/* 搜索 */}
      <div className="mx-3 mt-3 flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索商品/档口/笔记标题"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-30 mt-2 flex gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        {(
          [
            { k: "all", l: "全部", icon: Link2 },
            { k: "post", l: "好物笔记", icon: FileText },
            { k: "product", l: "商品", icon: Package },
            { k: "shop", l: "档口", icon: Store },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
              tab === t.k
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.l}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="space-y-3 px-3 pb-24 pt-3">
        {list.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            没有匹配的推广链接，去
            <Link to="/discover/new" className="mx-1 text-primary underline">
              发布好物
            </Link>
            生成第一条链接
          </div>
        )}
        {list.map((x) => {
          const url = buildUrl(x.path);
          return (
            <div key={x.id} className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {x.cover && (
                    <img src={x.cover} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute left-0 top-0 rounded-br-md bg-black/60 px-1 text-[9px] text-white">
                    {typeLabel(x.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold">{x.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {x.subtitle}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>👁️ {x.clicks}</span>
                    <span>🛒 {x.orders}</span>
                    <span className="text-amber-600 font-semibold">💰 {formatCNY(x.earned)}</span>
                  </div>
                </div>
              </div>

              {/* URL 缩略 + 操作 */}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                  {url}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => copy(url)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-2 text-xs font-bold text-white shadow"
                >
                  <Copy className="h-3.5 w-3.5" /> 一键复制
                </button>
                <button
                  onClick={() => setActive(x)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-medium"
                >
                  <QrCode className="h-3.5 w-3.5" /> 生成二维码
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部生成入口 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
        <Link
          to="/discover/new"
          className="mx-auto flex max-w-md items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow"
        >
          <Sparkles className="h-4 w-4" /> 发布好物 · 生成新链接
        </Link>
      </div>

      {/* 二维码弹层 */}
      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>推广二维码</DialogTitle>
            <DialogDescription>
              好友扫码进入，下单佣金自动归属 @{AUTHOR}
            </DialogDescription>
          </DialogHeader>

          {active && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-2">
                {active.cover && (
                  <img
                    src={active.cover}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">{active.title}</div>
                  <div className="line-clamp-1 text-[11px] text-muted-foreground">
                    {active.subtitle}
                  </div>
                </div>
              </div>

              <div id="promo-qr-wrap" className="flex justify-center rounded-xl bg-white p-4">
                <QRCodeSVG
                  value={buildUrl(active.path)}
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>

              <div className="break-all rounded-lg bg-muted/50 p-2 text-center text-[11px] text-muted-foreground">
                {buildUrl(active.path)}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => copy(buildUrl(active.path))}
                  className="flex items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground"
                >
                  <Copy className="h-3.5 w-3.5" /> 复制
                </button>
                <button
                  onClick={() => downloadQr(active.id, active.title)}
                  className="flex items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-medium"
                >
                  <Download className="h-3.5 w-3.5" /> 保存
                </button>
                <button
                  onClick={async () => {
                    const url = buildUrl(active.path);
                    const text = `${active.title}\n${url}`;
                    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
                      try {
                        await (navigator as Navigator).share({
                          title: active.title,
                          text,
                          url,
                        });
                        return;
                      } catch {
                        // fallthrough
                      }
                    }
                    copy(text, "文案+链接已复制");
                  }}
                  className="flex items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-medium"
                >
                  <Share2 className="h-3.5 w-3.5" /> 分享
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] opacity-90">{label}</div>
      <div className="mt-0.5 text-base font-black leading-none">{value}</div>
    </div>
  );
}

function typeLabel(t: LinkType) {
  return t === "post" ? "笔记" : t === "product" ? "商品" : "档口";
}

function downloadQr(id: string, name: string) {
  const wrap = document.getElementById("promo-qr-wrap");
  const svg = wrap?.querySelector("svg");
  if (!svg) {
    toast.error("二维码尚未渲染");
    return;
  }
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const src = `data:image/svg+xml;base64,${svg64}`;
  const img = new Image();
  img.onload = () => {
    const size = 640;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `promo-${id}.png`;
    a.click();
    toast.success(`已保存二维码：${name}`);
  };
  img.src = src;
}
