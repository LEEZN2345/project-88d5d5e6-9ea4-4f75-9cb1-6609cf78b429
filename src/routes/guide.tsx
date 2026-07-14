import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  ShoppingCart,
  Wallet,
  Truck,
  Undo2,
  Users,
  Gift,
  ShieldCheck,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "使用指引 · 东大门订货通" },
      { name: "description", content: "买手端从注册、下单、支付到收货、退款、积分的完整使用说明。" },
    ],
  }),
  component: BuyerGuide,
});

const STEPS = [
  {
    icon: ShieldCheck,
    title: "1. 注册并完成 KYC",
    desc: "手机号 / 微信登录后，在「我的 → 实名认证」提交营业执照或身份证。审核通过后才可下单。",
    to: "/kyc",
    linkLabel: "去认证",
  },
  {
    icon: Search,
    title: "2. 浏览商品",
    desc: "首页 Banner、热门档口、新品速递、折扣专区都是选品入口；也可以按分类或商圈楼栋筛选。",
    to: "/",
    linkLabel: "去逛逛",
  },
  {
    icon: ShoppingCart,
    title: "3. 加入购物车 / 拼单",
    desc: "商品详情页选好颜色尺码后加购。想凑单免运费可以进拼单广场加入他人拼单或自己发起。",
    to: "/groups",
    linkLabel: "拼单广场",
  },
  {
    icon: Wallet,
    title: "4. 结算并支付",
    desc: "下单时系统按当前展示汇率计算人民币价格，支付成功后由平台代付给韩国档口，此时才锁汇率。",
    to: "/cart",
    linkLabel: "购物车",
  },
  {
    icon: Truck,
    title: "5. 跟踪物流",
    desc: "「订单 → 物流」实时查看：档口出货 → 韩国仓集货 → 跨境 → 国内派送，全程节点可见。",
    to: "/orders",
    linkLabel: "我的订单",
  },
  {
    icon: Undo2,
    title: "6. 售后 / 退款",
    desc: "签收 7 天内可申请售后。客服核实后转财务复核，工作日 24 小时内原路退款。",
    to: "/support",
    linkLabel: "联系客服",
  },
];

const FAQ = [
  { q: "汇率什么时候锁定？", a: "支付成功、平台向档口代付时锁定，之后订单金额不再变动。" },
  { q: "为什么每次收款账户不一样？", a: "按商户号日额度自动切换，均为公司实名个人账户，请放心付款。" },
  { q: "起订量怎么算？", a: "每个档口独立起订，购物车按档口分组显示是否达到起订金额。" },
  { q: "拼单怎么参与？", a: "在拼单广场加入进行中的团，达到目标件数后统一发货，享受更低价与运费分摊。" },
  { q: "积分怎么用？", a: "下单、邀请、签到都可获得，可在积分商城抵现或兑换周边。" },
];

function BuyerGuide() {
  return (
    <MobileShell>
      <MobileHeader title="使用指引" back />

      <div className="px-4 pt-4">
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-accent/20 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="text-base font-semibold">6 步搞定东大门订货</div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            首次使用建议按顺序完成注册与实名，之后下单、支付、物流、售后全流程走一遍就熟悉了。
          </p>
        </Card>
      </div>

      <div className="mt-4 space-y-2 px-4">
        {STEPS.map((s) => (
          <Link key={s.title} to={s.to} className="block">
            <Card className="p-3 transition hover:border-primary/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{s.title}</div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {s.linkLabel} <ChevronRight className="ml-0.5 h-3 w-3" />
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 px-4">
        <QuickCard icon={Users} label="拼单玩法" to="/groups" />
        <QuickCard icon={Gift} label="积分中心" to="/points" />
        <QuickCard icon={MessageCircle} label="联系客服" to="/support" />
      </div>

      <div className="mt-6 px-4 text-sm font-semibold">常见问题</div>
      <div className="mt-2 space-y-2 px-4 pb-24">
        {FAQ.map((f) => (
          <Card key={f.q} className="p-3">
            <div className="text-sm font-medium">{f.q}</div>
            <div className="mt-1 text-xs text-muted-foreground">{f.a}</div>
          </Card>
        ))}
      </div>
    </MobileShell>
  );
}

function QuickCard({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof Users;
  label: string;
  to: string;
}) {
  return (
    <Link to={to} className="block">
      <Card className="flex flex-col items-center gap-1 py-3 text-center transition hover:border-primary/50">
        <Icon className="h-5 w-5 text-primary" />
        <div className="text-[11px] font-medium">{label}</div>
      </Card>
    </Link>
  );
}