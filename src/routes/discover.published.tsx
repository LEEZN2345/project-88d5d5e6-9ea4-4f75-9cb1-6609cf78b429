import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { CheckCircle2, Clock, Compass, FileText, Share2, Sparkles } from "lucide-react";
import { z } from "zod";

const search = z.object({
  commission: z.coerce.number().optional(),
  shop: z.string().optional(),
});

export const Route = createFileRoute("/discover/published")({
  head: () => ({ meta: [{ title: "发布成功 · 东大门订货通" }] }),
  validateSearch: (raw) => search.parse(raw),
  component: Published,
});

function Published() {
  const { commission, shop } = useSearch({ from: "/discover/published" });

  return (
    <MobileShell>
      <div className="min-h-[calc(100dvh-3rem)] bg-gradient-to-b from-rose-50 via-orange-50 to-background px-4 pb-8 pt-6 dark:from-rose-500/10 dark:via-orange-500/5">
        {/* 成功头部 */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
            <div className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
              <CheckCircle2 className="h-9 w-9" />
            </div>
          </div>
          <h1 className="mt-4 text-xl font-black">发布成功！</h1>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            审核中，通常 5–30 分钟通过
          </div>
        </div>

        {/* 状态卡 */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">当前状态</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">待审核</div>
                <div className="text-[11px] text-muted-foreground">
                  内容合规审核通过后自动上架
                </div>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              PENDING
            </span>
          </div>

          {/* 时间线 */}
          <ol className="mt-4 space-y-2 border-l border-dashed border-border pl-4 text-xs">
            <li className="relative">
              <span className="absolute -left-[19px] top-1 grid h-3 w-3 place-items-center rounded-full bg-emerald-500 ring-2 ring-background" />
              <div className="font-medium">已提交</div>
              <div className="text-muted-foreground">刚刚</div>
            </li>
            <li className="relative">
              <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-amber-400 bg-background" />
              <div className="font-medium">平台审核中</div>
              <div className="text-muted-foreground">审核结果将通过站内消息通知</div>
            </li>
            <li className="relative opacity-60">
              <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-muted bg-background" />
              <div className="font-medium">审核通过 · 上架发现好物</div>
              <div className="text-muted-foreground">用户下单后按拼单价 × 佣金率结算</div>
            </li>
          </ol>
        </div>

        {/* 佣金激励 */}
        {typeof commission === "number" && commission > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow dark:border-rose-500/40">
            <Sparkles className="h-8 w-8 opacity-80" />
            <div className="min-w-0 flex-1">
              <div className="text-xs opacity-90">本篇预估佣金</div>
              <div className="text-2xl font-black leading-none">￥{commission.toFixed(2)}</div>
              <div className="mt-1 text-[11px] opacity-90">
                档口 {shop ?? "—"} · 用户下单成交后到账
              </div>
            </div>
          </div>
        )}

        {/* 引导入口 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/discover"
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium shadow-sm active:scale-[0.98]"
          >
            <Compass className="h-5 w-5 text-primary" />
            返回发现好物
          </Link>
          <Link
            to="/me/posts"
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center text-sm font-medium shadow-sm active:scale-[0.98]"
          >
            <FileText className="h-5 w-5 text-primary" />
            我的发布
          </Link>
        </div>

        {/* 再发一篇 + 分享 */}
        <div className="mt-3 flex gap-2">
          <Link
            to="/discover/new"
            className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-2.5 text-center text-sm font-semibold text-white shadow"
          >
            <Sparkles className="mr-1 inline h-4 w-4" />
            再发一篇
          </Link>
          <button
            onClick={() => {
              const url = typeof window !== "undefined" ? window.location.origin + "/discover" : "";
              if (navigator.share) navigator.share({ title: "东大门好物", url });
              else navigator.clipboard?.writeText(url);
            }}
            className="rounded-full border border-border px-4 py-2.5 text-sm font-medium"
          >
            <Share2 className="mr-1 inline h-4 w-4" />
            分享
          </button>
        </div>
      </div>
    </MobileShell>
  );
}