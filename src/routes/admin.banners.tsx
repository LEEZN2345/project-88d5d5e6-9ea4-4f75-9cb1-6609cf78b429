import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_BANNERS,
  getBanners,
  saveBanners,
  type BannerSlot,
} from "@/lib/banners";
import { useEffect, useRef, useState } from "react";
import { Upload, RotateCcw, Image as ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "Banner 管理 · 运营后台" }] }),
  component: AdminBanners,
});

function AdminBanners() {
  const [list, setList] = useState<BannerSlot[]>(DEFAULT_BANNERS);
  useEffect(() => {
    setList(getBanners());
  }, []);

  const update = (id: string, patch: Partial<BannerSlot>) => {
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const persist = () => {
    saveBanners(list);
    toast.success("已保存所有 Banner 配置，前台立即生效");
  };

  const resetAll = () => {
    setList(DEFAULT_BANNERS);
    saveBanners(DEFAULT_BANNERS);
    toast.success("已恢复为默认 Banner");
  };

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Banner 管理</h1>
          <p className="text-xs text-muted-foreground">
            集中管理平台所有横幅位：可上传图片、编辑标题/副标题/跳转链接、开关显示。
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RotateCcw className="mr-1 h-4 w-4" /> 恢复默认
          </Button>
          <Button size="sm" onClick={persist}>
            <Save className="mr-1 h-4 w-4" /> 保存全部
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((b) => (
          <BannerCard key={b.id} banner={b} onChange={(p) => update(b.id, p)} />
        ))}
      </div>
    </AdminShell>
  );
}

function BannerCard({
  banner,
  onChange,
}: {
  banner: BannerSlot;
  onChange: (patch: Partial<BannerSlot>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      toast.error("图片过大，请压缩至 3MB 以内");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ image: String(reader.result || "") });
      toast.success("图片已更新，记得点右上角『保存全部』");
    };
    reader.readAsDataURL(f);
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{banner.name}</div>
            <Badge variant="outline" className="text-[10px]">
              {banner.id}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{banner.description}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          启用
          <Switch
            checked={banner.enabled}
            onCheckedChange={(v) => onChange({ enabled: v })}
          />
        </label>
      </div>

      <div className="mb-3 aspect-[5/2] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted">
        {banner.image ? (
          <img src={banner.image} alt={banner.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            <ImageIcon className="mr-1 h-4 w-4" /> 暂无图片
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <div>
          <Label className="text-xs">图片</Label>
          <div className="mt-1 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 h-4 w-4" /> 上传图片
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.currentTarget.value = "";
              }}
            />
            {banner.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ image: "" })}
              >
                清除
              </Button>
            )}
          </div>
          <Textarea
            className="mt-2 h-16 text-xs"
            placeholder="或直接粘贴图片 URL"
            value={banner.image}
            onChange={(e) => onChange({ image: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">主标题</Label>
            <Input
              className="mt-1"
              value={banner.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">副标题</Label>
            <Input
              className="mt-1"
              value={banner.subtitle || ""}
              onChange={(e) => onChange({ subtitle: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">跳转链接（可选）</Label>
          <Input
            className="mt-1"
            placeholder="/shops 或 https://..."
            value={banner.link || ""}
            onChange={(e) => onChange({ link: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
}