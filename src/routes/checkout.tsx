import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, PAY_METHODS, REFERENCE_RATE, formatKRW, formatCNY, krwToCny, type PayMethodId } from "@/lib/mock-data";
import { usePendingCheckout, createOrderFromPending } from "@/lib/checkout-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  MapPin,
  Truck,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "提交订单 · 东大门蚂蚁" }] }),
  component: Checkout,
});

// 商家后台填写的「韩国→国内」单件基础物流服务费（示例）
// 实际项目中来自商品资料；此处以 product.id 稳定映射，做 demo。
const INTL_SHIP_MAP: Record<string, number> = {
  p1: 8,
  p2: 6,
  p3: 5,
  p4: 7,
  p5: 10,
  p6: 4,
  p7: 15,
  p8: 9,
  p9: 4,
  p10: 6,
};
function intlShipFor(productId: string) {
  return INTL_SHIP_MAP[productId] ?? 6;
}

type PayStep = "qr" | "confirming" | "done" | "failed" | "timeout";

// 演示：模拟支付失败概率（生产接入真实支付网关回调）
const FAIL_RATE = 0.25;

const ICON: Record<PayMethodId, { icon: string; bg: string }> = {
  wechat_online: { icon: "微", bg: "bg-[#09BB07]" },
  alipay_online: { icon: "支", bg: "bg-[#1677FF]" },
  balance: { icon: "余", bg: "bg-muted-foreground/40" },
  applepay: { icon: "🍎", bg: "bg-muted-foreground/40" },
};

function Checkout() {
  const navigate = useNavigate();
  const pending = usePendingCheckout();
  const ITEMS = useMemo(
    () =>
      pending.items
        .map((i) => {
          const product = PRODUCTS.find((p) => p.id === i.productId);
          return product ? { product, qty: i.qty, color: i.color, size: i.size } : null;
        })
        .filter(Boolean) as { product: (typeof PRODUCTS)[number]; qty: number; color: string; size: string }[],
    [pending.items],
  );

  if (ITEMS.length === 0) {
    return (
      <MobileShell>
        <MobileHeader title="提交订单" back />
        <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
          <div className="text-sm text-muted-foreground">还没有待结算的商品</div>
          <Button asChild size="sm"><Link to="/cart">去购物车</Link></Button>
        </div>
      </MobileShell>
    );
  }

  const totalKRW = ITEMS.reduce((s, i) => s + i.product.priceKRW * i.qty, 0);
  const intlShipCNY = ITEMS.reduce((s, i) => s + intlShipFor(i.product.id) * i.qty, 0);
  const totalCNY = krwToCny(totalKRW) + intlShipCNY;
  const grouped = SHOPS.map((s) => ({
    shop: s,
    items: ITEMS.filter((i) => i.product.shopId === s.id),
  })).filter((g) => g.items.length > 0);

  const [payOpen, setPayOpen] = useState(false);
  const [step, setStep] = useState<PayStep>("qr");
  const enabledMethods = PAY_METHODS.filter((m) => m.enabled);
  const [channel, setChannel] = useState<PayMethodId>(enabledMethods[0]?.id ?? "wechat_online");
  const [seconds, setSeconds] = useState(15 * 60);
  const [shipOpen, setShipOpen] = useState(false);
  const [failReason, setFailReason] = useState<string>("");

  useEffect(() => {
    if (!payOpen || step !== "qr") return;
    const t = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(t);
            setStep("timeout");
            toast.error("支付超时", {
              description: "订单未支付已释放，购物车已保留，可重新发起支付",
            });
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [payOpen, step]);

  const openPay = () => {
    setStep("qr");
    setSeconds(15 * 60);
    setFailReason("");
    setPayOpen(true);
  };

  const retryPay = () => {
    setFailReason("");
    setSeconds(15 * 60);
    setStep("qr");
  };

  const backToCart = () => {
    setPayOpen(false);
    navigate({ to: "/cart" });
  };

  const confirmPaid = () => {
    setStep("confirming");
    setTimeout(() => {
      // 模拟支付网关回调：随机失败以覆盖兜底流程
      if (Math.random() < FAIL_RATE) {
        const reasons = [
          "银行返回：付款人余额不足",
          "支付渠道未收到入账，请核对付款金额",
          "网络异常，未能确认付款结果",
        ];
        const r = reasons[Math.floor(Math.random() * reasons.length)];
        setFailReason(r);
        setStep("failed");
        toast.error("支付失败", {
          description: `${r}。购物车已保留，可重新发起支付`,
        });
        return;
      }
      const order = createOrderFromPending({
        channelId: channel,
        channelLabel: enabledMethods.find((m) => m.id === channel)?.label ?? "",
        totalKRW,
        totalCNY,
      });
      setStep("done");
      setTimeout(() => {
        setPayOpen(false);
        navigate({
          to: "/orders/$id",
          params: { id: order?.id ?? "DD20251128001" },
        });
      }, 1200);
    }, 1600);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <MobileShell>
      <MobileHeader title="提交订单" back />

      <Link to="/addresses" className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">张老板</span>
            <span className="text-muted-foreground">138****6621</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">默认</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            广东省 广州市 白云区 沙河服装批发市场 B 栋 318 档
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="mx-4 mt-3 space-y-3">
        {grouped.map(({ shop, items }) => (
          <Card key={shop.id} className="p-3">
            <div className="border-b border-border pb-2 text-sm font-medium">{shop.name}</div>
            {items.map((i) => (
              <div key={i.product.id} className="mt-2 flex gap-3">
                <img src={i.product.images[0]} className="h-14 w-14 rounded object-cover" alt="" />
                <div className="flex-1 text-xs">
                  <div className="line-clamp-2">{i.product.name}</div>
                  <div className="text-muted-foreground">{i.color} / {i.size}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>{formatKRW(i.product.priceKRW)} × {i.qty}</span>
                    <span className="text-muted-foreground">≈ {formatCNY(krwToCny(i.product.priceKRW * i.qty))}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card className="mx-4 mt-3 p-3 text-xs">
        <Row k="商品总额 (韩币)" v={formatKRW(totalKRW)} />
        <Row k="平台生效汇率" v={`1 KRW = ${REFERENCE_RATE} CNY`} sub />
        <Row k="人民币" v={formatCNY(krwToCny(totalKRW))} />
        <button
          type="button"
          onClick={() => setShipOpen((v) => !v)}
          className="flex w-full items-center justify-between py-1 text-left"
        >
          <span className="flex items-center gap-1">
            基础物流服务费
            <span className="text-[10px] text-muted-foreground">(韩国→国内)</span>
            <ChevronDown
              className={`h-3 w-3 text-muted-foreground transition-transform ${shipOpen ? "rotate-180" : ""}`}
            />
          </span>
          <span>{formatCNY(intlShipCNY)}</span>
        </button>
        {shipOpen && (
          <div className="mb-1 space-y-1 rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
            {ITEMS.map((i) => (
              <div key={i.product.id} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {i.product.name} × {i.qty}
                </span>
                <span className="whitespace-nowrap">
                  {formatCNY(intlShipFor(i.product.id))} × {i.qty} ={" "}
                  <span className="text-foreground">
                    {formatCNY(intlShipFor(i.product.id) * i.qty)}
                  </span>
                </span>
              </div>
            ))}
            <div className="mt-1 border-t border-border/60 pt-1 text-[10px]">
              费用由各档口商家在商家后台按款式设置,系统按下单件数汇总。
            </div>
          </div>
        )}
        <Row k="国内派送" v="顺丰包邮" sub />
        <div className="my-2 border-t border-border" />
        <Row k="合计" v={formatCNY(totalCNY)} bold />
        <div className="mt-1 text-[11px] text-muted-foreground">
          支付成功即按当前平台汇率锁定，不受后续汇率波动影响。
        </div>
      </Card>

      <div className="mx-4 mt-3 mb-24 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <Truck className="h-4 w-4" />
        预计 5-7 天到货 · 韩国仓集货 1-2 天 + 跨境 3-5 天 + 国内派送 1-3 天
      </div>

      <div className="fixed bottom-16 left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
        <div className="text-right text-xs">
          <div className="text-base font-semibold">≈ {formatCNY(totalCNY)}</div>
          <div className="text-[10px] text-muted-foreground">{formatKRW(totalKRW)} + 服务费</div>
        </div>
        <Button className="ml-auto flex-1" onClick={openPay}>
          提交并支付
        </Button>
      </div>

      <Drawer open={payOpen} onOpenChange={setPayOpen}>
        <DrawerContent className="mx-auto max-w-[480px]">
          {step === "qr" && (
            <>
              <DrawerHeader className="items-center pt-6 text-center">
                <DrawerTitle className="sr-only">收银台</DrawerTitle>
                <DrawerDescription className="sr-only">选择支付方式</DrawerDescription>
                <div className="text-sm text-muted-foreground">收银台</div>
                <div className="mt-3 text-3xl font-semibold text-primary">
                  ¥ {totalCNY.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  剩余支付时间 {mm}:{ss}
                </div>
              </DrawerHeader>

              <div className="px-4">
                <div className="mb-2 text-xs text-muted-foreground">选择支付方式</div>
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {enabledMethods.map((m) => {
                    const selected = channel === m.id;
                    const ic = ICON[m.id];
                    return (
                      <button
                        key={m.id}
                        onClick={() => setChannel(m.id)}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${ic.bg}`}>
                          {ic.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{m.label}</div>
                          {m.note && (
                            <div className="text-[10px] text-muted-foreground">{m.note}</div>
                          )}
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <DrawerFooter className="pb-6">
                <Button
                  className="h-12 rounded-full bg-primary text-base font-medium text-primary-foreground shadow-md hover:opacity-95"
                  onClick={confirmPaid}
                >
                  立即支付
                </Button>
              </DrawerFooter>
            </>
          )}

          {step === "confirming" && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-sm font-medium">正在核对付款…</div>
              <div className="text-xs text-muted-foreground">
                系统正在向收款账户核对入账信息，请稍候
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-base font-semibold">支付成功</div>
              <div className="text-xs text-muted-foreground">
                平台将锁定汇率并代付韩币，正在跳转订单详情…
              </div>
            </div>
          )}

          {step === "failed" && (
            <>
              <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-4 text-center">
                <AlertTriangle className="h-12 w-12 text-primary" />
                <div className="text-base font-semibold">支付未成功</div>
                <div className="text-xs text-muted-foreground">{failReason}</div>
                <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                  订单尚未创建，购物车商品已为你保留。可更换支付方式或重试。
                </div>
              </div>
              <DrawerFooter className="gap-2 pb-6">
                <Button className="h-11 rounded-full" onClick={retryPay}>
                  重试支付
                </Button>
                <Button variant="outline" className="h-11 rounded-full" onClick={backToCart}>
                  返回购物车
                </Button>
              </DrawerFooter>
            </>
          )}

          {step === "timeout" && (
            <>
              <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-4 text-center">
                <Clock className="h-12 w-12 text-amber-500" />
                <div className="text-base font-semibold">支付超时</div>
                <div className="text-xs text-muted-foreground">
                  15 分钟内未完成支付，本次订单已自动关闭
                </div>
                <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                  购物车商品已为你保留，重新发起支付将按最新汇率结算。
                </div>
              </div>
              <DrawerFooter className="gap-2 pb-6">
                <Button className="h-11 rounded-full" onClick={retryPay}>
                  重新发起支付
                </Button>
                <Button variant="outline" className="h-11 rounded-full" onClick={backToCart}>
                  返回购物车
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </MobileShell>
  );
}

function Row({ k, v, sub, bold }: { k: string; v: string; sub?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${sub ? "text-[11px] text-muted-foreground" : ""} ${bold ? "text-sm font-semibold" : ""}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}