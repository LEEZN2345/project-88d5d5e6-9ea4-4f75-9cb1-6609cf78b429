import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getBanners, DEFAULT_BANNERS } from "@/lib/banners";
import { ArrowLeft, Upload, Image as ImageIcon, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners/$id")({
  head: () => ({ meta: [{ title: "编辑 Banner · 运营后台" }] }),
  component: BannerEdit,
});

function BannerEdit() {
  const { id } = Route.useParams();
  const [banner, setBanner] = useState(() => DEFAULT_BANNERS.find((b) => b.id === id) ?? DEFAULT_BANNERS[0]);

  useEffect(() => {
    const b = getBanners().find((x) => x.id === id);
    if (b) setBanner(b);
  }, [id]);

  if (!banner) return null;

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/banners" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回 Banner 列表
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={() => toast.warning("已删除")}><Trash2 className="mr-1 h-4 w-4" />删除</Button>
          <Button size="sm" onClick={() => toast.success("已保存")}><Save className="mr-1 h-4 w-4" />保存</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-semibold">{banner.name}</h1>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{banner.id}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">启用状态</div>
              <p className="text-xs text-muted-foreground">关闭后前端立即隐藏该位</p>
            </div>
            <Switch defaultChecked={banner.enabled} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">主标题</Label>
              <Input defaultValue={banner.title ?? ""} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">副标题</Label>
              <Input defaultValue={banner.subtitle ?? ""} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">跳转链接</Label>
            <Input defaultValue={banner.link ?? ""} className="mt-1" placeholder="/shops 或 https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">上线时间</Label>
              <Input type="datetime-local" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">下线时间</Label>
              <Input type="datetime-local" className="mt-1" />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <Label className="text-xs">主图</Label>
          <div className="aspect-[5/2] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted">
            {banner.image ? (
              <img src={banner.image} className="h-full w-full object-cover" alt={banner.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                <ImageIcon className="mr-1 h-4 w-4" />暂无图片
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />替换图片</Button>
          </div>
          <Textarea defaultValue={banner.image} className="h-16 text-xs" placeholder="或粘贴图片 URL" />
        </Card>
      </div>
    </AdminShell>
  );
}