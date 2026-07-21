import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Camera, Search, X, Package, Store, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/discover/new")({
  head: () => ({ meta: [{ title: "发布好物 · 东大门订货通" }] }),
  component: NewPost,
});

// 平台默认佣金率（10%），后台可配置
const COMMISSION_RATE = 0.1;

function NewPost() {
  const nav = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [kw, setKw] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const product = useMemo(() => PRODUCTS.find((p) => p.id === productId) ?? null, [productId]);
  const shop = useMemo(() => (product ? SHOPS.find((s) => s.id === product.shopId) : null), [product]);
  const priceCNY = product ? krwToCny(product.priceKRW) : 0;
  const commission = Math.round(priceCNY * COMMISSION_RATE * 100) / 100;

  const results = useMemo(() => {
    const q = kw.trim().toLowerCase();
    const list = q
      ? PRODUCTS.filter((p) => {
          const sh = SHOPS.find((s) => s.id === p.shopId);
          return (
            p.name.toLowerCase().includes(q) ||
            p.internalCode.toLowerCase().includes(q) ||
            sh?.name.toLowerCase().includes(q)
          );
        })
      : PRODUCTS.slice(0, 20);
    return list.slice(0, 30);
  }, [kw]);

  const onPickImage = () => {
    // 前端原型：用随机图占位
    const seed = Math.random().toString(36).slice(2, 8);
    setImages((prev) => [...prev, `https://picsum.photos/seed/${seed}/600/800`].slice(0, 9));
  };

  const canPublish = images.length > 0 && text.trim().length > 0 && !!product;

  const publish = () => {
    if (!images.length) return toast.error("请至少上传 1 张实拍图");
    if (!text.trim()) return toast.error("写点推荐理由吧");
    if (!product) return toast.error("请挂上商品链接（必选）");
    toast.success("发布成功！内容审核通过后即可获取佣金");
    nav({ to: "/discover" });
  };

  const saveDraft = () => {
    toast.success("已存草稿");
  };

  return (
    <MobileShell>
      {/* 顶部条 */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <button onClick={() => nav({ to: "/discover" })} className="flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted-foreground">
          <X className="h-4 w-4" /> 取消
        </button>
        <div className="text-sm font-semibold">发布好物</div>
        <button
          onClick={publish}
          disabled={!canPublish}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            canPublish
              ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow"
              : "bg-muted text-muted-foreground",
          )}
        >
          发布
        </button>
      </header>

      <div className="space-y-3 px-3 pb-24 pt-3">
        {/* 图片上传 */}
        <section className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">档口实拍图 / 视频</div>
            <div className="text-[11px] text-muted-foreground">建议拍档口挂版 / 上身图</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={onPickImage}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <Camera className="h-6 w-6" />
                <span className="text-[11px]">点击上传</span>
              </button>
            )}
          </div>
        </section>

        {/* 正文 */}
        <section className="rounded-2xl border border-border bg-card p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="写点推荐理由...&#10;上身效果 / 面料细节 / 搭配建议，越具体越吸粉～&#10;&#10;#东大门新款 #碎花裙"
            className="min-h-[120px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-1 text-right text-[10px] text-muted-foreground">{text.length}/500</div>
        </section>

        {/* 商品链接（必选） */}
        <section className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Package className="h-4 w-4 text-rose-500" />
              挂商品链接
              <span className="rounded-full bg-rose-100 px-1.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/20">必选</span>
            </div>
            {product && (
              <button
                onClick={() => setShowPicker(true)}
                className="text-[11px] text-primary"
              >
                更换
              </button>
            )}
          </div>

          {!product ? (
            <button
              onClick={() => setShowPicker(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4" />
              搜索商品名称 / 款号 / 档口
            </button>
          ) : (
            <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-2">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-20 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-medium">{product.name}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Store className="h-3 w-3" /> {shop?.name} · {shop?.building} {shop?.floor}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-rose-600">{formatCNY(priceCNY)}</span>
                  <span className="rounded bg-amber-100 px-1.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    佣金 {formatCNY(commission)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setProductId(null)}
                className="self-start rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="移除"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* 汇总卡 */}
        {product && (
          <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-3 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-orange-500/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Store className="h-3.5 w-3.5" /> 档口名称
              <span className="ml-auto font-medium text-foreground">{shop?.name}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-500" /> 预估佣金
              <span className="ml-auto text-lg font-black text-rose-600">{formatCNY(commission)}</span>
            </div>
            <div className="mt-1 text-right text-[10px] text-muted-foreground">
              按拼单价 × {(COMMISSION_RATE * 100).toFixed(0)}% 计算，实际以成交为准
            </div>
          </section>
        )}

        <Link to="/guide" className="block text-center text-[11px] text-muted-foreground underline">
          查看《好物分享 & 佣金规则》
        </Link>
      </div>

      {/* 底部草稿栏 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button
            onClick={saveDraft}
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            存草稿
          </button>
          <div className="flex-1 text-[11px] text-muted-foreground">
            {canPublish ? "内容已完备，点击右上角发布" : "需完成 图片 + 文案 + 商品链接"}
          </div>
        </div>
      </div>

      {/* 商品选择弹层 */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="flex items-center gap-2 border-b border-border px-3 py-2">
            <button onClick={() => setShowPicker(false)} className="rounded-full p-1">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="搜索商品 / 款号 / 档口"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 text-[11px] text-muted-foreground">
              选择一款平台商品挂到笔记中（每篇仅可挂 1 款）
            </div>
            <ul className="space-y-2">
              {results.map((p) => {
                const sh = SHOPS.find((s) => s.id === p.shopId);
                const c = krwToCny(p.priceKRW);
                const com = Math.round(c * COMMISSION_RATE * 100) / 100;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setProductId(p.id);
                        setShowPicker(false);
                        setKw("");
                      }}
                      className="flex w-full gap-3 rounded-lg border border-border bg-card p-2 text-left transition active:scale-[0.99]"
                    >
                      <img src={p.images[0]} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-medium">{p.name}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {sh?.name} · {p.internalCode}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-rose-600">{formatCNY(c)}</span>
                          <span className="text-[10px] text-amber-600">佣金 {formatCNY(com)}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
              {results.length === 0 && (
                <li className="py-12 text-center text-sm text-muted-foreground">没有匹配的商品</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </MobileShell>
  );
}