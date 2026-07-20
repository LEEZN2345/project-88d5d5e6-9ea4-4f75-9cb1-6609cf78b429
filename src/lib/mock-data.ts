// 前端原型 mock 数据 (M1)。后续替换为 Lovable Cloud 数据。

export type Shop = {
  id: string;
  name: string;
  nameKo: string;
  brand?: string; // 主打品牌名
  building: string; // 例如 doota / migliore / apm
  floor: string; // 楼层，例如 2F / B1
  position: string; // 档口铺位号，例如 A41
  tags: string[];
  minOrderQty: 1 | 2; // 起订件数：1=支持单件购买，2=同款 2 件起批
  cover: string; // 档口背景图
  productCount: number;
};

export type Product = {
  id: string;
  internalCode: string; // 内部唯一款号
  shopId: string;
  name: string;
  priceKRW: number;
  images: string[];
  category: string;
  isNew?: boolean;
  discount?: number; // 百分比
  uploadedAt: string; // YYYY-MM-DD 上新日期
  colors: string[];
  sizes: string[];
  originCountry?: string; // 制造国 e.g. 韩国 / 中国
  purchaseCondition?: string; // 购买条件（起订量/是否可换色/是否可退等，人工填写）
  weightGrams?: number; // 单件净重（克），用于国际运费计算
};

export type CartItem = {
  productId: string;
  qty: number;
  color: string;
  size: string;
};

export type OrderStatus =
  | "pending_payment" // 待付款 (买手转账)
  | "paid_pending_proxy" // 已转账,待平台代付
  | "paid_locked" // 平台已代付,汇率已锁
  | "in_warehouse" // 韩国仓
  | "in_transit" // 在途
  | "delivering" // 国内派送
  | "delivered" // 已签收
  | "refunding"; // 退款中

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "待付款",
  paid_pending_proxy: "待代付",
  paid_locked: "已锁汇率",
  in_warehouse: "韩国仓",
  in_transit: "在途",
  delivering: "国内派送",
  delivered: "已签收",
  refunding: "退款中",
};

export type Order = {
  id: string;
  createdAt: string;
  items: { product: Product; qty: number; color: string; size: string }[];
  totalKRW: number;
  snapshotRate?: number; // KRW -> CNY,支付成功时按平台生效汇率快照(effectiveRate)
  totalCNY?: number;
  status: OrderStatus;
  paymentAccount: { name: string; channel: "wechat" | "alipay"; holder: string };
  paymentProofUrl?: string;
  receiptUrl?: string; // 韩币小票
  logisticsNo?: string;
  channel: OrderChannel; // 下单渠道
  buyer: { name: string; phone: string; address: string };
};

// 下单渠道
// single = 单件购买（档口支持 minOrderQty=1）
// group  = 拼单购买（多人拼团凑起订量）
// moq2   = 2 件起订（同款同色 ≥2 件）
export type OrderChannel = "single" | "group" | "moq2";
export const CHANNEL_LABEL: Record<OrderChannel, string> = {
  single: "单件购买",
  group: "拼单购买",
  moq2: "2件起订",
};

export type ShipmentEvent = {
  node:
    | "韩国仓入库"
    | "打包出库"
    | "起运"
    | "到港清关"
    | "国内派送"
    | "已签收";
  time: string;
  note?: string;
};

export type PaymentAccount = {
  id: string;
  channel: "wechat" | "alipay";
  holder: string;
  qrUrl: string;
  dailyLimit: number; // CNY
  todayReceived: number;
  status: "active" | "paused";
  lastUsedAt?: string;
};

// 支付方式配置（后台可控）
// online = 微信/支付宝 商户号在线支付（有回调，自动入账）
// balance = 平台余额
// applepay = Apple Pay
export type PayMethodId =
  | "wechat_online"
  | "alipay_online"
  | "balance"
  | "applepay";

export type PayMethodConfig = {
  id: PayMethodId;
  label: string;
  kind: "online" | "balance" | "applepay";
  enabled: boolean; // 是否对买手端开放
  note?: string;
};

export const PAY_METHODS: PayMethodConfig[] = [
  { id: "wechat_online", label: "微信支付", kind: "online", enabled: true, note: "商户号自动到账" },
  { id: "alipay_online", label: "支付宝支付", kind: "online", enabled: true, note: "商户号自动到账" },
  { id: "balance", label: "余额支付", kind: "balance", enabled: false },
  { id: "applepay", label: "Apple Pay", kind: "applepay", enabled: false },
];

// 商户号（在线支付渠道配置）
export type MerchantAccount = {
  id: string;
  channel: "wechat" | "alipay";
  merchantName: string;
  mchId: string;
  settleBank: string;
  status: "active" | "paused";
  todayReceived: number;
  dailyAlert: number; // 日入账告警阈值
};

export const MERCHANT_ACCOUNTS: MerchantAccount[] = [
  {
    id: "m1",
    channel: "wechat",
    merchantName: "东大门订货通（主）",
    mchId: "16006******",
    settleBank: "招商银行 6214****8821",
    status: "active",
    todayReceived: 68420,
    dailyAlert: 200000,
  },
  {
    id: "m2",
    channel: "alipay",
    merchantName: "东大门订货通（主）",
    mchId: "20880******",
    settleBank: "招商银行 6214****8821",
    status: "active",
    todayReceived: 42150,
    dailyAlert: 200000,
  },
];

export type RefundRequest = {
  id: string;
  orderId: string;
  amountCNY: number;
  scenario: "out_of_stock" | "platform_initiated"; // 退款场景：订单断货 / 平台主动联系
  reason: string;
  status: "cs_pending" | "finance_pending" | "paid" | "rejected";
  csUser?: string;
  financeUser?: string;
  createdAt: string;
};

const img = (seed: string, w = 600, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const SHOPS: Shop[] = [
  {
    id: "s1",
    name: "MILK",
    nameKo: "밀크",
    brand: "MILK",
    building: "Migliore",
    floor: "2F",
    position: "A41",
    tags: ["女装", "上新快"],
    minOrderQty: 2,
    cover: img("milk", 600, 400),
    productCount: 286,
  },
  {
    id: "s2",
    name: "BLUE LABEL",
    nameKo: "블루라벨",
    brand: "BLUE LABEL",
    building: "Doota",
    floor: "5F",
    position: "B12",
    tags: ["设计师", "外套"],
    minOrderQty: 2,
    cover: img("blue", 600, 400),
    productCount: 142,
  },
  {
    id: "s3",
    name: "STELLA SHOES",
    nameKo: "스텔라",
    brand: "STELLA",
    building: "apM",
    floor: "B1",
    position: "22",
    tags: ["鞋包", "新品"],
    minOrderQty: 1,
    cover: img("stella", 600, 400),
    productCount: 98,
  },
  {
    id: "s4",
    name: "ROUND HOUSE",
    nameKo: "라운드하우스",
    brand: "ROUND HOUSE",
    building: "Migliore",
    floor: "3F",
    position: "C08",
    tags: ["男装", "基础款"],
    minOrderQty: 2,
    cover: img("round", 600, 400),
    productCount: 211,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    internalCode: "DD-2025-0114",
    shopId: "s1",
    name: "羊毛混纺翻领长大衣",
    priceKRW: 168000,
    images: [img("coat1"), img("coat2"), img("coat3")],
    category: "外套",
    isNew: true,
    uploadedAt: "2026-07-10",
    colors: ["奶白", "燕麦", "炭灰"],
    sizes: ["FREE"],
    originCountry: "韩国",
    purchaseCondition: "2件起订 · 不可换色 · 到货 7 天内可退",
    weightGrams: 1450,
  },
  {
    id: "p2",
    internalCode: "DD-2025-0115",
    shopId: "s1",
    name: "宽松版型针织开衫",
    priceKRW: 89000,
    images: [img("knit1"), img("knit2")],
    category: "针织",
    discount: 15,
    uploadedAt: "2026-07-05",
    colors: ["米色", "黑"],
    sizes: ["FREE"],
    originCountry: "韩国",
    purchaseCondition: "2件起订 · 同色同码",
    weightGrams: 620,
  },
  {
    id: "p2a",
    internalCode: "DD-2025-0122",
    shopId: "s1",
    name: "泡泡袖雪纺衬衫",
    priceKRW: 62000,
    images: [img("blouse1"), img("blouse2")],
    category: "衬衫",
    isNew: true,
    uploadedAt: "2026-07-12",
    colors: ["白", "浅蓝"],
    sizes: ["FREE"],
    weightGrams: 280,
  },
  {
    id: "p2b",
    internalCode: "DD-2025-0123",
    shopId: "s1",
    name: "复古格纹半身裙",
    priceKRW: 75000,
    images: [img("skirt1")],
    category: "半身裙",
    isNew: true,
    uploadedAt: "2026-07-12",
    colors: ["棕格", "黑格"],
    sizes: ["S", "M"],
    weightGrams: 380,
  },
  {
    id: "p2c",
    internalCode: "DD-2025-0124",
    shopId: "s1",
    name: "小香风短外套",
    priceKRW: 128000,
    images: [img("jacket1"), img("jacket2")],
    category: "外套",
    uploadedAt: "2026-07-11",
    discount: 10,
    colors: ["白", "粉"],
    sizes: ["S", "M", "L"],
    weightGrams: 720,
  },
  {
    id: "p2d",
    internalCode: "DD-2025-0125",
    shopId: "s1",
    name: "亚麻宽腿长裤",
    priceKRW: 58000,
    images: [img("pants1")],
    category: "裤装",
    uploadedAt: "2026-07-08",
    colors: ["米", "黑", "卡其"],
    sizes: ["S", "M", "L"],
    weightGrams: 460,
  },
  {
    id: "p3",
    internalCode: "DD-2025-0203",
    shopId: "s2",
    name: "落肩廓形西装外套",
    priceKRW: 245000,
    images: [img("blazer1"), img("blazer2")],
    category: "外套",
    isNew: true,
    uploadedAt: "2026-07-11",
    colors: ["黑", "驼"],
    sizes: ["S", "M", "L"],
    weightGrams: 1180,
  },
  {
    id: "p4",
    internalCode: "DD-2025-0401",
    shopId: "s3",
    name: "牛皮乐福鞋",
    priceKRW: 132000,
    images: [img("shoe1"), img("shoe2")],
    category: "鞋",
    uploadedAt: "2026-06-20",
    colors: ["黑", "棕"],
    sizes: ["230", "235", "240", "245"],
    weightGrams: 950,
  },
  {
    id: "p5",
    internalCode: "DD-2025-0512",
    shopId: "s4",
    name: "纯棉重磅 T 恤",
    priceKRW: 39000,
    images: [img("tee1")],
    category: "T 恤",
    discount: 20,
    uploadedAt: "2026-06-15",
    colors: ["白", "黑", "米"],
    sizes: ["M", "L", "XL"],
    weightGrams: 240,
  },
  {
    id: "p6",
    internalCode: "DD-2025-0613",
    shopId: "s2",
    name: "高腰阔腿牛仔裤",
    priceKRW: 78000,
    images: [img("jean1"), img("jean2")],
    category: "裤装",
    isNew: true,
    uploadedAt: "2026-07-08",
    colors: ["原色", "深蓝"],
    sizes: ["25", "26", "27", "28"],
    weightGrams: 680,
  },
];

// 平台汇率配置（后台「汇率与配置」维护）
// 展示价 = base × (1 + buffer%)。支付成功时快照该「生效汇率」写入 order.snapshotRate。
// 已锁单不追溯：配置更新后仅对新订单生效。
export const PLATFORM_RATE_CONFIG = {
  base: 0.00525, // 后台录入的东大门实时汇率
  bufferPct: 1.5, // 缓冲百分比，防止购汇成本倒挂
};
export const effectiveRate = (cfg = PLATFORM_RATE_CONFIG) =>
  Math.round(cfg.base * (1 + cfg.bufferPct / 100) * 100000) / 100000;

// 兼容旧代码：REFERENCE_RATE = 当前生效汇率
export const REFERENCE_RATE = effectiveRate();

export const ORDERS: Order[] = [
  {
    id: "DD20251128001",
    createdAt: "2025-11-28 14:22",
    items: [
      { product: PRODUCTS[0]!, qty: 1, color: "奶白", size: "FREE" },
      { product: PRODUCTS[1]!, qty: 2, color: "米色", size: "FREE" },
    ],
    totalKRW: 168000 + 89000 * 2,
    status: "paid_locked",
    snapshotRate: 0.00528,
    totalCNY: Math.round((168000 + 89000 * 2) * 0.00528 * 100) / 100,
    paymentAccount: { name: "微信收款 03", channel: "wechat", holder: "张**" },
    paymentProofUrl: img("proof1", 400, 600),
    receiptUrl: img("receipt1", 400, 600),
    logisticsNo: "DDKR202511280001",
    channel: "moq2",
    buyer: { name: "陈**", phone: "138****2211", address: "浙江省杭州市余杭区五常街道 XX 路 12 号 3-802" },
  },
  {
    id: "DD20251127014",
    createdAt: "2025-11-27 09:11",
    items: [{ product: PRODUCTS[3]!, qty: 1, color: "黑", size: "240" }],
    totalKRW: 132000,
    status: "in_transit",
    snapshotRate: 0.00531,
    totalCNY: Math.round(132000 * 0.00531 * 100) / 100,
    paymentAccount: { name: "支付宝 01", channel: "alipay", holder: "李**" },
    paymentProofUrl: img("proof2", 400, 600),
    receiptUrl: img("receipt2", 400, 600),
    logisticsNo: "DDKR202511270014",
    channel: "single",
    buyer: { name: "林**", phone: "139****8802", address: "广东省广州市天河区珠江新城 XX 大厦 A 座 1806" },
  },
  {
    id: "DD20251126008",
    createdAt: "2025-11-26 16:40",
    items: [{ product: PRODUCTS[4]!, qty: 5, color: "白", size: "L" }],
    totalKRW: 39000 * 5,
    status: "pending_payment",
    paymentAccount: { name: "微信收款 01", channel: "wechat", holder: "王**" },
    channel: "group",
    buyer: { name: "王**", phone: "137****5566", address: "上海市静安区南京西路 XX 号 15F" },
  },
];

// 追加模拟：新订单/预定/在途/派送/签收 各状态若干，方便后台联调时看到充足数据
const _extra = (): Order[] => {
  const R = 0.00528;
  const mk = (
    id: string,
    dt: string,
    itemsSpec: { pIdx: number; qty: number; color: string; size: string }[],
    status: OrderStatus,
    channel: OrderChannel,
    buyer: Order["buyer"],
    payer: Order["paymentAccount"],
    logisticsNo?: string,
  ): Order => {
    const items = itemsSpec
      .map((s) => (PRODUCTS[s.pIdx] ? { product: PRODUCTS[s.pIdx]!, qty: s.qty, color: s.color, size: s.size } : null))
      .filter(Boolean) as Order["items"];
    const totalKRW = items.reduce((sum, it) => sum + it.product.priceKRW * it.qty, 0);
    return {
      id,
      createdAt: dt,
      items,
      totalKRW,
      snapshotRate: R,
      totalCNY: Math.round(totalKRW * R * 100) / 100,
      status,
      channel,
      paymentAccount: payer,
      paymentProofUrl: img("proof-" + id, 400, 600),
      logisticsNo,
      buyer,
    };
  };
  const wx = { name: "微信 · 在线", channel: "wechat" as const, holder: "平台代收" };
  const zfb = { name: "支付宝 · 在线", channel: "alipay" as const, holder: "平台代收" };
  return [
    mk("DD20251129012", "2025-11-29 09:14", [{ pIdx: 2, qty: 3, color: "米色", size: "FREE" }], "paid_pending_proxy", "moq2",
      { name: "赵**", phone: "136****3311", address: "江苏省 苏州市 姑苏区 观前街 12 号 2-401" }, wx),
    mk("DD20251129013", "2025-11-29 10:02", [{ pIdx: 0, qty: 1, color: "黑", size: "FREE" }], "paid_pending_proxy", "single",
      { name: "钱**", phone: "135****2244", address: "北京市 朝阳区 三里屯 SOHO 5 号楼 22F" }, zfb),
    mk("DD20251129014", "2025-11-29 11:33",
      [{ pIdx: 4, qty: 5, color: "白", size: "L" }, { pIdx: 1, qty: 2, color: "米色", size: "FREE" }],
      "paid_pending_proxy", "group",
      { name: "孙**", phone: "134****9911", address: "四川省 成都市 锦江区 春熙路 IFS T3-1802" }, wx),
    mk("DD20251128007", "2025-11-28 15:48", [{ pIdx: 3, qty: 2, color: "深棕", size: "245" }], "paid_locked", "moq2",
      { name: "周**", phone: "137****0088", address: "湖北省 武汉市 江汉区 江汉路 88 号 6F" }, zfb, "DDKR202511280007"),
    mk("DD20251128006", "2025-11-28 12:20", [{ pIdx: 2, qty: 4, color: "浅粉", size: "S" }], "in_warehouse", "moq2",
      { name: "吴**", phone: "138****4423", address: "福建省 厦门市 思明区 中山路 200 号 9F" }, wx, "DDKR202511280006"),
    mk("DD20251127015", "2025-11-27 18:02",
      [{ pIdx: 1, qty: 3, color: "米色", size: "FREE" }, { pIdx: 4, qty: 2, color: "黑", size: "M" }],
      "in_transit", "group",
      { name: "郑**", phone: "139****5501", address: "山东省 青岛市 市南区 香港中路 76 号 12F" }, zfb, "DDKR202511270015"),
    mk("DD20251126011", "2025-11-26 08:44", [{ pIdx: 0, qty: 2, color: "奶白", size: "FREE" }], "delivering", "moq2",
      { name: "冯**", phone: "133****2299", address: "河南省 郑州市 金水区 花园路 158 号 8F" }, wx, "DDKR202511260011"),
    mk("DD20251125008", "2025-11-25 14:10", [{ pIdx: 3, qty: 1, color: "黑", size: "240" }], "delivered", "single",
      { name: "陈**", phone: "138****7712", address: "广东省 深圳市 罗湖区 东门老街 3 号 5F" }, zfb, "DDKR202511250008"),
  ];
};
ORDERS.push(..._extra());

export const SHIPMENT_EVENTS: Record<string, ShipmentEvent[]> = {
  DDKR202511280001: [
    { node: "韩国仓入库", time: "2025-11-28 18:30" },
    { node: "打包出库", time: "2025-11-29 10:12", note: "已装箱 2 件" },
  ],
  DDKR202511270014: [
    { node: "韩国仓入库", time: "2025-11-27 17:00" },
    { node: "打包出库", time: "2025-11-28 09:20" },
    { node: "起运", time: "2025-11-28 22:00", note: "航班 KE5523" },
    { node: "到港清关", time: "2025-11-29 11:05" },
  ],
};

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: "a1",
    channel: "wechat",
    holder: "张**",
    qrUrl: img("qr1", 200, 200),
    dailyLimit: 20000,
    todayReceived: 18420,
    status: "active",
    lastUsedAt: "2025-11-28 14:22",
  },
  {
    id: "a2",
    channel: "wechat",
    holder: "王**",
    qrUrl: img("qr2", 200, 200),
    dailyLimit: 20000,
    todayReceived: 6500,
    status: "active",
    lastUsedAt: "2025-11-28 11:02",
  },
  {
    id: "a3",
    channel: "alipay",
    holder: "李**",
    qrUrl: img("qr3", 200, 200),
    dailyLimit: 30000,
    todayReceived: 30000,
    status: "active",
    lastUsedAt: "2025-11-28 12:11",
  },
  {
    id: "a4",
    channel: "alipay",
    holder: "赵**",
    qrUrl: img("qr4", 200, 200),
    dailyLimit: 30000,
    todayReceived: 0,
    status: "paused",
  },
];

export const REFUNDS: RefundRequest[] = [
  {
    id: "R001",
    orderId: "DD20251125003",
    amountCNY: 412.5,
    scenario: "out_of_stock",
    reason: "档口缺货,买手申请退款",
    status: "finance_pending",
    csUser: "客服-小南",
    createdAt: "2025-11-28 10:30",
  },
  {
    id: "R002",
    orderId: "DD20251124011",
    amountCNY: 198.0,
    scenario: "platform_initiated",
    reason: "平台质检瑕疵,主动联系买手退款",
    status: "paid",
    csUser: "客服-小南",
    financeUser: "财务-阿珍",
    createdAt: "2025-11-26 15:20",
  },
  {
    id: "R003",
    orderId: "DD20251128009",
    amountCNY: 89.5,
    scenario: "out_of_stock",
    reason: "SKU 全部断货,无法采购",
    status: "cs_pending",
    createdAt: "2025-11-28 19:10",
  },
];

export const krwToCny = (krw: number, rate = REFERENCE_RATE) =>
  Math.round(krw * rate * 100) / 100;

export const formatKRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
export const formatCNY = (n: number) => `¥${n.toFixed(2)}`;

// ========== 现货库 / 发货管理 ==========
// 逻辑：档口起订 2 件时，买手若选择「单件直购」，平台会为该 SKU 下 2 件订单，
// 其中 1 件发货给买手，另 1 件自动纳入现货库 STOCK_ITEMS。
// 下一次同款订单命中现货库时，可点「发现货」直接从库存出库。

export type StockItem = {
  id: string;
  productId: string;
  shopId: string;
  color: string;
  size: string;
  qty: number;
  sourceOrderId: string; // 由哪一笔订单入库；手动入库时为 "-"
  source: StockSource; // 入库来源
  operator?: string; // 手动入库时的操作人
  remark?: string; // 入库备注
  createdAt: string;
};

// 入库来源
export type StockSource = "manual" | "first_order_surplus";
export const STOCK_SOURCE_LABEL: Record<StockSource, string> = {
  manual: "手动入库",
  first_order_surplus: "首件2件起订",
};

export const STOCK_ITEMS: StockItem[] = [
  {
    id: "stk1",
    productId: "p2",
    shopId: "s1",
    color: "米色",
    size: "FREE",
    qty: 1,
    sourceOrderId: "DD20251020007",
    source: "first_order_surplus",
    createdAt: "2025-10-20 12:30",
  },
  {
    id: "stk2",
    productId: "p5",
    shopId: "s4",
    color: "白",
    size: "L",
    qty: 2,
    sourceOrderId: "DD20251015003",
    source: "first_order_surplus",
    createdAt: "2025-10-15 09:10",
  },
];

// 判定：该 productId 是否首次被下单（用于订单后台特殊标识）。
// mock：只要 STOCK_ITEMS / ORDERS 里都没出现过该 productId 的历史订单，就是「首次」。
const HISTORY_ORDERED = new Set<string>([
  ...STOCK_ITEMS.map((s) => s.productId),
  // 假定 DD20251127014 之前已下过 p4（第 3 单），不再是首单
  "p4",
]);
export const isFirstOrderForProduct = (productId: string) =>
  !HISTORY_ORDERED.has(productId);

// 现货库匹配：给定订单 item，是否命中现货（同 productId + color + size 且 qty ≥ 1）
export const findStockMatch = (
  productId: string,
  color: string,
  size: string,
) =>
  STOCK_ITEMS.find(
    (s) => s.productId === productId && s.color === color && s.size === size && s.qty > 0,
  );

// 发货渠道
export type ShipSource = "new_order" | "stock"; // 新订单代订 / 现货库出库
export type ShipStatus = "pending" | "picking" | "packed" | "shipped";
export const SHIP_STATUS_LABEL: Record<ShipStatus, string> = {
  pending: "待处理",
  picking: "拣货中",
  packed: "已打包",
  shipped: "已发货",
};

// ========== 售后 · 换货工单 ==========
// 平台不支持退货，仅支持换货。买家把货寄到国内集运仓 → 平台转寄韩国 →
// 韩国档口签收后再配同款/换款 → 重新发出给买家。

export const EXCHANGE_WAREHOUSE = {
  name: "东大门订货通 · 上海集运仓",
  contact: "换货收件组 · 021-6000-8899",
  address: "上海市青浦区华徐公路 3288 号 A 栋 2 楼 换货组(请注明工单号)",
  zip: "201703",
  hours: "工作日 09:00 – 18:00 签收",
};

export type ExchangeStatus =
  | "applied" // 待客服审核
  | "approved_wait_ship" // 审核通过 · 待买家寄回集运仓
  | "cn_received" // 集运仓已签收
  | "forwarded_kr" // 已转寄韩国
  | "kr_received" // 韩国档口已签收
  | "shop_exchanging" // 档口交换中（韩国档口正在处理不良交换）
  | "awaiting_return_fee" // 待买家补运费
  | "return_fee_paid" // 运费已收 · 待发货
  | "reshipped" // 已重新发出给买家
  | "completed" // 已完成
  | "rejected"; // 已驳回

export const EXCHANGE_STATUS_LABEL: Record<ExchangeStatus, string> = {
  applied: "待审核",
  approved_wait_ship: "待寄回",
  cn_received: "集运仓已签收",
  forwarded_kr: "转寄韩国中",
  kr_received: "韩国已签收",
  shop_exchanging: "档口交换中",
  awaiting_return_fee: "待补运费",
  return_fee_paid: "运费已收 · 待发货",
  reshipped: "已重新发出",
  completed: "已完成",
  rejected: "已驳回",
};

export type ExchangeReason =
  | "size" // 尺码不符
  | "color" // 颜色不符
  | "defect" // 质量瑕疵
  | "wrong_item" // 发错款
  | "other";

export const EXCHANGE_REASON_LABEL: Record<ExchangeReason, string> = {
  size: "尺码不合适",
  color: "颜色/款式不符预期",
  defect: "质量瑕疵",
  wrong_item: "发错款",
  other: "其他",
};

export type ExchangeRequest = {
  id: string;
  orderId: string;
  createdAt: string;
  status: ExchangeStatus;
  reason: ExchangeReason;
  note?: string;
  // 换货明细：原 SKU → 期望新 SKU
  item: {
    productId: string;
    productName: string;
    image: string;
    fromColor: string;
    fromSize: string;
    toColor: string;
    toSize: string;
    qty: number;
  };
  // 物流三段
  buyerToCn?: { carrier: string; trackingNo: string; shippedAt?: string; receivedAt?: string };
  cnToKr?: { batchNo: string; shippedAt?: string; receivedAt?: string };
  krToBuyer?: { carrier: string; trackingNo: string; shippedAt?: string };
  photos?: string[]; // 买手上传的凭证
  csUser?: string;
  rejectReason?: string;
  // 补运费（重新发出前平台向买家收取的国际运费）
  returnFee?: {
    amountCNY: number;
    requestedAt?: string; // 平台发起补运费的时间
    paidAt?: string;      // 买家支付时间
  };
};

export const EXCHANGES: ExchangeRequest[] = [
  {
    id: "EX20260701001",
    orderId: "DD20251120002",
    createdAt: "2026-07-02 10:20",
    status: "applied",
    reason: "size",
    note: "M 码偏小，希望换 L 码",
    item: {
      productId: "p1",
      productName: "羊毛混纺 双排扣大衣",
      image: "https://picsum.photos/seed/milk/300/300",
      fromColor: "米色",
      fromSize: "M",
      toColor: "米色",
      toSize: "L",
      qty: 1,
    },
    photos: ["https://picsum.photos/seed/ex1a/400/400", "https://picsum.photos/seed/ex1b/400/400"],
  },
  {
    id: "EX20260625003",
    orderId: "DD20251115007",
    createdAt: "2026-06-25 14:10",
    status: "cn_received",
    reason: "color",
    note: "实物颜色偏黄，换黑色同码",
    item: {
      productId: "p3",
      productName: "针织半身裙",
      image: "https://picsum.photos/seed/blue/300/300",
      fromColor: "米色",
      fromSize: "FREE",
      toColor: "黑色",
      toSize: "FREE",
      qty: 1,
    },
    csUser: "客服-小南",
    buyerToCn: {
      carrier: "顺丰",
      trackingNo: "SF1289334****",
      shippedAt: "2026-06-26 09:00",
      receivedAt: "2026-06-28 11:20",
    },
  },
  {
    id: "EX20260618002",
    orderId: "DD20251110004",
    createdAt: "2026-06-18 16:00",
    status: "reshipped",
    reason: "defect",
    note: "袖口线头 + 一颗扣子松动",
    item: {
      productId: "p2",
      productName: "宽松西装外套",
      image: "https://picsum.photos/seed/stella/300/300",
      fromColor: "黑色",
      fromSize: "L",
      toColor: "黑色",
      toSize: "L",
      qty: 1,
    },
    csUser: "客服-阿珍",
    buyerToCn: {
      carrier: "圆通",
      trackingNo: "YT77291****",
      shippedAt: "2026-06-19",
      receivedAt: "2026-06-21",
    },
    cnToKr: { batchNo: "KR-BATCH-20260622", shippedAt: "2026-06-22", receivedAt: "2026-06-25" },
    krToBuyer: { carrier: "极兔跨境", trackingNo: "JT88112****", shippedAt: "2026-06-30" },
  },
  {
    id: "EX20260620004",
    orderId: "DD20251112009",
    createdAt: "2026-06-20 11:30",
    status: "awaiting_return_fee",
    reason: "defect",
    note: "拉链损坏，档口已交换新品，等买家补运费。",
    item: {
      productId: "p5",
      productName: "宽松直筒牛仔裤",
      image: "https://picsum.photos/seed/denim/300/300",
      fromColor: "蓝色",
      fromSize: "M",
      toColor: "蓝色",
      toSize: "M",
      qty: 1,
    },
    csUser: "客服-阿珍",
    buyerToCn: { carrier: "顺丰", trackingNo: "SF9911****", shippedAt: "2026-06-21", receivedAt: "2026-06-23" },
    cnToKr: { batchNo: "KR-BATCH-20260624", shippedAt: "2026-06-24", receivedAt: "2026-06-27" },
    returnFee: { amountCNY: 45, requestedAt: "2026-07-01 10:00" },
  },
  {
    id: "EX20260622005",
    orderId: "DD20251113010",
    createdAt: "2026-06-22 09:10",
    status: "return_fee_paid",
    reason: "wrong_item",
    note: "档口发错款，已交换正确款，等待发货。",
    item: {
      productId: "p6",
      productName: "V 领针织衫",
      image: "https://picsum.photos/seed/knit/300/300",
      fromColor: "杏色",
      fromSize: "FREE",
      toColor: "黑色",
      toSize: "FREE",
      qty: 1,
    },
    csUser: "客服-小南",
    buyerToCn: { carrier: "圆通", trackingNo: "YT88221****", shippedAt: "2026-06-23", receivedAt: "2026-06-25" },
    cnToKr: { batchNo: "KR-BATCH-20260626", shippedAt: "2026-06-26", receivedAt: "2026-06-29" },
    returnFee: { amountCNY: 38, requestedAt: "2026-07-02 09:00", paidAt: "2026-07-02 14:30" },
  },
  {
    id: "EX20260610008",
    orderId: "DD20251105011",
    createdAt: "2026-06-10 09:30",
    status: "rejected",
    reason: "other",
    note: "买家反悔想换其他款",
    item: {
      productId: "p4",
      productName: "小香风短外套",
      image: "https://picsum.photos/seed/hera/300/300",
      fromColor: "粉",
      fromSize: "S",
      toColor: "粉",
      toSize: "S",
      qty: 1,
    },
    csUser: "客服-小南",
    rejectReason: "非质量问题且已过 7 天售后期，按平台规则不受理换货。",
  },
];