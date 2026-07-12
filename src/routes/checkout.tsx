import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, SHOPS, PAYMENT_ACCOUNTS, REFERENCE_RATE, formatKRW, formatCNY, krwToCny } from "@/lib/mock-data";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  MapPin,
  Wallet,
  Truck,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "提交订单 · 东大门订货通" }] }),
  component: Checkout,
});

const ITEMS = [
  { product: PRODUCTS[0]!, qty: 1, color: "奶白", size: "FREE" },
  { product: PRODUCTS[1]!, qty: 2, color: "米色", size: "FREE" },
  { product: PRODUCTS[2]!, qty: 1, color: "黑", size: "M" },
];

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

type PayStep = "qr" | "confirming" | "done";
type PayChannel = "wechat" | "alipay" | "balance" | "applepay";

const CHANNELS: {
  id: PayChannel;
  name: string;
  icon: string;
  iconBg: string;
  disabled?: boolean;
  right?: string;
}[] = [
  { id: "wechat", name: "微信支付", icon: "微", iconBg: "bg-[#09BB07]" },
  { id: "alipay", name: "支付宝支付", icon: "支", iconBg: "bg-[#1677FF]" },
  { id: "balance", name: "余额支付", icon: "余", iconBg: "bg-muted-foreground/40", disabled: true, right: "余额: ¥0.00" },
  { id: "applepay", name: "Apple Pay", icon: "", iconBg: "bg-muted-foreground/40", disabled: true },
];

function Checkout() {
  const navigate = useNavigate();
  const totalKRW = ITEMS.reduce((s, i) => s + i.product.priceKRW * i.qty, 0);
  const intlShipCNY = ITEMS.reduce((s, i) => s + intlShipFor(i.product.id) * i.qty, 0);
  const totalCNY = krwToCny(totalKRW) + intlShipCNY;
  // 模拟"剩余额度最大"分配
  const assigned = PAYMENT_ACCOUNTS.filter((a) => a.status === "active")
    .sort((a, b) => b.dailyLimit - b.todayReceived - (a.dailyLimit - a.todayReceived))[0]!;
  const grouped = SHOPS.map((s) => ({
    shop: s,
    items: ITEMS.filter((i) => i.product.shopId === s.id),
  })).filter((g) => g.items.length > 0);

  const [payOpen, setPayOpen] = useState(false);
  const [step, setStep] = useState<PayStep>("qr");
  const [channel, setChannel] = useState<PayChannel>(assigned.channel);
  const [seconds, setSeconds] = useState(15 * 60);
  const [shipOpen, setShipOpen] = useState(false);

  useEffect(() => {
    if (!payOpen || step !== "qr") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [payOpen, step]);

  const openPay = () => {
    setStep("qr");
    setSeconds(15 * 60);
    setPayOpen(true);
  };

  const confirmPaid = () => {
    setStep("confirming");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        setPayOpen(false);
        navigate({ to: "/orders/$id", params: { id: "DD20251128001" } });
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

      <Card className="mx-4 mt-3 p-3 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Wallet className="h-4 w-4" /> 分配收款账户
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-md bg-muted/40 p-2 text-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-background text-[9px] text-muted-foreground">QR</div>
          <div className="flex-1">
            <div className="font-medium">
              {assigned.channel === "wechat" ? "微信" : "支付宝"} · {assigned.holder}
            </div>
            <div className="text-muted-foreground">
              今日剩余额度 {formatCNY(assigned.dailyLimit - assigned.todayReceived)}
            </div>
          </div>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">系统按「剩余额度最大」策略自动分配,达上限将切换。</div>
      </Card>

      <Card className="mx-4 mt-3 p-3 text-xs">
        <Row k="商品总额 (韩币)" v={formatKRW(totalKRW)} />
        <Row k="参考汇率" v={`1 KRW ≈ ${REFERENCE_RATE} CNY`} sub />
        <Row k="预估人民币" v={formatCNY(krwToCny(totalKRW))} />
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
        <Row k="合计 (预估)" v={formatCNY(totalCNY)} bold />
        <div className="mt-1 text-[11px] text-muted-foreground">
          实际人民币金额 = 平台代付时锁定汇率 × 韩币 + 服务费,以订单详情为准。
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
                <div className="mt-3 text-3xl font-semibold text-[#FF4D2E]">
                  ¥ {totalCNY.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  剩余支付时间 {mm}:{ss}
                </div>
              </DrawerHeader>

              <div className="px-4">
                <div className="mb-2 text-xs text-muted-foreground">选择支付方式</div>
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {CHANNELS.map((c) => {
                    const selected = channel === c.id;
                    return (
                      <button
                        key={c.id}
                        disabled={c.disabled}
                        onClick={() => !c.disabled && setChannel(c.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                          c.disabled ? "opacity-50" : ""
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${c.iconBg}`}>
                          {c.icon || "🍎"}
                        </div>
                        <span className="flex-1 text-sm">{c.name}</span>
                        {c.right && (
                          <span className="text-xs text-muted-foreground">{c.right}</span>
                        )}
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#FF4D2E] bg-[#FF4D2E]"
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
                  className="h-12 rounded-full bg-gradient-to-r from-[#FF6B3D] to-[#FF3D2E] text-base font-medium text-white shadow-md hover:opacity-95"
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