import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_CATEGORIES,
  saveCategories,
  useCategories,
  type ProductCategory,
} from "@/lib/categories";
import { PRODUCTS } from "@/lib/mock-data";
import { Plus, Trash2, RotateCcw, ArrowUp, ArrowDown, Save } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "属性分类 · 运营后台" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const stored = useCategories();
  const [list, setList] = useState<ProductCategory[]>(stored);
  const [dirty, setDirty] = useState(false);

  const update = (next: ProductCategory[]) => {
    setList(next);
    setDirty(true);
  };

  const patch = (id: string, p: Partial<ProductCategory>) => {
    update(list.map((c) => (c.id === id ? { ...c, ...p } : c)));
  };

  const move = (id: string, dir: -1 | 1) => {
    const sorted = list.slice().sort((a, b) => a.sort - b.sort);
    const i = sorted.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i]!;
    const b = sorted[j]!;
    const s = a.sort;
    a.sort = b.sort;
    b.sort = s;
    update(sorted);
  };

  const add = () => {
    const maxSort = list.reduce((m, c) => Math.max(m, c.sort), 0);
    update([
      ...list,
      {
        id: `cat_${Date.now().toString(36)}`,
        name: "新分类",
        nameKo: "",
        icon: "🏷️",
        sort: maxSort + 10,
        enabled: true,
      },
    ]);
  };

  const remove = (id: string) => update(list.filter((c) => c.id !== id));

  const reset = () => {
    if (!confirm("恢复默认分类？当前修改将被覆盖。")) return;
    update(DEFAULT_CATEGORIES);
  };

  const save = () => {
    saveCategories(list);
    setDirty(false);
  };

  const usageCount = (name: string) =>
    PRODUCTS.filter((p) => p.category === name).length;

  const sorted = list.slice().sort((a, b) => a.sort - b.sort);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商品属性分类</h1>
          <p className="text-xs text-muted-foreground">
            管理商品品类标签（外套 / 针织 / 鞋 …），商品管理与买手端筛选器共用此列表。
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="mr-1 h-4 w-4" />恢复默认
          </Button>
          <Button size="sm" variant="outline" onClick={add}>
            <Plus className="mr-1 h-4 w-4" />新增分类
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty}>
            <Save className="mr-1 h-4 w-4" />保存
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>排序</Th>
                <Th>图标</Th>
                <Th>中文名</Th>
                <Th>韩文名</Th>
                <Th>已用商品</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, idx) => (
                <tr key={c.id} className="border-t border-border">
                  <Td>
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-xs text-muted-foreground">
                        {c.sort}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => move(c.id, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === sorted.length - 1}
                        onClick={() => move(c.id, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Td>
                  <Td>
                    <Input
                      value={c.icon ?? ""}
                      onChange={(e) => patch(c.id, { icon: e.target.value })}
                      className="h-9 w-16 text-center"
                    />
                  </Td>
                  <Td>
                    <Input
                      value={c.name}
                      onChange={(e) => patch(c.id, { name: e.target.value })}
                      className="h-9 w-32"
                    />
                  </Td>
                  <Td>
                    <Input
                      value={c.nameKo ?? ""}
                      onChange={(e) => patch(c.id, { nameKo: e.target.value })}
                      className="h-9 w-32"
                      placeholder="선택"
                    />
                  </Td>
                  <Td>
                    <span className="text-xs text-muted-foreground">
                      {usageCount(c.name)} 件
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => patch(c.id, { enabled: !c.enabled })}
                      className="cursor-pointer"
                    >
                      {c.enabled ? (
                        <Badge>启用</Badge>
                      ) : (
                        <Badge variant="secondary">停用</Badge>
                      )}
                    </button>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dirty && (
          <div className="mt-3 text-xs text-primary">
            有未保存修改，点击右上角「保存」生效。
          </div>
        )}
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">说明</div>
        <div>· 中文名会作为商品的 <code className="font-mono">category</code> 字段值。</div>
        <div>· 停用后，买手端筛选器与新品入库将不再展示该分类，历史商品仍保留原分类名。</div>
        <div>· 排序数字越小越靠前，可用箭头快速调整。</div>
      </Card>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-medium">{children}</th>
);
const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`px-3 py-2 ${className}`}>{children}</td>;
