import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import {
  ORDERS,
  SHOPS,
  krwToCny,
  formatCNY,
  CREATOR_COMMISSION_RATE,
  type Order,
} from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Camera, X, Package, Store, ShoppingBag, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

const search = z.object({
  orderId: z.string().optional(),
});

export const Route = createFileRoute("/discover/new")({
  head: () => ({ meta: [{ title: "发布好物 · 东大门订货通" }] }),
  validateSearch: (raw) => search.parse(raw),
  component: NewPost,
});

// 可发帖订单 = 已支付/已发货/已签收 且未发过帖
const POSTABLE_STATUS = new Set<Order["status"]>([
  "paid_locked",
  "in_warehouse",
  "in_transit",
  "delivering",
  "delivered",
]);

function isPostable(o: Order) {
  return POSTABLE_STATUS.has(o.status) && !o.postId;
}

function NewPost() {
  const nav = useNavigate();
  const { orderId: initialOrderId } = useSearch({ from: "/discover/new" });

  const [orderId, setOrderId] = useState<string | null>(initialOrderId ?? null);
  const [images, setImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(!initialOrderId);

  const order = useMemo(() => ORDERS.find((o) => o.id === orderId) ?? null, [orderId]);
  // 引用订单的第一件商品作为帖子挂链接的商品
  const firstItem = order?.items[0] ?? null;
  const product = firstItem?.product ?? null;
  const shop = useMemo(() => (product ? SHOPS.find((s) => s.id === product.shopId) : null), [product]);
  const priceCNY = product ? krwToCny(product.priceKRW) : 0;
  const commission = Math.round(priceCNY * CREATOR_COMMISSION_RATE * 100) / 100;

  const postableOrders = useMemo(() => ORDERS.filter(isPostable), []);

  const onPickImage = () => {
    const seed = Math.random().toString(36).slice(2, 8);
    setImages((prev) => [...prev, `https://picsum.photos/seed/${seed}/600/800`].slice(0, 9));
  };

  const canPublish = !!order && images.length > 0 && text.trim().length > 0;

  const publish = () => {
    if (!order) return toast.error("请先选择一条已购订单");
    if (!images.length) return toast.error("请至少上传 1 张实拍图");
    if (!text.trim()) return toast.error("写点使用心得吧");
    nav({
      to: "/discover/published",
      search: { commission, shop: shop?.name },
    });
  };

  const saveDraft = () => toast.success("已存草稿");

  return (
    <MobileShell>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <button onClick={() => nav({ to: "/discover" })} className="flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted-foreground">
          <X className="h-4 w-4" /> 取消
        </button>
        <div className="text-sm font-semibold">分享心得</div>
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
        {/* 引用订单卡片（必选，不可修改） */}
        <section className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4 text-rose-500" />
              引用订单
              <span className="rounded-full bg-rose-100 px-1.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/20">必选</span>
            </div>
            {order && (
              <button onClick={() => setShowPicker(true)} className="text-[11px] text-primary">
                更换订单
              </button>
            )}
          </div>

          {!order ? (
            <button
              onClick={() => setShowPicker(true)}
              className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                选择一条已购订单
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-2">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>订单号 {order.id}</span>
                <span>{order.createdAt}</span>
              </div>
              <div className="flex gap-3">
                {product && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium">{product?.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Store className="h-3 w-3" /> {shop?.name} · {shop?.building} {shop?.floor}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-rose-600">{formatCNY(priceCNY)}</span>
                    <span className="rounded bg-amber-100 px-1.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      创作返佣 {formatCNY(commission)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-start gap-1 rounded-md bg-background/60 px-2 py-1.5 text-[11px] text-muted-foreground">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                商品与订单信息自动带入，不可修改。发布后订单编号将作为该帖真实性凭证。
              </div>
            </div>
          )}
        </section>

        {/* 图片上传 */}
        <section className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">实拍图 / 视频</div>
            <div className="text-[11px] text-muted-foreground">建议真实上身 / 面料细节</div>
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
            placeholder="写点使用心得...&#10;上身效果 / 面料细节 / 搭配建议，越具体越吸粉～&#10;&#10;#东大门新款 #真实晒单"
            className="min-h-[120px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-1 text-right text-[10px] text-muted-foreground">{text.length}/500</div>
        </section>

        {/* 佣金汇总卡 */}
        {order && (
          <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-3 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-orange-500/10">
            <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">🏢 档口名称</span>
              <span className="text-sm font-semibold text-foreground">
                {shop?.name}
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                  {shop?.building} {shop?.floor}
                </span>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">💰 预估创作返佣</span>
              <span className="text-xl font-black text-rose-600">{formatCNY(commission)}</span>
            </div>
            <div className="mt-1.5 text-right text-[10px] text-muted-foreground">
              按拼单价 × {(CREATOR_COMMISSION_RATE * 100).toFixed(0)}% 计算；下单方为你自己也照发（真实消费鼓励分享）
            </div>
          </section>
        )}

        <Link to="/invite-rules" className="block text-center text-[11px] text-muted-foreground underline">
          查看《创作返佣 & 邀请分佣规则》
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
            {canPublish ? "内容已完备，点击右上角发布" : "需完成 引用订单 + 图片 + 文案"}
          </div>
        </div>
      </div>

      {/* 订单选择弹层 */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="flex items-center gap-2 border-b border-border px-3 py-2">
            <button onClick={() => setShowPicker(false)} className="rounded-full p-1">
              <X className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold">选择一条已购订单</div>
          </header>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 flex items-start gap-1 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
              一单只能发一帖，已发过帖的订单不会出现在列表中。防「虚假晒单」是我们的底线。
            </div>
            {postableOrders.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                <ShoppingBag className="mx-auto mb-2 h-10 w-10 opacity-40" />
                暂无可发帖订单
                <div className="mt-1 text-[11px]">购买后即可分享心得，赚 3% 创作返佣</div>
              </div>
            ) : (
              <ul className="space-y-2">
                {postableOrders.map((o) => {
                  const it = o.items[0];
                  const p = it?.product;
                  const sh = p ? SHOPS.find((s) => s.id === p.shopId) : null;
                  const c = p ? krwToCny(p.priceKRW) : 0;
                  const com = Math.round(c * CREATOR_COMMISSION_RATE * 100) / 100;
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => {
                          setOrderId(o.id);
                          setShowPicker(false);
                        }}
                        className="flex w-full gap-3 rounded-lg border border-border bg-card p-2 text-left transition active:scale-[0.99]"
                      >
                        {p && (
                          <img src={p.images[0]} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-1 text-sm font-medium">{p?.name}</div>
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {sh?.name} · 订单 {o.id}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-semibold text-rose-600">{formatCNY(c)}</span>
                            <span className="text-[10px] text-amber-600">创作返佣 {formatCNY(com)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}