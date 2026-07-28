import { useSyncExternalStore } from "react";

export type MembershipTier = "guest" | "gold" | "diamond";

/** 黄金会员：返佣进入「抵用金」，下单时最高可抵扣订单金额的比例 */
export const DEDUCT_RATIO = 0.3;
export const DEDUCT_RATIO_TEXT = `最高抵扣订单金额 ${Math.round(DEDUCT_RATIO * 100)}%`;

export type Plan = {
  key: MembershipTier;
  name: string;
  price: string;
  priceNum: number;
  tag: string;
  color: string;
  ring: string;
  desc: string;
  highlights: string[];
  bonusPoints: number;
};

export const PLANS: Plan[] = [
  {
    key: "guest",
    name: "游客",
    price: "¥0",
    priceNum: 0,
    tag: "先逛逛",
    color: "from-slate-400 to-slate-300",
    ring: "ring-slate-300/50",
    desc: "免费下单，无返佣、无积分、满 ¥300 免运",
    highlights: ["可下单不占坑", "满 ¥300 免运", "无积分 / 无返佣", "随时可开通付费会员"],
    bonusPoints: 0,
  },
  {
    key: "gold",
    name: "黄金会员",
    price: "¥99 / 年",
    priceNum: 99,
    tag: "自用党首选",
    color: "from-amber-500 to-yellow-400",
    ring: "ring-amber-300/60",
    desc: `返佣变抵用金，买商品直接抵现（${DEDUCT_RATIO_TEXT}）`,
    highlights: [
      "全场免运费",
      `返佣转抵用金，购物抵现（${DEDUCT_RATIO_TEXT}）`,
      "3% 创作返佣",
      "开卡送 1000 积分",
    ],
    bonusPoints: 1000,
  },
  {
    key: "diamond",
    name: "钻石会员",
    price: "¥199 / 年",
    priceNum: 199,
    tag: "分享党推荐",
    color: "from-sky-500 via-cyan-400 to-teal-300",
    ring: "ring-cyan-300/70",
    desc: "黄金会员全部权益，且返佣可提现到微信 / 支付宝，T+1 到账",
    highlights: [
      "黄金会员全部权益",
      "返佣可提现（满 ¥50 起提，T+1）",
      "L1 0.5% / L2 0.2% 邀请返佣",
      "开卡送 3000 积分",
    ],
    bonusPoints: 3000,
  },
];

// [权益项, 游客, 黄金会员, 钻石会员]
export const RIGHTS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["基础购物", "可下单", "可下单", "可下单"],
  ["基础积分（¥1=1积分）", "无积分", "可获得", "可获得"],
  ["积分加速（额外 +50%）", false, "1.5×", "1.5×"],
  ["积分用途", "不可用", "可兑换积分商城物品", "可兑换积分商城物品"],
  ["全场包邮", "满 ¥300 包邮（不满收 ¥6）", "全场包邮", "全场包邮"],
  ["开卡礼（立即到账积分）", "无", "1000 积分", "3000 积分"],
  ["返佣抵现购物", false, DEDUCT_RATIO_TEXT, DEDUCT_RATIO_TEXT],
  ["发帖权限（引用订单）", "不可发帖", "可发帖，佣金抵现", "可发帖，佣金可提现"],
  ["创作返佣（3%）", "不可参与", "可赚，抵现购物", "可赚，可提现"],
  ["邀请返佣（L1 0.5%）", "不可参与", "可赚，抵现购物", "可赚，可提现"],
  ["拼单返佣（+1%）", "不可参与", "可赚，抵现购物", "可赚，可提现"],
  ["提现权限", false, false, "满 ¥50 起提，T+1"],
  ["年费", "¥0", "¥99", "¥199（续费 ¥169）"],
];

export const TIER_LABEL: Record<MembershipTier, string> = {
  guest: "游客",
  gold: "黄金会员",
  diamond: "钻石会员",
};

const KEY = "membership_tier_v1";
const listeners = new Set<() => void>();

function read(): MembershipTier {
  if (typeof window === "undefined") return "gold";
  const v = window.localStorage.getItem(KEY) as MembershipTier | null;
  if (v === "guest" || v === "gold" || v === "diamond") return v;
  return "gold";
}

export function setTier(t: MembershipTier) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, t);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTier(): MembershipTier {
  return useSyncExternalStore(subscribe, read, () => "gold");
}
