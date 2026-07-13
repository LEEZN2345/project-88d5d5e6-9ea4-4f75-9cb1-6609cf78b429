import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import {
  ORDERS,
  STATUS_LABEL,
  CHANNEL_LABEL,
  formatKRW,
  formatCNY,
  SHOPS,
  type OrderChannel,
  isFirstOrderForProduct,
  findStockMatch,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, Fragment } from "react";
import { ChevronRight, ChevronDown, Download, Sparkles, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "新订单 + 预定管理 · 运营后台" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  // 全部走在线支付（微信/支付宝商户号）
  const payChannelOf = (idx: number): { label: string } =>
    idx % 2 === 0 ? { label: "微信 · 在线" } : { label: "支付宝 · 在线" };
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [channelFilter, setChannelFilter] = useState<OrderChannel | "all">("all");
  const [kindFilter, setKindFilter] = useState<"all" | "new" | "reserve">("all");
  // 记录每个「命中现货」的 item 是否选择从现货库出库。key = `${orderId}#${idx}`
  const [useStock, setUseStock] = useState<Record<string, boolean>>({});
  const setStockChoice = (k: string, v: boolean) => setUseStock((s) => ({ ...s, [k]: v }));
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const shopOf = (shopId: string) => SHOPS.find((s) => s.id === shopId);
  const paidOrders = ORDERS.filter((o) => o.status !== "pending_payment");
  // Mock: 按订单号末位区分「今日新订单」与「预定出货」（预定单今天到货，需一起去档口取）
  const kindOf = (id: string): "new" | "reserve" =>
    Number.parseInt(id.slice(-1), 10) % 2 === 0 ? "reserve" : "new";
  const channelRows = paidOrders
    .filter((o) => channelFilter === "all" || o.channel === channelFilter);
  const rows = channelRows
    .filter((o) => kindFilter === "all" || kindOf(o.id) === kindFilter);

  const kindBadge = (k: "new" | "reserve") =>
    k === "new" ? (
      <span className="rounded px-1.5 py-0.5 text-[11px] bg-primary/15 text-primary">今日新订单</span>
    ) : (
      <span className="rounded px-1.5 py-0.5 text-[11px] bg-purple-500/15 text-purple-700 dark:text-purple-300">预定出货</span>
    );

  // 提货单汇总（当前筛选下）
  const pickup = (() => {
    let newItems = 0, reserveItems = 0;
    const newShops = new Set<string>();
    const reserveShops = new Set<string>();
    channelRows.forEach((o) => {
      const k = kindOf(o.id);
      o.items.forEach((it) => {
        if (k === "new") {
          newItems += it.qty;
          newShops.add(it.product.shopId);
        } else {
          reserveItems += it.qty;
          reserveShops.add(it.product.shopId);
        }
      });
    });
    return {
      newItems,
      reserveItems,
      totalItems: newItems + reserveItems,
      newShops: newShops.size,
      reserveShops: reserveShops.size,
    };
  })();

  const channelBadge = (c: OrderChannel) => {
    const map: Record<OrderChannel, string> = {
      single: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      group: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
      moq2: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    };
    return <span className={`rounded px-1.5 py-0.5 text-[11px] ${map[c]}`}>{CHANNEL_LABEL[c]}</span>;
  };

  const exportCSV = () => {
    const header = ["类型","订单号","下单时间","下单渠道","会员","电话","收货地址","档口号","内部款号","商品","颜色","尺寸","数量","单价(KRW)","小计(KRW)","订单总额(KRW)","订单总额(CNY)","锁定汇率","状态"];
    const lines: string[] = [header.join(",")];
    rows.forEach((o) => {
      o.items.forEach((it) => {
        const shop = shopOf(it.product.shopId);
        const cells = [
          kindOf(o.id) === "new" ? "今日新订单" : "预定出货",
          o.id,
          o.createdAt,
          CHANNEL_LABEL[o.channel],
          o.buyer.name,
          o.buyer.phone,
          o.buyer.address,
          `${shop?.name ?? ""} ${shop?.floor ?? ""}`.trim(),
          it.product.internalCode,
          it.product.name,
          it.color,
          it.size,
          String(it.qty),
          String(it.product.priceKRW),
          String(it.product.priceKRW * it.qty),
          String(o.totalKRW),
          o.totalCNY != null ? String(o.totalCNY) : "",
          o.snapshotRate != null ? String(o.snapshotRate) : "",
          STATUS_LABEL[o.status],
        ].map((v) => {
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        });
        lines.push(cells.join(","));
      });
    });
    const csv = "\uFEFF" + lines.join("\n"); // BOM for Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `提货单_${kindFilter === "all" ? "新订单+预定" : kindFilter === "new" ? "今日新订单" : "预定出货"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filters: { id: OrderChannel | "all"; label: string }[] = [
    { id: "all", label: "全部" },
    { id: "single", label: "单件购买" },
    { id: "group", label: "拼单购买" },
    { id: "moq2", label: "2件起订" },
  ];

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">新订单 + 预定管理</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">当日下单 + 预定到货合并生成提货单，交付付款提货师傅一并去档口取货。</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV}>
          <Download className="mr-1 h-4 w-4" />导出提货单 CSV
        </Button>
      </div>

      {/* 提货单汇总 */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <SummaryCard
          label="今日新订单（涉及档口数）"
          items={pickup.newItems}
          shops={pickup.newShops}
          tone="blue"
          active={kindFilter === "new"}
          onClick={() => setKindFilter((k) => k === "new" ? "all" : "new")}
        />
        <SummaryCard
          label="预定出货（涉及档口）"
          items={pickup.reserveItems}
          shops={pickup.reserveShops}
          tone="purple"
          active={kindFilter === "reserve"}
          onClick={() => setKindFilter((k) => k === "reserve" ? "all" : "reserve")}
        />
      </div>

      {/* 一级：类型 */}
      <div className="mb-2 flex flex-wrap gap-2">
        {([
          { id: "all", label: "全部（合并提货单）" },
          { id: "new", label: "今日新订单" },
          { id: "reserve", label: "预定出货" },
        ] as const).map((f) => {
          const cnt = f.id === "all" ? paidOrders.length : paidOrders.filter((o) => kindOf(o.id) === f.id).length;
          const active = kindFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setKindFilter(f.id)}
              className={`rounded-md border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-70">({cnt})</span>
            </button>
          );
        })}
      </div>

      {/* 二级：渠道 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setChannelFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              channelFilter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-70">
              ({f.id === "all" ? paidOrders.length : paidOrders.filter((o) => o.channel === f.id).length})
            </span>
          </button>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th></Th><Th>类型</Th><Th>订单号</Th><Th>下单时间</Th><Th>下单渠道</Th><Th>会员 / 收货</Th><Th>件数</Th><Th>韩币</Th><Th>锁定汇率</Th><Th>人民币</Th><Th>支付</Th><Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => {
              const pc = payChannelOf(i);
              const open = expanded[o.id];
              const hasStock = o.items.some((it) => findStockMatch(it.product.id, it.color, it.size));
              return (
              <Fragment key={o.id}>
              <tr key={o.id} className="border-t border-border">
                <Td>
                  <button
                    onClick={() => toggle(o.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                    aria-label={open ? "收起" : "展开明细"}
                  >
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    {kindBadge(kindOf(o.id))}
                    {hasStock && (
                      <span className="inline-flex w-fit items-center gap-1 rounded border border-emerald-400/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <PackageCheck className="h-3 w-3" /> 有现货
                      </span>
                    )}
                  </div>
                </Td>
                <Td className="font-mono text-xs">{o.id}</Td>
                <Td className="text-xs">{o.createdAt}</Td>
                <Td>{channelBadge(o.channel)}</Td>
                <Td className="text-xs">
                  <div className="font-medium text-foreground">{o.buyer.name}</div>
                  <div className="text-muted-foreground">{o.buyer.phone}</div>
                  <div className="max-w-[220px] truncate text-muted-foreground" title={o.buyer.address}>{o.buyer.address}</div>
                </Td>
                <Td>{o.items.reduce((s, i) => s + i.qty, 0)}</Td>
                <Td>{formatKRW(o.totalKRW)}</Td>
                <Td className="text-xs">
                  {o.snapshotRate && (
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="secondary" className="w-fit">已收款</Badge>
                      <span className="font-mono">{o.snapshotRate}</span>
                    </div>
                  )}
                </Td>
                <Td>{o.totalCNY ? formatCNY(o.totalCNY) : ""}</Td>
                <Td className="text-xs">
                  <Badge variant="outline">{pc.label}</Badge>
                  <div className="mt-0.5 text-muted-foreground">{o.paymentAccount.name}</div>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    {o.snapshotRate && !o.receiptUrl && (
                      <Button size="sm">标记已代付</Button>
                    )}
                    <Button size="sm" variant="ghost">查看</Button>
                  </div>
                </Td>
              </tr>
              {open && (
                <tr className="border-t border-border bg-muted/30">
                  <Td className="align-top"></Td>
                  <Td colSpan={11} className="py-2">
                    <div className="mb-1 text-[11px] font-medium text-muted-foreground">订单明细（拆分二级）</div>
                    <table className="w-full text-xs">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="px-2 py-1 text-left font-normal">图片</th>
                          <th className="px-2 py-1 text-left font-normal">档口号</th>
                          <th className="px-2 py-1 text-left font-normal">款式 / 内部款号</th>
                          <th className="px-2 py-1 text-left font-normal">颜色</th>
                          <th className="px-2 py-1 text-left font-normal">尺寸</th>
                          <th className="px-2 py-1 text-left font-normal">数量</th>
                          <th className="px-2 py-1 text-left font-normal">单价</th>
                          <th className="px-2 py-1 text-left font-normal">小计</th>
                          <th className="px-2 py-1 text-left font-normal">现货 / 首单</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.items.map((it, idx) => {
                          const shop = shopOf(it.product.shopId);
                          const isBulkShop = shop?.minOrderQty === 2;
                          const isSoloFromBulk = isBulkShop && it.qty === 1;
                          const firstOrder = isFirstOrderForProduct(it.product.id);
                          const stock = findStockMatch(it.product.id, it.color, it.size);
                          const key = `${o.id}#${idx}`;
                          const chose = useStock[key];
                          return (
                            <tr key={idx} className="border-t border-border/60">
                              <td className="px-2 py-1.5">
                                <img src={it.product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                              </td>
                              <td className="px-2 py-1.5">
                                <div>{shop?.name}</div>
                                <div className="text-muted-foreground">{shop?.building} · {shop?.floor}</div>
                              </td>
                              <td className="px-2 py-1.5">
                                <div>{it.product.name}</div>
                                <div className="font-mono text-[10px] text-muted-foreground">{it.product.internalCode}</div>
                              </td>
                              <td className="px-2 py-1.5">{it.color}</td>
                              <td className="px-2 py-1.5">{it.size}</td>
                              <td className="px-2 py-1.5">× {it.qty}</td>
                              <td className="px-2 py-1.5">{formatKRW(it.product.priceKRW)}</td>
                              <td className="px-2 py-1.5">{formatKRW(it.product.priceKRW * it.qty)}</td>
                              <td className="px-2 py-1.5">
                                {stock ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="inline-flex items-center gap-1 rounded-md border border-emerald-400/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                      <PackageCheck className="h-3 w-3" /> 有现货（{stock.qty}）
                                    </div>
                                    {isSoloFromBulk && (
                                      <>
                                        <div className="text-[10px] text-muted-foreground">是否发现货？</div>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant={chose === true ? "default" : "outline"}
                                            className="h-6 px-2 text-[10px]"
                                            onClick={() => setStockChoice(key, true)}
                                          >
                                            是
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant={chose === false ? "default" : "outline"}
                                            className="h-6 px-2 text-[10px]"
                                            onClick={() => setStockChoice(key, false)}
                                          >
                                            否
                                          </Button>
                                        </div>
                                        {chose === true && (
                                          <div className="text-[10px] text-emerald-600">→ 已通知发货管理走现货库</div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                ) : isSoloFromBulk && firstOrder ? (
                                  <div className="inline-flex items-start gap-1 rounded-md border border-amber-400/60 bg-amber-50 px-1.5 py-1 text-[10px] leading-tight text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                                    <span>
                                      <b>首次下单</b> · 需订购 2 件<br />1 件自动纳入现货库
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Td>
                </tr>
              )}
              </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">订单管理说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><b>下单渠道</b>：<span className="text-foreground">单件购买</span>（档口 minOrderQty=1）/ <span className="text-foreground">拼单购买</span>（多买手拼团凑批）/ <span className="text-foreground">2 件起订</span>（同款同色 ≥2 件）。用于运营分析与档口对账。</li>
          <li><b>合并订单</b>：一笔订单包含多个 SKU 时，点击左侧「▸」展开二级明细（档口号 / 款式 / 颜色 / 尺寸 / 数量）。</li>
          <li><b>导出 CSV</b>：按当前筛选导出，一行 = 一个 SKU 明细（拼多档口/多色可直接分发给档口）。</li>
          <li><b>在线支付</b>（微信/支付宝商户号）：买手支付后回调自动写入订单，进入待代付。</li>
          <li><b>锁定汇率</b>已自动化：支付成功时按「汇率与配置」当前生效汇率快照到 order.snapshotRate，人工无需干预。</li>
          <li><b>标记已代付</b>：平台向韩国档口付款后，上传韩币付款小票 + 真实购汇成本（仅用于对账，不影响买手结算金额）。</li>
          <li><b>首单标识</b>：档口 2 件起拍时，若用户下 1 件（单件直购），系统会代订 2 件。<span className="text-foreground">首次下单</span>会显示「首次下单 · 需订购 2 件 · 1 件自动纳入现货库」。</li>
          <li><b>现货复用</b>：同款再次被下单时，若命中现货库会提示「是否发现货」。点「是」后，<Link to="/admin/shipping" className="text-primary underline">发货管理</Link>将从现货库出库，无需再向档口下单。</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "", colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) => <td colSpan={colSpan} className={`px-3 py-2 ${className}`}>{children}</td>;

function SummaryCard({
  label,
  items,
  shops,
  tone,
  active,
  onClick,
}: {
  label: string;
  items: number;
  shops: number;
  tone: "blue" | "purple" | "foreground" | "muted";
  active?: boolean;
  onClick?: () => void;
}) {
  const toneCls: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    foreground: "text-foreground",
    muted: "text-muted-foreground",
  };
  const activeRing = active ? "ring-2 ring-offset-1 ring-current" : "";
  return (
    <Card
      className={`cursor-pointer p-3 transition hover:bg-muted/40 ${onClick ? "hover:shadow-sm" : ""} ${activeRing}`}
      onClick={onClick}
    >
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-baseline gap-2 text-xl font-semibold ${toneCls[tone]}`}>
        <span>
          {items}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">件</span>
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          / {shops} 家档口
        </span>
      </div>
    </Card>
  );
}