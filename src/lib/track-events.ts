// 运营埋点事件字典（buyer-side）
// 用法：import { EV } from "@/lib/track-events"; track(EV.ORDER_PAY_SUCCESS, {...})

export const EV = {
  // —— 曝光 & 浏览 ——
  PAGE_VIEW: "page_view",                 // { route }
  BANNER_IMPRESSION: "banner_impression", // { bannerId, slot }
  BANNER_CLICK: "banner_click",           // { bannerId, slot, target }
  PRODUCT_VIEW: "product_view",           // { productId, shopId, source }
  SHOP_VIEW: "shop_view",                 // { shopId, building, floor }
  SEARCH: "search",                       // { keyword, results }

  // —— 交易漏斗 ——
  ADD_TO_CART: "add_to_cart",             // { productId, qty, price }
  CART_VIEW: "cart_view",
  CHECKOUT_START: "checkout_start",       // { itemsCount, amount }
  ORDER_CREATE: "order_create",           // { orderId, amount, itemsCount, hasCoupon, usePoints }
  ORDER_PAY_SUCCESS: "order_pay_success", // { orderId, amount, payMethod, isGroupBuy }
  ORDER_SIGNED: "order_signed",           // { orderId, days_since_ship }
  ORDER_CANCEL: "order_cancel",           // { orderId, stage, reason }

  // —— 积分 ——
  POINTS_EARN: "points_earn",             // { source, amount, refId }
  POINTS_REDEEM: "points_redeem",         // { itemId, cost }
  POINTS_DEDUCT: "points_deduct",         // { orderId, amount, cash }
  POINTS_LOTTERY: "points_lottery",       // { cost, prize }

  // —— 邀请 & 分佣 ——
  INVITE_SHARE: "invite_share",           // { channel } // wx/xhs/link
  INVITE_SIGNUP: "invite_signup",         // { inviterId, inviteeId }
  INVITE_FIRST_ORDER: "invite_first_order", // { inviterId, inviteeId, orderId }
  COMMISSION_ACCRUE: "commission_accrue", // { level, amount, orderId }
  COMMISSION_SETTLE: "commission_settle", // { amount }
  COMMISSION_WITHDRAW: "commission_withdraw", // { amount, channel }

  // —— 会员 ——
  TIER_UP: "tier_up",                     // { from, to }
  TIER_DOWN: "tier_down",                 // { from, to }
  MEMBERSHIP_PAGE_VIEW: "membership_page_view",

  // —— 拼单 / 分享 ——
  GROUP_CREATE: "group_create",           // { productId, groupId }
  GROUP_JOIN: "group_join",               // { groupId, inviterId }
  GROUP_SUCCESS: "group_success",         // { groupId, membersCount }
  CONTENT_SHARE: "content_share",         // { targetType, targetId, channel }

  // —— 签到 & 生命周期 ——
  SIGN_IN: "sign_in",                     // { streak }
  APP_OPEN: "app_open",
  KYC_START: "kyc_start",
  KYC_SUCCESS: "kyc_success",

  // —— 售后 ——
  EXCHANGE_APPLY: "exchange_apply",       // { orderId, reason }
  REFUND_APPLY: "refund_apply",           // { orderId, amount, reason }
} as const;

export type EventName = typeof EV[keyof typeof EV];