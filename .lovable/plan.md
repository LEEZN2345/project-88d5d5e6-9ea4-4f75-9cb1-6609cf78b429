
## 积分 / 分佣 / 会员（v2 落地）

- 积分规则：1 元 = 1 分（基础 1%）；拼单发起人 +1%；≥2 件 +1%；分享种草 +50；邀请注册 +50 / 首单 +100；有效期 12 个月。抵扣 100 分 = ¥1，单笔最多抵 20%，抽奖 100 分/次。
- 会员：Bronze / Silver / Gold / Diamond，门槛 ¥0 / 2k / 10k / 100k（近 12 月），积分加成 1×/1.2×/1.5×/2×，包邮门槛 ¥300/200/100/0。每日 03:00 定时任务重算，不达标降 1 级（非归零）。
- 分佣：L1 0.7%（直接邀请）+ L2 0.3%（间接邀请），签收 14 天后可提，¥10 起提，微信/支付宝，T+1，平台承担手续费。分佣与积分独立记账。
- 页面：买手端 `/commission` 分佣钱包；后台 `/admin/commission`、`/admin/membership` 已上线。
- 埋点：见 `src/lib/track-events.ts` 事件字典（曝光/交易/积分/邀请/分佣/会员/拼单/签到/售后）。

## 目标

结合你选定的 5 个借鉴项，把运营后台再往前推一步；同时给出「运营需要看到的数据从哪里埋」的埋点方案，便于后续 M2 接 Cloud 时统一落库。全部静态页 + mock 数据，不接后端。

---

## 一、后台功能补齐（5 块）

### 1. 会员资产调整（MEM-USER-002 精简版）
**新增页**：`admin/users/$id` 内 Tab 「积分调整」 + 独立页 `admin/users/$id/points`
- 调整表单：+/− 数量、原因（下拉：客服补偿 / 活动奖励 / 违规扣减 / 手工订正 / 其他）、备注
- 提交后本地追加一条流水，Toast 反馈
- 流水表：时间 / 操作员 / 变动 / 原因 / 备注 / 关联单号
- 保留原「余额」字段但只读展示（不做调整，符合你的要求）
- **不新增**：余额充值/扣减入口

**mock**：`src/lib/mock-data.ts` 增加 `PointsLedgerEntry` 类型 + `MOCK_POINTS_LEDGER`（复用 `points.history.tsx` 已有结构，扩展 operator 字段）

### 2. 会员标签 & 分组
**新增页**：`/admin/user-tags`、`/admin/user-groups`
- **标签管理**：手动标签（VIP、可疑刷单、内部测试…）+ 系统标签（新用户、7日未下单、高客单）
- **分组（人群包）**：条件构造器 UI（历史消费总额 ≥ / 下单次数 ≥ / 最近下单 N 天内 / 含标签 / 会员等级）→ 命中人数预估 → 保存
- 用户详情 `admin/users/$id` 顶部展示已绑定标签 chips，可增删
- 用户列表 `admin/users` 增加「标签」筛选、「分组」筛选
- **不做**：真实推送/短信下发，仅生成人群包给未来的营销活动用

### 3. 签到规则 & 记录
**新增页**：`/admin/sign-in`
- Tab 1「规则配置」：连续签到奖励表（第 1/2/3/7/15/30 天分别奖励多少积分）、断签是否重置、月度全勤额外奖励
- Tab 2「签到记录」：日期筛选 + 用户搜索，列表展示 用户 / 签到日 / 连续天数 / 获得积分
- Tab 3「异常」：一天多签、跨设备签到等风控提示（仅 UI 展示）
- 买手端已有 `/points` 签到面板，本次不改，只做后台配置面

### 4. 数据中心：排行 + 导出
**改造**：`admin.index.tsx` 概览页新增「运营看板」区，并抽独立页 `/admin/analytics`
- 4 个排行榜（Tab 切换）：
  - 商品销量 Top20
  - 档口成交额 Top20
  - 用户消费 Top20（含手机号脱敏 + 会员等级）
  - 邀请拉新 Top20
- 每张榜右上角「导出 Excel」按钮：生成本地 CSV 下载（用 Blob，不接后端）
- 时间筛选：今日 / 昨日 / 近 7 日 / 近 30 日 / 自定义
- 顶部 4 个核心指标卡：GMV、订单数、支付用户数、客单价（含环比箭头）

### 5. DIY 首页装修完善
**改造**：`admin.banners.tsx` → 升级为 `/admin/home-decoration`
- 现状：只能配 Banner 图，跳转链接
- 升级为「组件化装修」抽屉编辑器：
  - 组件类型：轮播图 / 图标金刚区 / 优选档口横排 / 新品瀑布流 / 分类导航 / 自定义图文 / 富文本公告
  - 每个组件：启用开关、排序（拖拽或上下箭头）、标题、跳转、有效期
  - 左侧组件列表 + 右侧实时手机预览（复用 `MobileShell` 尺寸）
  - 保存后写入 `localStorage`，买手端 `routes/index.tsx` 按此顺序渲染
- Banner 数据源沿用 `src/lib/banners.ts`，扩展成 `HomeSection[]`

---

## 二、运营数据埋点方案

分 4 类事件 + 通用字段，前端埋点用 `src/lib/track.ts`（新增，先落 console + localStorage，M2 换 Cloud 表）。

### 通用字段
`event`、`ts`、`userId`（匿名则 device_id）、`role`（buyer/b_store/c_user/guest）、`route`、`referrer`、`platform`（h5/web-admin）、`session_id`

### A. 流量与页面
| 事件 | 触发点 | 关键属性 |
|---|---|---|
| `page_view` | 每个路由 mount | route, params, from_route |
| `banner_click` | 首页装修组件 | section_id, slot_index, link |
| `search` | 顶部搜索框 | keyword, result_count |
| `category_click` | 首页金刚区/分类页 | category_id |

### B. 商品与转化漏斗
| 事件 | 属性 |
|---|---|
| `shop_view` | shop_id, source（首页/榜单/搜索/收藏） |
| `product_view` | product_id, shop_id, price_krw, source |
| `add_to_cart` | product_id, qty, sku |
| `cart_view` | item_count, total_krw |
| `checkout_start` | order_amount_krw, rate_effective, item_count |
| `checkout_pay_click` | payment_channel |
| `order_paid` | order_id, total_cny, snapshot_rate, item_count |
| `order_confirmed` | order_id, days_since_paid |

### C. 增长
| 事件 | 属性 |
|---|---|
| `invite_share_click` | channel（wechat/link/qrcode） |
| `invite_signup` | inviter_id, invitee_id |
| `signin` | streak_days, points_gain |
| `points_exchange` | reward_id, cost_points |
| `kyc_submit` / `kyc_pass` / `kyc_reject` | user_id, reason |

### D. 售后 & 客服
| 事件 | 属性 |
|---|---|
| `exchange_apply` | order_id, item_count, reason |
| `exchange_stage_change` | request_id, from, to |
| `feedback_submit` | topic, has_image |
| `refund_apply` | order_id, amount |

### E. 后台运营行为（审计）
- `admin_login` / `admin_action`（action_type, target, diff）
- `points_manual_adjust`（operator, user_id, delta, reason）— 强制记录，对应模块 ①
- `home_decoration_publish`（section_ids）— 对应模块 ⑤

### 埋点消费
`/admin/analytics` 页面直接读 `localStorage` 里的 `track_events` 聚合出榜单和指标；未来切换 Cloud 时替换 `track.ts` 的 sink 即可，业务代码零改。

---

## 三、文件改动清单

**新增**
- `src/lib/track.ts` — 埋点 SDK（记录 + 聚合读取）
- `src/routes/admin.user-tags.tsx`
- `src/routes/admin.user-groups.tsx`
- `src/routes/admin.sign-in.tsx`
- `src/routes/admin.analytics.tsx`
- `src/routes/admin.home-decoration.tsx`（替代 `admin.banners.tsx` 的位置，或并存）
- `src/routes/admin.users.$id.points.tsx`（积分调整 & 流水）

**改动**
- `src/lib/mock-data.ts` — 追加 PointsLedger / UserTag / UserGroup / SignInRule / SignInRecord / HomeSection 类型与假数据
- `src/lib/banners.ts` → 扩展或重写为 `home-decoration.ts`
- `src/components/AdminShell.tsx` — 侧栏加入「用户运营」组：标签、分组、签到；数据中心组：运营看板
- `src/routes/admin.index.tsx` — 顶部 4 指标卡 + 排行榜入口
- `src/routes/admin.users.$id.tsx` — 加标签 chips + 积分调整入口
- `src/routes/admin.users.tsx` — 加标签/分组筛选
- `src/routes/index.tsx` — 按 `HomeSection[]` 顺序渲染
- `src/routes/__root.tsx` / `src/router.tsx` — 首次加载注册全局 `page_view` 埋点

---

## 四、里程碑

1. 埋点 SDK + mock 数据结构扩展（基础）
2. 积分调整、签到规则、标签分组（用户运营三件套）
3. 数据中心排行 + 导出（消费埋点数据）
4. DIY 首页装修（组件化 + 预览）
5. AdminShell 导航整理 + 概览页升级

预计工作量：中等，全部前端静态实现，一次交付。
