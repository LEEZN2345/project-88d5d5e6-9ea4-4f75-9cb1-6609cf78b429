import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, MobileHeader } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, Pencil, Star } from "lucide-react";

export const Route = createFileRoute("/addresses")({
  head: () => ({ meta: [{ title: "收货地址 · 东大门订货通" }] }),
  component: Addresses,
});

const ADDR = [
  {
    id: "1",
    name: "张老板",
    phone: "138****6621",
    region: "广东省 广州市 白云区",
    detail: "沙河服装批发市场 B 栋 318 档",
    tag: "档口",
    default: true,
  },
  {
    id: "2",
    name: "张老板",
    phone: "138****6621",
    region: "浙江省 杭州市 拱墅区",
    detail: "四季青服饰城 7 楼 A7-12",
    tag: "档口",
    default: false,
  },
  {
    id: "3",
    name: "张太太",
    phone: "139****8843",
    region: "广东省 广州市 越秀区",
    detail: "环市东路 318 号 1502",
    tag: "家",
    default: false,
  },
];

function Addresses() {
  return (
    <MobileShell>
      <MobileHeader title="收货地址" back />
      <div className="space-y-3 px-4 pt-3">
        {ADDR.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground">{a.phone}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{a.tag}</span>
                  {a.default && (
                    <span className="flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      <Star className="h-2.5 w-2.5" /> 默认
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {a.region} {a.detail}
                </div>
              </div>
              <button className="text-muted-foreground">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
      <div className="fixed bottom-16 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button className="w-full">
          <Plus className="mr-1 h-4 w-4" />
          新增收货地址
        </Button>
      </div>
    </MobileShell>
  );
}