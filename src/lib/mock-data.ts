// 前端原型 mock 数据 (M1)。后续替换为 Lovable Cloud 数据。

export type Shop = {
  id: string;
  name: string;
  nameKo: string;
  brand?: string; // 主打品牌名
  building: string; // 例如 doota / migliore / apm
  floor: string;
  tags: string[];
  minOrderQty: 1 | 2; // 起订件数：1=支持单件购买，2=同款 2 件起批
  cover: string;
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
    name: "MILK 女装",
    nameKo: "밀크",
    brand: "MILK",
    building: "Migliore",
    floor: "2F-A41",
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
    floor: "5F-B12",
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
    floor: "B1-22",
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
    floor: "3F-C08",
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
    composition: "羊毛 70% 涤纶 30%",
    detail: "落肩廓形 / 内里加绒 / 建议搭配高领针织",
    purchaseCondition: "2件起订 · 不可换色 · 到货 7 天内可退",
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
    composition: "羊毛 40% 腈纶 60%",
    purchaseCondition: "2件起订 · 同色同码",
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
    reason: "档口缺货,买手申请退款",
    status: "finance_pending",
    csUser: "客服-小南",
    createdAt: "2025-11-28 10:30",
  },
  {
    id: "R002",
    orderId: "DD20251124011",
    amountCNY: 198.0,
    reason: "尺码不符,已退回",
    status: "paid",
    csUser: "客服-小南",
    financeUser: "财务-阿珍",
    createdAt: "2025-11-26 15:20",
  },
  {
    id: "R003",
    orderId: "DD20251128009",
    amountCNY: 89.5,
    reason: "买手取消订单",
    status: "cs_pending",
    createdAt: "2025-11-28 19:10",
  },
];

export const krwToCny = (krw: number, rate = REFERENCE_RATE) =>
  Math.round(krw * rate * 100) / 100;

export const formatKRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
export const formatCNY = (n: number) => `¥${n.toFixed(2)}`;