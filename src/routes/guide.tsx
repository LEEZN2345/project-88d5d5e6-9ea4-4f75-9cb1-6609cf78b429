import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Home,
  Heart,
  User,
  Compass,
  Share2,
  Coins,
  Crown,
  PenSquare,
  ClipboardList,
  MapPin,
  Store,
} from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "使用指引 · 东大门蚂蚁" },
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

// 按页面 / 按钮拆解的详细指引
const PAGE_GUIDES: {
  icon: typeof Home;
  page: string;
  to: string;
  buttons: { name: string; desc: string }[];
}[] = [
  {
    icon: Home,
    page: "首页",
    to: "/",
    buttons: [
      { name: "顶部海报轮播", desc: "点击 Banner 直达对应活动 / 商品 / 档口页。" },
      { name: "分类图标（男装/女装等）", desc: "进入该分类的二级筛选与商品瀑布流。" },
      { name: "热门档口", desc: "跳转「热门档口」列表，16:9 大图浏览优质档口。" },
      { name: "今日上新 / 档口折扣", desc: "分别进入新品速递、折扣专区。" },
      { name: "推荐档口卡片", desc: "点击封面进入档口主页，查看在售商品与起订量。" },
    ],
  },
  {
    icon: Search,
    page: "分类 / 档口详情",
    to: "/categories/women",
    buttons: [
      { name: "二级分类 Tab", desc: "切换如上衣 / 连衣裙 / 裤子 等子类。" },
      { name: "商品卡片", desc: "点击进入商品详情，可选色码、看图文详情。" },
      { name: "档口封面（档口详情页）", desc: "查看档口位置、评分、起订金额与全部在售 SKU。" },
    ],
  },
  {
    icon: ShoppingCart,
    page: "商品详情",
    to: "/products/p1",
    buttons: [
      { name: "加入购物车", desc: "选择颜色 + 尺码后加入，可继续凑单。" },
      { name: "立即下单（单独/拼单/1件起订）", desc: "三种下单方式：单独下单、加入他人拼单、走 1 件起订通道。" },
      { name: "收藏 ♡", desc: "收藏到「我的收藏」，价格变动会提醒。" },
      { name: "分享", desc: "生成带你专属推广链接的图文卡片，好友下单你得返佣。" },
    ],
  },
  {
    icon: Compass,
    page: "发现好物",
    to: "/discover",
    buttons: [
      { name: "推荐 / 我的关注 Tab", desc: "推荐是全平台热帖，关注只看你已关注的达人。" },
      { name: "帖子卡片", desc: "进入帖子详情，查看图文和「已有 X 跟买」的实拍效果。" },
      { name: "跟买（详情页底部条）", desc: "一键复用作者的商品清单下单，作者获 3% 创作返佣。" },
      { name: "+ 发布（右下角）", desc: "从已完成订单中「引用订单」发帖，需选定一个 orderId。" },
    ],
  },
  {
    icon: ShoppingCart,
    page: "购物车 / 结算",
    to: "/cart",
    buttons: [
      { name: "按档口勾选", desc: "同档口达到起订金额才可结算，未达标行会置灰。" },
      { name: "去结算", desc: "进入结算页选择地址、代收账户，展示锁前汇率。" },
      { name: "提交订单", desc: "生成 15 分钟支付倒计时，超时自动取消不占库存。" },
      { name: "取消 / 重新支付", desc: "订单未支付前可主动取消；超时后从「订单」重新下单。" },
    ],
  },
  {
    icon: ClipboardList,
    page: "我的订单",
    to: "/orders",
    buttons: [
      { name: "状态 Tab", desc: "待付款 / 待发货 / 运输中 / 已完成 / 售后 快速筛选。" },
      { name: "订单卡片 → 详情", desc: "查看物流节点、支付信息、档口备注。" },
      { name: "分享得返佣", desc: "已完成订单可一键跳发布器，绑定该订单发帖。" },
      { name: "申请换货", desc: "签收 7 天内可发起，需选择原因并上传凭证。" },
    ],
  },
  {
    icon: Undo2,
    page: "换货 / 售后",
    to: "/exchanges",
    buttons: [
      { name: "发起换货", desc: "填写换货原因 → 上传照片 → 提交后按平台指引寄回集运仓。" },
      { name: "查看进度", desc: "已提交 → 待收件 → 韩国处理 → 已寄出 5 个状态时间线。" },
      { name: "联系客服", desc: "打开客服会话，工单会关联到该售后单。" },
    ],
  },
  {
    icon: User,
    page: "我的",
    to: "/me",
    buttons: [
      { name: "会员卡区", desc: "查看当前等级（游客 / 普通 ¥99 / 创作者 ¥199），点击升级。" },
      { name: "我的订单 / 购物车 / 收藏 / 售后", desc: "四大高频入口，置顶排列。" },
      { name: "积分 / 佣金 / 邀请", desc: "分别进入积分明细、分销数据、邀请返佣页。" },
      { name: "设置 / 地址 / 客服", desc: "维护常用信息与联系官方。" },
    ],
  },
  {
    icon: Crown,
    page: "会员权益",
    to: "/membership",
    buttons: [
      { name: "开通普通会员 ¥99/年", desc: "享受基础返佣抵扣 + 满 ¥300 免运费。" },
      { name: "升级创作者会员 ¥199/年", desc: "解锁提现权限、L1/L2 邀请返佣、3% 创作返佣。" },
    ],
  },
  {
    icon: Coins,
    page: "积分 / 积分商城",
    to: "/points",
    buttons: [
      { name: "每日签到", desc: "连续签到有加成，可在积分规则页查看细则。" },
      { name: "积分明细", desc: "查看获得 / 使用流水，支持追溯每一笔来源。" },
      { name: "积分兑换", desc: "在积分商城使用积分兑换周边或运费券。" },
    ],
  },
  {
    icon: Share2,
    page: "分销 / 提现",
    to: "/me/posts",
    buttons: [
      { name: "我的分销数据", desc: "查看每篇帖子的曝光 / 跟买 / 收益，含 14 天结算倒计时。" },
      { name: "立即提现", desc: "创作者会员可提现至支付宝 / 微信 / 银行卡，未升级会引导升级。" },
      { name: "推广链接管理", desc: "查看已生成的短链，可复制或关闭。" },
    ],
  },
  {
    icon: PenSquare,
    page: "发布好物",
    to: "/discover/new",
    buttons: [
      { name: "选择订单", desc: "必须绑定一个已完成订单，帖子只能引用你自己买过的商品。" },
      { name: "上传图片 / 文案", desc: "9 图以内，主图会作为封面。" },
      { name: "发布", desc: "发布成功后进入「已发布」列表，同时生成专属推广链接。" },
    ],
  },
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

      <div className="mt-6 px-4 text-sm font-semibold">按页面 · 每个按钮怎么用</div>
      <div className="mt-2 px-4 pb-24">
        <Accordion type="multiple" className="space-y-2">
          {PAGE_GUIDES.map((p) => (
            <AccordionItem
              key={p.page}
              value={p.page}
              className="rounded-lg border bg-card px-3"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{p.page}</div>
                    <div className="text-[10px] text-muted-foreground">{p.to}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <ul className="space-y-2">
                  {p.buttons.map((b) => (
                    <li key={b.name} className="rounded-md bg-muted/40 p-2">
                      <div className="text-xs font-medium">{b.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {b.desc}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-right">
                  <Link
                    to={p.to}
                    className="inline-flex items-center gap-1 text-[11px] text-primary"
                  >
                    去这个页面 <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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