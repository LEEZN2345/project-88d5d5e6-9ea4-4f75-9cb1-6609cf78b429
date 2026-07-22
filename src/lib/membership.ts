import { useSyncExternalStore } from "react";

export type MembershipTier = "guest" | "normal" | "creator";

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
    highlights: ["可下单不占坑", "满 ¥300 免运", "无积分 / 无返佣", "随时可升级"],
    bonusPoints: 0,
  },
  {
    key: "normal",
    name: "普通会员",
    price: "¥99 / 年",
    priceNum: 99,
    tag: "自用党首选",
    color: "from-slate-600 to-slate-500",
    ring: "ring-slate-300/60",
    desc: "赚返佣抵扣自己订单，越买越省",
    highlights: [
      "全场免运费",
      "9.5 折会员专享价",
      "3% 创作返佣（购物抵扣）",
      "开卡送 1000 积分",
    ],
    bonusPoints: 1000,
  },
  {
    key: "creator",
    name: "创作者会员",
    price: "¥199 / 年",
    priceNum: 199,
    tag: "分享党推荐",
    color: "from-rose-500 via-orange-400 to-amber-400",
    ring: "ring-rose-300/70",
    desc: "返佣可提现到微信 / 支付宝，T+1 到账",
    highlights: [
      "全部普通会员权益",
      "3% 创作返佣（可提现）",
      "L1 0.5% / L2 0.2% 邀请返佣",
      "开卡送 3000 积分",
    ],
    bonusPoints: 3000,
  },
];

// [权益项, 游客, 普通, 创作者]
export const RIGHTS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["基础购物", "可下单", "可下单", "可下单"],
  ["基础积分（¥1=1积分）", "无积分", "可获得", "可获得"],
  ["积分加速（额外 +50%）", false, "1.5×", "1.5×"],
  ["积分用途", "不可用", "可兑换积分商城物品", "可兑换积分商城物品"],
  ["全场包邮", "满 ¥300 包邮（不满收 ¥6）", "全场包邮", "全场包邮"],
  ["会员专享价（9.5 折精选款）", "不可见", "可见 / 可享", "可见 / 可享"],
  ["开卡礼（立即到账积分）", "无", "1000 积分", "3000 积分"],
  ["发帖权限（引用订单）", "不可发帖", "可发帖，佣金仅抵扣", "可发帖，佣金可提现"],
  ["创作返佣（3%）", "不可参与", "可赚，仅购物抵扣", "可赚，可提现"],
  ["邀请返佣（L1 0.5%）", "不可参与", "可赚，仅购物抵扣", "可赚，可提现"],
  ["拼单返佣（+1%）", "不可参与", "可赚，仅购物抵扣", "可赚，可提现"],
  ["提现权限", false, false, "满 ¥50 起提，T+1"],
  ["年费", "¥0", "¥99", "¥199（续费 ¥169）"],
];

export const TIER_LABEL: Record<MembershipTier, string> = {
  guest: "游客",
  normal: "普通会员",
  creator: "创作者会员",
};

const KEY = "membership_tier_v1";
const listeners = new Set<() => void>();

function read(): MembershipTier {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(KEY) as MembershipTier | null;
  return v ?? "normal";
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
  return useSyncExternalStore(subscribe, read, () => "normal");
}
