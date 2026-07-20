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
  type SubCategory,
  type LeafCategory,
} from "@/lib/categories";
import { PRODUCTS } from "@/lib/mock-data";
import {
  Plus,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "属性分类 · 运营后台" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const stored = useCategories();
  const [list, setList] = useState<ProductCategory[]>(stored);
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(stored.map((c) => [c.id, true])),
  );

  const update = (next: ProductCategory[]) => {
    setList(next);
    setDirty(true);
  };

  const patch = (id: string, p: Partial<ProductCategory>) => {
    update(list.map((c) => (c.id === id ? { ...c, ...p } : c)));
  };

  const patchSub = (cid: string, sid: string, p: Partial<SubCategory>) => {
    update(
      list.map((c) =>
        c.id === cid
          ? { ...c, subs: c.subs.map((s) => (s.id === sid ? { ...s, ...p } : s)) }
          : c,
      ),
    );
  };

  const patchLeaf = (
    cid: string,
    sid: string,
    lid: string,
    p: Partial<LeafCategory>,
  ) => {
    update(
      list.map((c) =>
        c.id === cid
          ? {
              ...c,
              subs: c.subs.map((s) =>
                s.id === sid
                  ? {
                      ...s,
                      leafs: (s.leafs ?? []).map((l) =>
                        l.id === lid ? { ...l, ...p } : l,
                      ),
                    }
                  : s,
              ),
            }
          : c,
      ),
    );
  };

  const addLeaf = (cid: string, sid: string) => {
    update(
      list.map((c) =>
        c.id === cid
          ? {
              ...c,
              subs: c.subs.map((s) =>
                s.id === sid
                  ? {
                      ...s,
                      leafs: [
                        ...(s.leafs ?? []),
                        {
                          id: `leaf_${Date.now().toString(36)}`,
                          name: "新细分",
                          enabled: true,
                        },
                      ],
                    }
                  : s,
              ),
            }
          : c,
      ),
    );
  };

  const removeLeaf = (cid: string, sid: string, lid: string) => {
    update(
      list.map((c) =>
        c.id === cid
          ? {
              ...c,
              subs: c.subs.map((s) =>
                s.id === sid
                  ? { ...s, leafs: (s.leafs ?? []).filter((l) => l.id !== lid) }
                  : s,
              ),
            }
          : c,
      ),
    );
  };

  const addSub = (cid: string) => {
    update(
      list.map((c) =>
        c.id === cid
          ? {
              ...c,
              subs: [
                ...c.subs,
                {
                  id: `sub_${Date.now().toString(36)}`,
                  name: "新子类",
                  nameKo: "",
                  enabled: true,
                },
              ],
            }
          : c,
      ),
    );
  };

  const removeSub = (cid: string, sid: string) => {
    update(
      list.map((c) =>
        c.id === cid ? { ...c, subs: c.subs.filter((s) => s.id !== sid) } : c,
      ),
    );
  };

  const moveSub = (cid: string, sid: string, dir: -1 | 1) => {
    update(
      list.map((c) => {
        if (c.id !== cid) return c;
        const subs = c.subs.slice();
        const i = subs.findIndex((s) => s.id === sid);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= subs.length) return c;
        [subs[i], subs[j]] = [subs[j]!, subs[i]!];
        return { ...c, subs };
      }),
    );
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
        subs: [],
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

  const totalUsage = (c: ProductCategory) =>
    usageCount(c.name) + c.subs.reduce((n, s) => n + usageCount(s.name), 0);

  const toggle = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const sorted = list.slice().sort((a, b) => a.sort - b.sort);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商品属性分类</h1>
          <p className="text-xs text-muted-foreground">
            管理商品品类标签（外套 / 针织 / 鞋 …），并可为每个子类/细分手动配置默认重量（克），用于商品未填重量时的国际运费兜底核算。
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
        <div className="space-y-3">
          {sorted.map((c, idx) => {
            const open = expanded[c.id] ?? true;
            return (
              <div key={c.id} className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center gap-2 bg-muted/40 px-3 py-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => toggle(c.id)}
                    aria-label="展开/收起"
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="w-8 text-center text-xs text-muted-foreground">
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
                  <Input
                    value={c.icon ?? ""}
                    onChange={(e) => patch(c.id, { icon: e.target.value })}
                    className="h-9 w-14 text-center"
                    aria-label="图标"
                  />
                  <Input
                    value={c.name}
                    onChange={(e) => patch(c.id, { name: e.target.value })}
                    className="h-9 w-32"
                    aria-label="中文名"
                  />
                  <Input
                    value={c.nameKo ?? ""}
                    onChange={(e) => patch(c.id, { nameKo: e.target.value })}
                    className="h-9 w-32"
                    placeholder="韩文名"
                  />
                  <span className="text-xs text-muted-foreground">
                    {c.subs.length} 个子类 · {totalUsage(c)} 件商品
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => patch(c.id, { enabled: !c.enabled })}
                    >
                      {c.enabled ? (
                        <Badge>启用</Badge>
                      ) : (
                        <Badge variant="secondary">停用</Badge>
                      )}
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {open && (
                  <div className="px-3 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        二级分类（买手端会自动在前面补一个「全部」标签）
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addSub(c.id)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />新增子类
                      </Button>
                    </div>
                    {c.subs.length === 0 ? (
                      <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                        暂无子类，点击右上角「新增子类」添加
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {c.subs.map((s, si) => (
                          <div
                            key={s.id}
                            className="rounded-md border border-border"
                          >
                            <div className="flex flex-wrap items-center gap-2 px-2 py-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              disabled={si === 0}
                              onClick={() => moveSub(c.id, s.id, -1)}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              disabled={si === c.subs.length - 1}
                              onClick={() => moveSub(c.id, s.id, 1)}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              value={s.name}
                              onChange={(e) =>
                                patchSub(c.id, s.id, { name: e.target.value })
                              }
                              className="h-8 w-32"
                            />
                            <Input
                              value={s.nameKo ?? ""}
                              onChange={(e) =>
                                patchSub(c.id, s.id, { nameKo: e.target.value })
                              }
                              className="h-8 w-32"
                              placeholder="韩文名"
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                value={s.defaultWeightGrams ?? ""}
                                onChange={(e) =>
                                  patchSub(c.id, s.id, {
                                    defaultWeightGrams:
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value),
                                  })
                                }
                                className="h-8 w-20"
                                placeholder="重量"
                              />
                              <span className="text-[10px] text-muted-foreground">g</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {usageCount(s.name)} 件 · {(s.leafs ?? []).length} 细分
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  patchSub(c.id, s.id, { enabled: !s.enabled })
                                }
                              >
                                {s.enabled ? (
                                  <Badge className="text-[10px]">启用</Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    停用
                                  </Badge>
                                )}
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => addLeaf(c.id, s.id)}
                              >
                                <Plus className="mr-0.5 h-3 w-3" />细分
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeSub(c.id, s.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            </div>
                            {(s.leafs ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 border-t border-border bg-muted/20 px-2 py-1.5">
                                {(s.leafs ?? []).map((l) => (
                                  <div
                                    key={l.id}
                                    className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1"
                                  >
                                    <Input
                                      value={l.name}
                                      onChange={(e) =>
                                        patchLeaf(c.id, s.id, l.id, {
                                          name: e.target.value,
                                        })
                                      }
                                      className="h-7 w-24 text-xs"
                                    />
                                    <Input
                                      type="number"
                                      min={0}
                                      value={l.defaultWeightGrams ?? ""}
                                      onChange={(e) =>
                                        patchLeaf(c.id, s.id, l.id, {
                                          defaultWeightGrams:
                                            e.target.value === ""
                                              ? undefined
                                              : Number(e.target.value),
                                        })
                                      }
                                      className="h-7 w-16 text-xs"
                                      placeholder="g"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        patchLeaf(c.id, s.id, l.id, {
                                          enabled: !l.enabled,
                                        })
                                      }
                                      className="text-[10px]"
                                    >
                                      {l.enabled ? (
                                        <Badge className="text-[10px]">启</Badge>
                                      ) : (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          停
                                        </Badge>
                                      )}
                                    </button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        removeLeaf(c.id, s.id, l.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {dirty && (
          <div className="mt-3 text-xs text-primary">
            有未保存修改，点击右上角「保存」生效。
          </div>
        )}
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">说明</div>
        <div>
          · 一级分类会出现在首页「分类九宫格」；二级分类会出现在品类列表页顶部的切换标签。
        </div>
        <div>
          · 中文名会作为商品的 <code className="font-mono">category</code> 字段值，请与商品导入模板保持一致。
        </div>
        <div>· 停用后，买手端将不再展示该分类，历史商品仍保留原分类名。</div>
        <div>· 排序数字越小越靠前，可用箭头快速调整。</div>
      </Card>
    </AdminShell>
  );
}

