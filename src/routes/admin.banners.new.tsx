import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Image as ImageIcon, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners/new")({
  head: () => ({ meta: [{ title: "新建 Banner · 运营后台" }] }),
  component: BannerNew,
});

function BannerNew() {
  const navigate = useNavigate();
  const [image, setImage] = useState("");

  const save = () => {
    toast.success("Banner 已创建");
    navigate({ to: "/admin/banners" });
  };

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/banners" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回 Banner 列表
        </Link>
        <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" />保存</Button>
      </div>

      <h1 className="mb-4 text-xl font-semibold">新建 Banner</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-4">
          <div>
            <Label className="text-xs">位置</Label>
            <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option>首页顶部轮播</option>
              <option>档口页顶部</option>
              <option>个人中心横幅</option>
              <option>购物车推荐位</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">主标题</Label>
              <Input className="mt-1" placeholder="例：夏季新款上架" />
            </div>
            <div>
              <Label className="text-xs">副标题</Label>
              <Input className="mt-1" placeholder="例：全场立减 15%" />
            </div>
          </div>
          <div>
            <Label className="text-xs">跳转链接</Label>
            <Input className="mt-1" placeholder="/shops 或 https://..." />
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">排序（数字越小越靠前）</Label>
              <Input type="number" defaultValue={10} className="mt-1" />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch defaultChecked />
              <span className="text-xs text-muted-foreground">立即启用</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <Label className="text-xs">Banner 图片（推荐 5:2）</Label>
          <div className="aspect-[5/2] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted">
            {image ? (
              <img src={image} className="h-full w-full object-cover" alt="" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                <ImageIcon className="mr-1 h-4 w-4" />暂无图片
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />上传图片</Button>
            {image && <Button size="sm" variant="ghost" onClick={() => setImage("")}>清除</Button>}
          </div>
          <Textarea placeholder="或粘贴图片 URL" className="h-16 text-xs" value={image} onChange={(e) => setImage(e.target.value)} />
        </Card>
      </div>
    </AdminShell>
  );
}