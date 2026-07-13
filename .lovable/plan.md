# 统一 apM 蓝 & 灯牌字体体系

在已有 `--primary = apM blue`、`font-display = Barlow Semi Condensed` 基础上，把全站按钮、链接、表单控件的配色和字号收拢到同一套语言，避免各页面各写各的。

## 一、设计规范（落到 `src/styles.css`）

**字号 / 字重**
- 主按钮、Tab、SignBoard 标签 → `font-display`（Barlow Semi Condensed）+ `font-bold` + `uppercase tracking-tight`
- 表单 label、正文 → `font-sans` (Inter)
- 输入框内文字统一 `text-sm`（14px）不再 `text-xs`

**配色语义**
- 主按钮 = `bg-primary text-primary-foreground`（apM 蓝）
- 次按钮 = `variant="outline"`，边框改用 `border-primary/40 text-primary`
- 幽灵按钮 = `variant="ghost"`，hover 底色 `bg-primary/8`
- 链接 = 新增工具类 `.link` → `text-primary underline-offset-4 hover:underline`
- 危险 = 保持 `destructive`
- Focus ring 全部指到 `--ring = apM blue`

**新增 CSS 变量**
- `--ring` 改为 `oklch(0.36 0.18 264 / 0.5)` 与 primary 同色
- `--input` 描边改 `oklch(0.90 0.02 260)`（微冷灰，配 apM 白袋质感）

## 二、组件层改造

**`src/components/ui/button.tsx`**
- 默认字体加 `font-display uppercase tracking-tight`
- `variant.default`：从纯色改成微渐变 `bg-gradient-to-b from-[color:var(--apm)] to-[color:var(--apm-ink)]`，配 apM 袋子印刷感
- `variant.outline`：`border-primary/40 text-primary bg-transparent hover:bg-primary/8`
- `variant.secondary`：改成灰色 place 调 `bg-neutral-800 text-white`（对应 Place 袋子灰）
- 新增 `variant="sign"`：直接调用 `.sign-board` 样式（灯牌按钮）
- `size.default` 提到 `h-10`，字号 `text-sm`

**`src/components/ui/input.tsx` / `select.tsx` / `textarea.tsx`**
- 高度 `h-10`、`text-sm`、`rounded-md`
- `focus-visible:ring-2 ring-ring/50 ring-offset-0 border-primary`
- placeholder `text-muted-foreground/70`

**`src/components/ui/badge.tsx`**
- `default` 改为 apM 蓝细描边填充 `bg-primary/10 text-primary border-primary/30`

**`src/components/MobileShell.tsx`**
- 底部 Tab 激活态：图标 + 文字 `text-primary font-display font-bold`
- 顶部 Header 标题：`font-display font-black tracking-tight`

## 三、页面层（批量搜索替换，只改样式类）

用 rg 找出以下模式统一换成 shadcn `Button` / `Link` + 语义类，不改业务逻辑：

- 页面里手写 `<button className="rounded-... bg-...">` 且非灯牌 → `<Button variant=...>`
- 手写小链接 `text-xs text-muted-foreground` 且明显是 CTA（"更多"、"全部…→"） → 加 `link` 工具类，颜色改 primary
- 所有 `text-blue-500 / bg-blue-500 / bg-rose-500 / bg-amber-*`（除排行榜奖牌、状态色如 destructive、成功绿）→ 统一到 primary / accent 语义色
- 各处硬编码 `text-[10px] / text-[11px]` 的正文类标签统一到 `text-xs`（12px），保留 `text-[10px]` 仅用于超小副标

涉及文件（挑出高优先）：
`src/routes/index.tsx`、`shops.index.tsx`、`shops.$id.tsx`、`products.$id.tsx`、`cart.tsx`、`checkout.tsx`、`orders.index.tsx`、`orders.$id.tsx`、`me.tsx`、`admin.*`。

## 四、验证

- `bunx tsgo --noEmit` 通过
- Playwright 截图首页 / 档口列表 / 商品详情 / 结算 / 后台首页，肉眼核对：
  - 主按钮均为 apM 蓝渐变
  - 链接颜色一致
  - 输入框高度、focus ring 一致
  - 底部导航激活态用灯牌字体
- 检查 dark mode 下对比度（primary-foreground 仍为白）

## 五、不动的东西

- 排行榜金/银/铜奖牌渐变
- 折扣红标、"实体热" 红标（属于状态语义）
- SignBoard 组件本身的青白/暖金背光（这是品牌独立系统）
- 业务逻辑、数据、路由结构

## 六、预计改动量

~14 个组件 / 页面文件，纯样式改动，无 API 变化。
