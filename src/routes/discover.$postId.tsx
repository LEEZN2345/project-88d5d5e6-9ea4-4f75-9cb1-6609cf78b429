import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, krwToCny, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, Share2, Store, Heart, MessageCircle, Bookmark, Star, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Link2, MessageSquare, QrCode } from "lucide-react";
import { cart } from "@/lib/cart-store";

export const Route = createFileRoute("/discover/$postId")({
  head: () => ({ meta: [{ title: "好物笔记 · 东大门蚂蚁" }] }),
  component: PostDetail,
});

import { CREATOR_COMMISSION_RATE as COMMISSION_RATE } from "@/lib/mock-data";

const CAPTIONS = [
  "今天在RIVER淘到这条碎花裙！挂版太仙了！\n档口小姐姐说是新款，面料很舒服，夏天穿绝了。\n拼单还差 2 件，快来～",
  "这个包百搭绝了，通勤逛街都能背，档口现货只剩最后几个。",
  "小众设计感耳环，几十块就能拥有的高级感，姐妹们冲！",
  "通勤西装外套推荐，版型太赞，档口小姐姐推荐入的。",
];

const AUTHORS = ["小A", "小B", "小C", "小D", "小E", "小七", "Luna"];
const COMMENTS = [
  { u: "小E", t: "想买！怎么拼？" },
  { u: "作者", t: "点下面链接就行，凑够 5 件当天发货～", reply: true },
  { u: "小K", t: "这个花色好好看！有中长款吗？" },
  { u: "阿May", t: "已下单+1，蹲发货" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function PostDetail() {
  const { postId } = Route.useParams();
  const nav = useNavigate();

  // 用 postId 关联到某个商品（前端 mock：直接以 postId 匹配 product.id）
  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === postId) ?? PRODUCTS[0],
    [postId],
  );
  const shop = SHOPS.find((s) => s.id === product.shopId);
  const h = hash(postId);
  const author = AUTHORS[h % AUTHORS.length];
  const caption = CAPTIONS[h % CAPTIONS.length];
  const priceCNY = krwToCny(product.priceKRW);
  const commission = Math.round(priceCNY * COMMISSION_RATE * 100) / 100;

  // 拼单进度（mock）
  const target = 5;
  const joined = 2 + (h % 3); // 2 / 3 / 4
  const percent = Math.min(100, Math.round((joined / target) * 100));

  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [extraComments, setExtraComments] = useState<{ u: string; t: string }[]>([]);
  const images = product.images.length ? product.images : [product.images[0]];

  // 分享链接：附带 ref=<author> 用于佣金归属
  const shareUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://ddm.example.com";
    return `${origin}/discover/${postId}?ref=${encodeURIComponent(author)}`;
  }, [postId, author]);
  const shareText = `【东大门好物】${product.name} · 拼单价 ${formatCNY(priceCNY)}，@${author} 推荐`;

  const copy = async (text: string, tip = "链接已复制") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(tip);
    } catch {
      // 兼容旧环境
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

  const openShare = async () => {
    // 优先系统原生分享（移动端）
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({
          title: "东大门好物",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // 用户取消或不支持，回退到弹层
      }
    }
    setShareOpen(true);
  };

  const soloAllowed = (shop?.minOrderQty ?? 1) === 1;

  const onPickTier = (tier: "solo" | "group") => {
    cart.add({
      productId: product.id,
      color: product.colors[0] ?? "默认",
      size: product.sizes[0] ?? "FREE",
      qty: tier === "group" ? 2 : 1,
      tier,
    });
    setBuyOpen(false);
    toast.success(
      `已加入购物车 · 佣金 ${formatCNY(commission)} 归属 @${author}`,
    );
    nav({ to: "/cart" });
  };

  return (
    <MobileShell>
      {/* 顶部返回 */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
        <button onClick={() => nav({ to: "/discover" })} className="rounded-full p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="truncate text-sm font-medium">@{author} 的好物</div>
        <button onClick={openShare} className="rounded-full p-1" aria-label="分享">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="pb-[110px]">
        {/* 大图轮播 */}
        <div className="relative aspect-[3/4] w-full bg-black">
          <img src={images[idx]} alt="" className="h-full w-full object-cover" />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
                {idx + 1}/{images.length}
              </div>
            </>
          )}
          <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
            📸 档口实拍
          </div>
        </div>

        {/* 作者信息 */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-xs font-bold text-white">
              {author.slice(-1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">@{author}</div>
              <div className="text-[11px] text-muted-foreground">2 小时前发布</div>
            </div>
            <button
              onClick={() => {
                setFollowed((v) => !v);
                toast.success(followed ? "已取消关注" : `已关注 @${author}`);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                followed
                  ? "border border-border bg-muted text-muted-foreground"
                  : "border border-primary text-primary",
              )}
            >
              {followed ? "已关注" : "关注"}
            </button>
          </div>

          {/* 档口 & 评分 */}
          <Link
            to="/shops/$id"
            params={{ id: product.shopId }}
            className="mt-3 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">{shop?.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {shop?.building} · {shop?.floor} {shop?.position}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">好评率 98%</div>
            </div>
          </Link>

          {/* 正文 */}
          <div className="mt-3 whitespace-pre-line text-[14px] leading-relaxed">
            {caption}
          </div>

          {/* 话题标签 */}
          <div className="mt-2 flex flex-wrap gap-1">
            {["#东大门新款", "#碎花裙", `#${shop?.name ?? "档口"}`].map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                {t}
              </span>
            ))}
          </div>

          {/* 互动 */}
          <div className="mt-4 flex items-center gap-5 border-y border-border py-2 text-xs text-muted-foreground">
            <button
              onClick={() => setLiked((v) => !v)}
              className={cn("flex items-center gap-1", liked && "text-rose-500")}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {(128 + (liked ? 1 : 0)).toLocaleString()}
            </button>
            <button className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {COMMENTS.length + extraComments.length}
            </button>
            <button
              onClick={() => {
                setSaved((v) => !v);
                toast.success(saved ? "已取消收藏" : "已加入收藏");
              }}
              className={cn("flex items-center gap-1", saved && "text-primary")}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              {saved ? "已收藏" : "收藏"}
            </button>
          </div>

          {/* 评论区 */}
          <div className="mt-3">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">
              评论 · {COMMENTS.length + extraComments.length}
            </div>
            <ul className="space-y-3">
              {[...COMMENTS, ...extraComments.map((c) => ({ ...c, reply: false }))].map((c, i) => (
                <li key={i} className={cn("flex gap-2 text-xs", c.reply && "pl-6")}>
                  <span className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white",
                    c.reply
                      ? "bg-gradient-to-br from-rose-400 to-orange-400"
                      : "bg-muted-foreground/40",
                  )}>
                    {c.u.slice(-1)}
                  </span>
                  <div className="min-w-0">
                    <span className={cn("mr-1 font-medium", c.reply && "text-rose-500")}>
                      {c.u === "作者" ? author : c.u}
                      {c.reply && " (作者)"}:
                    </span>
                    <span className="text-muted-foreground">{c.t}</span>
                  </div>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = commentText.trim();
                if (!t) return;
                setExtraComments((p) => [...p, { u: "我", t }]);
                setCommentText("");
                toast.success("已发送评论");
              }}
              className="mt-3 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5"
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="说点什么…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium",
                  commentText.trim()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                发送
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 吸底商品卡 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-1 text-[13px] font-medium">{product.name}</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-rose-600">{formatCNY(priceCNY)}</span>
              <span className="text-[10px] text-muted-foreground">拼单价</span>
            </div>
            {/* 进度条 */}
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" />
                {joined}/{target}
              </span>
            </div>
          </div>
          <button
            onClick={() => setBuyOpen(true)}
            className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow"
          >
            跟买下单
          </button>
        </div>
      </div>

      {/* 跟买下单方式 */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>选择下单方式</DialogTitle>
            <DialogDescription>
              通过本笔记下单，佣金归属 @{author}
            </DialogDescription>
          </DialogHeader>

          <button
            disabled={!soloAllowed}
            onClick={() => onPickTier("solo")}
            className={cn(
              "w-full rounded-xl border p-3 text-left",
              soloAllowed
                ? "border-border hover:border-primary"
                : "cursor-not-allowed border-dashed border-border opacity-50",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">单件购买</span>
              <span className="text-sm font-bold text-rose-600">
                {formatCNY(priceCNY)}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {soloAllowed ? "1 件即可下单，档口现货优先发" : "该档口不支持单件购买"}
            </div>
          </button>

          <button
            onClick={() => onPickTier("group")}
            className="w-full rounded-xl border border-border p-3 text-left hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">2 件起拍</span>
              <span className="text-sm font-bold text-rose-600">
                {formatCNY(Math.round(priceCNY * 2 * 100) / 100)}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              同款 2 件起批，单件成本更低
            </div>
          </button>
        </DialogContent>
      </Dialog>

      {/* 分享弹层 */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>分享好物笔记</DialogTitle>
            <DialogDescription>
              好友通过你的链接下单，佣金自动归属 @{author}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Link2 className="h-3 w-3" /> 专属分享链接
            </div>
            <div className="break-all text-xs">{shareUrl}</div>
          </div>

          <button
            onClick={() => copy(shareUrl)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow"
          >
            <Copy className="h-4 w-4" /> 一键复制链接
          </button>

          <button
            onClick={() => copy(`${shareText}\n${shareUrl}`, "文案+链接已复制")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4" /> 复制推荐文案 + 链接
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <QrCode className="h-3 w-3" /> 微信/小红书可直接粘贴分享
          </div>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}