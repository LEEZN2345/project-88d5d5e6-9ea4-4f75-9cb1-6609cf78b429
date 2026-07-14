import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { PRODUCTS, formatKRW, krwToCny, formatCNY } from "@/lib/mock-data";
import { getCategoryById, useCategories } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/categories/$id")({
  head: ({ params }) => {
    const cat = getCategoryById(params.id);
    const title = cat ? `${cat.name} · apM 订货通` : "分类 · apM 订货通";
    return { meta: [{ title }, { name: "description", content: `${cat?.name ?? ""} 全部商品与二级分类。` }] };
  },
  loader: ({ params }) => {
    const cat = getCategoryById(params.id);
    if (!cat) throw notFound();
    return { categoryId: params.id };
  },
  notFoundComponent: () => (
    <MobileShell>
      <MobileHeader title="分类未找到" back />
      <div className="p-8 text-center text-sm text-muted-foreground">
        该分类不存在或已下线。
      </div>
    </MobileShell>
  ),
  errorComponent: () => (
    <MobileShell>
      <MobileHeader title="出错了" back />
      <div className="p-8 text-center text-sm text-muted-foreground">页面加载失败，请稍后重试。</div>
    </MobileShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  const cats = useCategories();
  const cat = cats.find((c) => c.id === id);
  const [activeSub, setActiveSub] = useState<string>("all");
  const [q, setQ] = useState("");

  if (!cat) return null;
  const subs = cat.subs.filter((s) => s.enabled);
  const subNames = subs.map((s) => s.name);

  const list = PRODUCTS.filter((p) => {
    if (activeSub === "all") {
      return subNames.length === 0 || subNames.includes(p.category);
    }
    const s = subs.find((x) => x.id === activeSub);
    return s ? p.category === s.name : true;
  }).filter((p) => (q ? p.name.includes(q) || p.internalCode.includes(q) : true));

  return (
    <MobileShell>
      <MobileHeader title={cat.name} back />

      {/* 顶部二级分类横向滚动条 */}
      <div className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="scrollbar-none flex gap-4 overflow-x-auto px-4 py-2.5 text-sm">
          <SubTab
            active={activeSub === "all"}
            label="全部"
            onClick={() => setActiveSub("all")}
          />
          {subs.map((s) => (
            <SubTab
              key={s.id}
              active={activeSub === s.id}
              label={s.name}
              onClick={() => setActiveSub(s.id)}
            />
          ))}
        </div>
      </div>

      {/* 搜索 + 筛选 */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`在 ${cat.name} 中搜索`}
            className="pl-9 bg-muted/50"
          />
        </div>
        <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
          筛选 <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 商品数 */}
      <div className="mt-3 flex items-baseline gap-1 px-4 text-sm">
        <span className="text-muted-foreground">商品</span>
        <span className="font-semibold text-rose-500">{list.length.toLocaleString()}</span>
      </div>

      {/* 信息流 */}
      {list.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          该分类下暂无商品
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-6">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/products/$id"
              params={{ id: p.id }}
              className="block overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[3/4]">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                {p.isNew && (
                  <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">新款</Badge>
                )}
                {p.discount && (
                  <Badge className="absolute left-2 top-2 bg-rose-500 text-white">-{p.discount}%</Badge>
                )}
              </div>
              <div className="p-2">
                <div className="line-clamp-1 text-xs">{p.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-sm font-semibold">{formatKRW(p.priceKRW)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ≈{formatCNY(krwToCny(p.priceKRW))}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">{p.internalCode}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MobileShell>
  );
}

function SubTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative whitespace-nowrap pb-1 ${
        active ? "font-semibold text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </button>
  );
}