import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MALLS } from "@/lib/buildings";
import { SHOPS } from "@/lib/mock-data";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/buildings")({
  head: () => ({ meta: [{ title: "商圈 / 楼栋管理 · 运营后台" }] }),
  component: AdminBuildings,
});

function AdminBuildings() {
  const shopCount = (b: string) => SHOPS.filter((s) => s.building === b).length;

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">商圈 / 楼栋管理</h1>
          <p className="text-xs text-muted-foreground">维护东大门 / 南大门 / 釜山各商场及楼层，档口录入时下拉选择。</p>
        </div>
        <Button size="sm" onClick={() => toast.info("新增楼栋弹窗")}><Plus className="mr-1 h-4 w-4" />新增楼栋</Button>
      </div>

      <div className="space-y-4">
        {MALLS.map((m) => (
          <Card key={m.city} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{m.city}</h2>
              <Badge variant="outline">{m.buildings.length} 栋</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <Th>楼栋</Th><Th>楼层</Th><Th>关联档口数</Th><Th>操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {m.buildings.map((b) => (
                    <tr key={b.name} className="border-t border-border">
                      <Td className="font-medium">{b.name}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {b.floors.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                        </div>
                      </Td>
                      <Td>{shopCount(b.name)}</Td>
                      <Td>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">编辑楼层</Button>
                          <Button size="sm" variant="ghost">停用</Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;