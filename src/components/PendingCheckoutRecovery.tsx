import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { checkoutStore, usePendingCheckout } from "@/lib/checkout-store";
import { PRODUCTS, formatCNY, krwToCny } from "@/lib/mock-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const DISMISS_KEY = "ddth_pending_recovery_dismissed_v1";

/** 应用启动时若存在未完成支付，引导用户继续或放弃 */
export function PendingCheckoutRecovery() {
  const pending = usePendingCheckout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pending.items.length === 0) return;
    // 在结算/支付相关页面不打扰
    if (pathname.startsWith("/checkout") || pathname.startsWith("/pay")) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) return;
    setOpen(true);
  }, [pending.items.length, pathname]);

  if (pending.items.length === 0) return null;

  const totalKRW = pending.items.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.productId);
    return s + (p?.priceKRW ?? 0) * i.qty;
  }, 0);
  const totalQty = pending.items.reduce((s, i) => s + i.qty, 0);
  const createdAt = pending.createdAt ? new Date(pending.createdAt) : null;

  const markDismissed = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const onContinue = () => {
    markDismissed();
    setOpen(false);
    navigate({ to: "/checkout" });
  };

  const onAbandon = () => {
    checkoutStore.clear();
    markDismissed();
    setOpen(false);
    toast.success("已放弃未完成的支付", {
      description: pending.source === "cart" ? "购物车商品仍为你保留" : undefined,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>发现未完成的支付</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-xs">
              <div>
                你有 <b className="text-foreground">{pending.items.length}</b> 款商品共{" "}
                <b className="text-foreground">{totalQty}</b> 件待支付，合计约{" "}
                <b className="text-[#FF4D2E]">{formatCNY(krwToCny(totalKRW))}</b>。
              </div>
              {createdAt && (
                <div className="text-muted-foreground">
                  发起时间：{createdAt.toLocaleString("zh-CN", { hour12: false })}
                </div>
              )}
              <div className="text-muted-foreground">
                继续支付将按最新平台汇率结算；放弃后订单不生成
                {pending.source === "cart" ? "，购物车条目仍保留" : ""}。
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onAbandon}>放弃</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>继续支付</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}