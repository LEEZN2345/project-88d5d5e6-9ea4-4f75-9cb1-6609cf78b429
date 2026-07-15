import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GripVertical, ArrowUp, ArrowDown, Trash2, Plus, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/home-decoration")({
  head: () => ({ meta: [{ title: "首页装修 · 运营后台" }] }),
  component: HomeDecoration,
});

type SectionType = "carousel" | "iconGrid" | "hotShops" | "newArrivals" | "categoryNav" | "customImage" | "notice";

const TYPE_LABEL: Record<SectionType, string> = {
  carousel: "顶部轮播",
  iconGrid: "图标金刚区",
  hotShops: "优选档口横排",
  newArrivals: "新品瀑布流",
  categoryNav: "分类导航",
  customImage: "自定义图文",
  notice: "富文本公告",
};

type Section = {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  link?: string;
  validUntil?: string;
};

const INITIAL: Section[] = [
  { id: "s1", type: "carousel", title: "顶部主视觉", enabled: true, link: "/shops", validUntil: "2026-12-31" },
  { id: "s2", type: "iconGrid", title: "五宫格入口", enabled: true },
  { id: "s3", type: "hotShops", title: "热门档口", enabled: true, link: "/hot-shops" },
  { id: "s4", type: "newArrivals", title: "今日上新", enabled: true, link: "/new-arrivals" },
  { id: "s5", type: "categoryNav", title: "分类导航", enabled: true },
  { id: "s6", type: "notice", title: "顶部公告条", enabled: false },
];

function HomeDecoration() {
  const [sections, setSections] = useState<Section[]>(INITIAL);
  const [editing, setEditing] = useState<Section | null>(null);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };

  const toggle = (id: string, v: boolean) =>
    setSections((p) => p.map((s) => (s.id === id ? { ...s, enabled: v } : s)));

  const del = (id: string) => setSections((p) => p.filter((s) => s.id !== id));

  const addNew = (type: SectionType) => {
    setSections((p) => [
      ...p,
      { id: `s${Date.now()}`, type, title: TYPE_LABEL[type], enabled: true },
    ]);
  };

  const saveEdit = () => {
    if (!editing) return;
    setSections((p) => p.map((s) => (s.id === editing.id ? editing : s)));
    setEditing(null);
    toast.success("已保存");
  };

  const publish = () => toast.success(`已发布 ${sections.filter((s) => s.enabled).length} 个模块到首页`);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">DIY 首页装修</h1>
          <p className="text-xs text-muted-foreground">组件化排序、上下架、有效期，右侧实时预览手机端。</p>
        </div>
        <Button onClick={publish}>发布到首页</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">新增组件</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABEL) as SectionType[]).map((t) => (
                <Button key={t} size="sm" variant="outline" onClick={() => addNew(t)}>
                  <Plus className="mr-1 h-3 w-3" />{TYPE_LABEL[t]}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-sm font-semibold">组件列表（拖拽/上下箭头排序）</div>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{TYPE_LABEL[s.type]}</Badge>
                      <span className="text-sm font-medium">{s.title}</span>
                      {s.validUntil && <span className="text-xs text-muted-foreground">至 {s.validUntil}</span>}
                    </div>
                    {s.link && <div className="mt-0.5 truncate text-xs text-muted-foreground">→ {s.link}</div>}
                  </div>
                  <Switch checked={s.enabled} onCheckedChange={(v) => toggle(s.id, v)} />
                  <Button size="icon" variant="ghost" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(s)}>编辑</Button>
                  <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                </div>
              ))}
            </div>
          </Card>

          {editing && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">编辑：{TYPE_LABEL[editing.type]}</div>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>关闭</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">标题</div>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">跳转链接</div>
                  <Input value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="/shops 或 https://…" />
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">有效期至</div>
                  <Input type="date" value={editing.validUntil ?? ""} onChange={(e) => setEditing({ ...editing, validUntil: e.target.value })} />
                </div>
              </div>
              <div className="mt-3 text-right">
                <Button size="sm" onClick={saveEdit}>保存</Button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card className="p-3">
            <div className="mb-2 flex items-center gap-1 text-xs font-semibold"><Eye className="h-3 w-3" />手机预览</div>
            <div className="mx-auto w-[300px] overflow-hidden rounded-2xl border-4 border-border bg-background">
              <div className="h-6 bg-muted" />
              <div className="space-y-2 p-2">
                {sections.filter((s) => s.enabled).map((s) => (
                  <div key={s.id} className="rounded-md bg-muted/50 p-2 text-[10px]">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-muted-foreground">[{TYPE_LABEL[s.type]}]</div>
                    {s.type === "carousel" && <div className="mt-1 h-16 rounded bg-gradient-to-br from-primary/40 to-primary/10" />}
                    {s.type === "iconGrid" && (
                      <div className="mt-1 grid grid-cols-5 gap-1">
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-square rounded bg-background" />)}
                      </div>
                    )}
                    {s.type === "hotShops" && (
                      <div className="mt-1 flex gap-1 overflow-hidden">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 w-16 rounded bg-background" />)}
                      </div>
                    )}
                    {s.type === "newArrivals" && (
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square rounded bg-background" />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}