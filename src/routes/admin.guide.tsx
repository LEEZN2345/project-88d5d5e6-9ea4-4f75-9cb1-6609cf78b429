import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ShieldCheck,
  Package,
  ClipboardList,
  Truck,
  Wallet,
  Undo2,
  MessageSquare,
  Sparkles,
  Settings2,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/guide")({
  head: () => ({
    meta: [
      { title: "使用指引 · 运营后台" },
      { name: "description", content: "运营后台每日运营 SOP、模块职责与关键操作路径。" },
    ],
  }),
  component: AdminGuide,
});

const DAILY = [
  {
    icon: ClipboardList,
    title: "1. 处理新订单",
    desc: "在「新订单+预定管理」核对付款凭证、锁定商户号入账，标记为可代付。",
    to: "/admin/orders",
  },
  {
    icon: Wallet,
    title: "2. 商户号巡检",
    desc: "概览页查看今日入账占日限额比例，接近上限时在「商户号」启用备用账户。",
    to: "/admin/payment-accounts",
  },
  {
    icon: Package,
    title: "3. 通知档口备货 / 发货",
    desc: "「发货管理」按档口汇总当天订单，导出后线下与档口对接。",
    to: "/admin/shipping",
  },
  {
    icon: Undo2,
    title: "4. 处理退款工单",
    desc: "客服先在「退款工单」核实凭证，转交财务复核后完成打款。",
    to: "/admin/refunds",
  },
  {
    icon: MessageSquare,
    title: "5. 回复反馈",
    desc: "「订单反馈管理」按订单会话式回复，超 24 小时未回复的工单自动升级。",
    to: "/admin/feedback",
  },
];

const MODULES = [
  {
    group: "经营",
    items: [
      { label: "订单 / 反馈 / 发货 / 拼单 / 退款", to: "/admin/orders" },
      { label: "现货库存", to: "/admin/stock" },
    ],
  },
  {
    group: "商品",
    items: [
      { label: "商品维护（SKU / 图片 / 上下架）", to: "/admin/products" },
      { label: "档口 & 商圈楼栋", to: "/admin/shops" },
      { label: "属性分类", to: "/admin/categories" },
    ],
  },
  {
    group: "用户与增长",
    items: [
      { label: "用户 / KYC 审核", to: "/admin/users" },
      { label: "积分商城 & 规则", to: "/admin/points-rules" },
      { label: "邀请码管理", to: "/admin/invites" },
    ],
  },
  {
    group: "系统",
    items: [
      { label: "汇率与全局配置", to: "/admin/config" },
      { label: "Banner 管理", to: "/admin/banners" },
    ],
  },
] as const;

const TIPS = [
  {
    icon: ShieldCheck,
    title: "KYC 审核标准",
    desc: "营业执照需清晰、法人一致、经营范围含服饰或贸易；不符时驳回并写明原因。",
  },
  {
    icon: Sparkles,
    title: "积分规则改动",
    desc: "「积分规则」保存后即刻生效，历史流水不追溯。上调邀请奖励前先风控评估。",
  },
  {
    icon: Settings2,
    title: "汇率管理",
    desc: "「汇率与配置」维护展示汇率；实际代付汇率以支付时刻的实时汇率为准。",
  },
];

function AdminGuide() {
  return (
    <AdminShell>
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">运营后台使用指引</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        新同事入职建议按下面 6 步走完一天运营流程，再对照模块地图定位其余功能位置。
      </p>

      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold">每日运营 SOP</div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DAILY.map((s) => (
            <Link key={s.title} to={s.to}>
              <Card className="h-full p-4 transition hover:border-primary/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{s.title}</div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold">模块地图</div>
        <div className="grid gap-3 md:grid-cols-2">
          {MODULES.map((m) => (
            <Card key={m.group} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {m.group}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {m.items.map((i) => (
                  <Link
                    key={i.label}
                    to={i.to}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <span>{i.label}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">关键规则</div>
        <div className="grid gap-3 md:grid-cols-3">
          {TIPS.map((t) => (
            <Card key={t.title} className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <t.icon className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">{t.title}</div>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}