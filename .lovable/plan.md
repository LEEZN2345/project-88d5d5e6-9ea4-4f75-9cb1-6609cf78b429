## 目标
调整 `/groups` 拼单卡片信息层级，并给「分享此团」「加入拼单」两个按钮加上实际交互（前端 mock）。

## 卡片信息重构

现状：只有商品名 + 团长 + 内部款号；价格对比是 `1.2× vs 1.13×` 硬编码。

改成：
```text
[图]  羊毛混纺翻领长大衣                    [拼单价]
      🏬 MILK 女装 · Migliore 2F-A41
      👤 团长 @xiaomei_88
      ¥1006.15   ¥1207.38   省 ¥201.23（对比单件直购）
────────────────────────────────
👥 1/2 人 · 还差 1 人             ⏰ 23:59:12
[分享此团]              [加入拼单]
```

字段来源：
- 档口名 / 位置：`SHOPS.find(s => s.id === p.shopId)` → `shop.name` + `shop.building + shop.floor + shop.stallCode`（复用商品详情页现有拼装方式）
- 团长：`GroupItem` 增加 `leaderId` 字段（如 `@xiaomei_88`），旧 `leader` 保留作为昵称备用；显示形式 `团长 @xiaomei_88`
- 拼单价 = `krwToCny(priceKRW) × 1.15`（沿用商品详情 group tier 的 15%）
- 单件直购价 = `krwToCny(priceKRW) × 1.20`（solo tier 20%）
- 省 = 单件价 − 拼单价，与商品详情页三档定价口径保持一致（原来的 1.13 是遗留错误）

## 按钮交互（前端 mock）

**分享此团**：点击弹 `Dialog`（shadcn），内容：
- 顶部：小卡预览（复用当前卡片主体）
- 中间：一段可复制的邀请链接 `https://ddm.app/groups/{productId}` + 复制按钮（`navigator.clipboard.writeText` + toast「链接已复制」）
- 底部：一行小字「把链接发给好友，Ta 点击加入即可成团」
- 无需真实二维码/微信 SDK，纯前端演示

**加入拼单**：点击弹 `AlertDialog`，内容：
- 标题：「加入 {商品名} 拼单」
- 描述：确认价格 `¥xxx`，提示「成团后统一扣款，未成团 24h 自动全额退款」
- 确定按钮 → 本地把该团 `joined` +1（`useState` 覆盖 mock 数组），toast「已加入拼单，还差 X 人」；若正好凑满则 toast「🎉 拼团成功！平台将统一下单」并把角标改为「已成团」
- 取消按钮关闭

## 技术要点
- 只改 `src/routes/groups.tsx`；`GROUPS` 从 `const` 改为组件内 `useState` 以便本地更新
- 新增 `leaderId` 字段到 `GroupItem`（4 条 mock 数据补上）
- 复用 `@/components/ui/dialog`、`alert-dialog`、`sonner` 的 `toast`（若未引入则 `import { toast } from 'sonner'`）
- 顶部 banner 文案沿用当前「满 2 人即可成团」不动
- 不改数据模型 (`mock-data.ts`)、不动商品详情页、不接后端

## 不做
- 真实分享（微信 JSSDK / 二维码生成）
- 真实拼团后端 / 支付 / 退款
- 路由 `/groups/$id` 详情页（本轮先保持列表页交互）

## 验证
- 卡片显示档口名 + 位置 + 团长 @ID + 拼单价 + 划线单件价 + 省 ¥X
- 点「分享此团」弹出对话框，可复制链接，toast 提示
- 点「加入拼单」弹确认框 → 确认后人数 +1，凑满时显示「已成团」
