
# 前后端联调需求盘点

目前整站数据均为前端模拟（`src/lib/mock-data.ts`、`localStorage`、`rank-data.ts`），未接入任何真实后端。要上线，需要按下述顺序做「前后联调」。建议基于 Lovable Cloud（Supabase）搭建，全部走 TanStack Start server functions。

## 一、必须联调（P0：核心业务闭环）

### 1. 账号与权限
- 页面：`auth.tsx`、`me.tsx`、`kyc.tsx`、`admin.users.tsx`
- 需要：邮箱/手机注册登录、Session、KYC 提交与审核、买手/管理员角色（`user_roles` 单独表 + `has_role`）
- 后端：Supabase Auth + `profiles`、`kyc_submissions`、`user_roles`

### 2. 商品 / 档口 / 分类
- 前端：`shops.index.tsx`、`shops.$id.tsx`、`products.$id.tsx`、`new-arrivals.tsx`、`index.tsx`
- 后台：`admin.products.tsx`、`admin.shops.tsx`、`admin.categories.tsx`
- 表：`shops`、`products`（含 images/colors/sizes/discount/isNew）、`product_categories`
- 需要：列表/详情读取、后台增删改、Excel 批量导入、图片上传+水印（Supabase Storage）

### 3. 购物车 / 收藏
- 前端：`cart.tsx`、`favorites.tsx`、`products.$id.tsx`
- 表：`cart_items`、`favorites`（RLS 按 user_id）
- 需要：加购、改数量、删除、跨设备同步

### 4. 下单 / 支付 / 订单跟踪
- 前端：`checkout.tsx`、`orders.index.tsx`、`orders.$id.tsx`、`logistics.$id.tsx`
- 后台：`admin.orders.tsx`、`admin.shipping.tsx`、`admin.payment-accounts.tsx`
- 表：`orders`、`order_items`、`shipments`、`shipment_events`、`payment_accounts`
- 需要：下单、支付回调（微信/支付宝/韩币收款 Webhook → `/api/public/webhooks/*`）、订单状态机、物流轨迹录入

### 5. 地址簿
- 前端：`addresses.tsx`、`checkout.tsx`
- 表：`user_addresses`

## 二、需联调（P1：完善体验）

### 6. 拼单
- 前端：`groups.tsx`、后台 `admin.groups.tsx`
- 表：`group_buys`、`group_members`；到期结算需要定时任务（pg_cron → `/api/public/cron/group-settle`）

### 7. 现货管理
- 前端：`products.$id.tsx`（现货匹配）、后台 `admin.stock.tsx`
- 表：`stock_items`，与 `orders` 联动扣减

### 8. 退款工单
- 前端：`orders.$id.tsx` 发起入口、后台 `admin.refunds.tsx`
- 表：`refund_requests`、`refund_evidence`（图片）

### 9. 反馈与售后
- 前端：`support.tsx`、订单页反馈按钮
- 后台：`admin.feedback.tsx`
- 表：`order_feedback`、`support_tickets`

### 10. 积分体系
- 前端：`points.tsx`、`points.history.tsx`、`points-rules.tsx`、`invite-rules.tsx`
- 后台：`admin.points-mall.tsx`
- 表：`points_ledger`、`points_rules`、`points_products`、`redemptions`、`invite_codes`
- 触发：下单/邀请/签到 → 服务端事件写入 ledger

### 11. 汇率与平台配置
- 前端：全站 `krwToCny`、`checkout.tsx`
- 后台：`admin.config.tsx`
- 表：`platform_config`（汇率、加价率、费率）；可选定时抓取韩币汇率

## 三、可迁移到后端（P2：目前用 localStorage）

以下已可用但存本地，需搬到数据库以便后台真正生效：

- `src/lib/banners.ts` → `banners` 表 + Storage 图片
- `src/lib/categories.ts` → `product_categories` 表（与 P0-2 合并）
- 折扣/优惠 `discounts.tsx` → `discount_rules` 表
- 排行榜 `rank-data.ts`（`APM_RANK`、`OFFLINE_HOT`）→ 由订单数据实时聚合，或后台可编辑的 `shop_rankings` 表

## 四、后端接口分工

- **createServerFn**：所有 App 内读写（商品列表、下单、加购、收藏、后台 CRUD）
- **Server routes `/api/public/*`**：
  - 支付回调 Webhook（HMAC 校验）
  - 物流查询 Webhook / 拉取脚本
  - pg_cron 定时任务（拼单结算、汇率刷新、榜单聚合）
- **Storage**：商品图、Banner、KYC 证件、退款凭证、水印后原图

## 五、建议实施顺序

```text
Step 1  开启 Lovable Cloud + 建表 schema（含 RLS/GRANT）
Step 2  Auth + 角色 + KYC             ← 打通登录
Step 3  分类/档口/商品 CRUD + 图片    ← 打通目录
Step 4  购物车 + 收藏 + 地址          ← 打通选购
Step 5  下单 + 支付 Webhook + 订单    ← 打通交易
Step 6  发货 + 物流 + 现货            ← 打通履约
Step 7  退款 + 反馈 + 售后            ← 打通售后
Step 8  拼单 + 积分 + 邀请            ← 增长模块
Step 9  Banner / 分类 / 配置搬后端    ← 后台生效
Step 10 排行榜聚合 + 定时任务         ← 数据运营
```

## 六、待你确认

1. 是否直接启用 **Lovable Cloud (Supabase)** 作为后端？
2. 支付通道优先接：微信 / 支付宝 / Stripe / Toss（韩国）中的哪几个？
3. 图片存储是否使用 Supabase Storage + 服务端加水印？还是接第三方 CDN？
4. 是否需要多语言（韩文/中文/英文）字段，还是先只做中文？

确认后我按 Step 1 开始落地。
