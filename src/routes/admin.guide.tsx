import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Users,
  Store,
  Tags,
  Image as ImageIcon,
  LayoutGrid,
  BarChart3,
  Gift,
  UserCog,
  Boxes,
  Percent,
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
    title: "4. 处理售后（换货 / 退款）",
    desc: "在「售后管理」的换货 / 退款 Tab 中分别处理；退款仅限断货与平台主动联系两类。",
    to: "/admin/after-sales",
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

// 每个后台模块 · 每个按钮 / 操作的详细说明
const PAGE_GUIDES: {
  icon: typeof Package;
  page: string;
  to: string;
  buttons: { name: string; desc: string }[];
}[] = [
  {
    icon: ClipboardList,
    page: "订单管理",
    to: "/admin/orders",
    buttons: [
      { name: "状态筛选 Tab", desc: "按待付款 / 待发货 / 售后等状态过滤订单。" },
      { name: "订单详情", desc: "查看 SKU、金额、支付账户、物流节点，可备注。" },
      { name: "断货标记", desc: "点击后自动通知买家，生成时间线记录，可发起退款。" },
      { name: "导出", desc: "按当前筛选导出 Excel，含档口 / SKU / 金额明细。" },
    ],
  },
  {
    icon: MessageSquare,
    page: "订单反馈",
    to: "/admin/feedback",
    buttons: [
      { name: "会话式回复", desc: "对同一订单的多轮问题聚合回复，实时通知买家。" },
      { name: "断货 / 备货中 / 已解决 快捷动作", desc: "一键改状态并写入时间线，必填理由校验。" },
      { name: "转售后", desc: "对需要退款 / 换货的反馈一键转售后工单。" },
    ],
  },
  {
    icon: Truck,
    page: "发货管理",
    to: "/admin/shipping",
    buttons: [
      { name: "按订单号折叠展开", desc: "同一订单的多档口 SKU 合并显示，点击展开子项。" },
      { name: "标记已交档口 / 已入韩仓 / 已出境", desc: "推进物流节点，前端订单页同步展示。" },
      { name: "导出档口备货单", desc: "按档口维度导出，便于线下对账。" },
    ],
  },
  {
    icon: Undo2,
    page: "售后管理（换货 / 退款）",
    to: "/admin/after-sales",
    buttons: [
      { name: "换货 / 退款 Tab", desc: "分别处理换货与退款工单，退款仅限断货或平台主动联系。" },
      { name: "接收换货", desc: "买家寄回后勾选实收，进入韩国转寄流程。" },
      { name: "驳回 / 补充凭证", desc: "必填理由，买家端会收到通知。" },
    ],
  },
  {
    icon: Boxes,
    page: "现货库存",
    to: "/admin/stock",
    buttons: [
      { name: "入库来源筛选", desc: "手动入库 / 首件 / 2件起订 分别追溯来源订单。" },
      { name: "调整库存", desc: "输入变动数量与备注，保留操作流水。" },
    ],
  },
  {
    icon: Package,
    page: "商品管理",
    to: "/admin/products",
    buttons: [
      { name: "新增商品", desc: "上传图片、绑定档口、维护 SKU（颜色/尺码/成分）、预估重量(kg)。" },
      { name: "编辑 / 上下架", desc: "行末操作直接切换上下架，或进入详情批量修改。" },
      { name: "CSV 批量导入", desc: "下载模板后按列填写，重量以克为单位。" },
    ],
  },
  {
    icon: Store,
    page: "档口 & 商圈",
    to: "/admin/shops",
    buttons: [
      { name: "楼栋列表", desc: "维护 APM / CPW / APM Place / NUZZON 四栋，可编辑楼层。" },
      { name: "编辑楼层 → 编辑档口", desc: "在楼层弹层内新增 / 移除档口。" },
      { name: "启用 / 停用", desc: "停用后档口不出现在前端，但历史订单仍可查。" },
    ],
  },
  {
    icon: Tags,
    page: "属性分类",
    to: "/admin/categories",
    buttons: [
      { name: "新增分类", desc: "维护一二级分类，设置默认预估重量(kg)用于运费预估。" },
      { name: "排序", desc: "拖拽调整前端首页展示顺序。" },
    ],
  },
  {
    icon: Users,
    page: "用户管理",
    to: "/admin/users",
    buttons: [
      { name: "详情", desc: "查看该用户订单 / 积分 / 邀请 / 售后聚合信息。" },
      { name: "冻结", desc: "冻结登录，用户无法进入 App，需人工解冻。" },
      { name: "禁止下单", desc: "允许登录浏览但拦截下单，用于风控。" },
      { name: "调整积分", desc: "手动增减积分并写入流水，需要备注原因。" },
    ],
  },
  {
    icon: UserCog,
    page: "员工与权限",
    to: "/admin/staff",
    buttons: [
      { name: "新增员工", desc: "分配角色：总管理员 / 订单管理 / 发货管理。" },
      { name: "调整角色", desc: "切换角色后菜单权限即时生效，无需重登。" },
    ],
  },
  {
    icon: Gift,
    page: "积分商城 & 规则",
    to: "/admin/points-rules",
    buttons: [
      { name: "编辑规则", desc: "设置签到 / 下单 / 邀请奖励，保存即时生效，不追溯历史。" },
      { name: "积分商城上架", desc: "在 /admin/points-mall 维护兑换商品与库存。" },
    ],
  },
  {
    icon: Percent,
    page: "分销 & 佣金",
    to: "/admin/commission",
    buttons: [
      { name: "创作返佣 3%", desc: "买家从帖子跟买时，作者获得订单金额 3%。" },
      { name: "邀请返佣 L1 0.5% / L2 0.2%", desc: "仅邀请链路生效，帖子归属优先于邀请归属。" },
      { name: "结算规则", desc: "签收 +14 天自动结算至可提现余额，退款则清算扣回。" },
    ],
  },
  {
    icon: LayoutGrid,
    page: "首页装修 & Banner",
    to: "/admin/home-decoration",
    buttons: [
      { name: "拖拽模块", desc: "调整轮播 / 分类 / 热门档口 / 今日上新的顺序。" },
      { name: "Banner 新增", desc: "在 /admin/banners 上传封面并绑定跳转链接。" },
    ],
  },
  {
    icon: BarChart3,
    page: "数据中心",
    to: "/admin/analytics",
    buttons: [
      { name: "排行榜", desc: "商品 / 档口 / 用户维度排行，可切换时间段。" },
      { name: "导出", desc: "按当前视图导出 CSV。" },
    ],
  },
  {
    icon: Settings2,
    page: "系统配置 / 商户号",
    to: "/admin/config",
    buttons: [
      { name: "汇率维护", desc: "展示汇率手工维护；实际锁汇以支付时刻为准。" },
      { name: "商户号切换", desc: "/admin/payment-accounts 按日限额启用备用账户。" },
    ],
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

      <div className="mt-8">
        <div className="mb-2 text-sm font-semibold">按模块 · 每个按钮怎么用</div>
        <p className="mb-3 text-xs text-muted-foreground">
          展开对应模块查看每个按钮 / 操作的用途与注意事项，点击右侧箭头可直达该页面。
        </p>
        <Accordion type="multiple" className="grid gap-2 md:grid-cols-2">
          {PAGE_GUIDES.map((p) => (
            <AccordionItem
              key={p.page}
              value={p.page}
              className="rounded-lg border bg-card px-3"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                    className="inline-flex items-center gap-1 text-xs text-primary"
                  >
                    进入该模块 <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AdminShell>
  );
}