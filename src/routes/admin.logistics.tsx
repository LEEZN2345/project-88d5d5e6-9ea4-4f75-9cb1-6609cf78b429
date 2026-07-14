import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertTriangle, Search } from "lucide-react";
import { ORDERS, SHIPMENT_EVENTS } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logistics")({
  head: () => ({ meta: [{ title: "物流管理 · 运营后台" }] }),
  component: AdminLogistics,
});

type Row = {
  logisticsNo: string;
  orderId: string;
  carrier: string;
  lastNode: string;
  updatedAt: string;
  exception?: string;
};

const ROWS: Row[] = ORDERS.filter((o) => o.logisticsNo).map((o) => {
  const evs = SHIPMENT_EVENTS[o.logisticsNo!] ?? [];
  const last = evs[evs.length - 1];
  return {
    logisticsNo: o.logisticsNo!,
    orderId: o.id,
    carrier: "顺丰国际",
    lastNode: last?.node ?? "待入库",
    updatedAt: last?.time ?? o.createdAt,
  };
});
ROWS.push({
  logisticsNo: "DDKR202511250099",
  orderId: "DD20251125099",
  carrier: "EMS",
  lastNode: "到港清关",
  updatedAt: "2025-11-29 09:20",
  exception: "海关抽检 · 需补关税",
});

function AdminLogistics() {
  const exception = ROWS.filter((r) => r.exception).length;
  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">物流管理</h1>
          <p className="text-xs text-muted-foreground">批量导入韩国仓 / 顺丰国际单号，异常件优先处理。</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("下载模板")}> <FileSpreadsheet className="mr-1 h-4 w-4" />下载模板</Button>
          <Button size="sm" onClick={() => toast.success("已上传 3 条运单")}> <Upload className="mr-1 h-4 w-4" />Excel 批量导入</Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="运单总数" value={String(ROWS.length)} />
        <Stat label="在途" value={String(ROWS.filter((r) => r.lastNode === "起运" || r.lastNode === "打包出库").length)} />
        <Stat label="清关" value={String(ROWS.filter((r) => r.lastNode === "到港清关").length)} />
        <Stat label="异常件" value={String(exception)} accent={exception > 0} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索运单号 / 订单号" className="w-64 pl-7" />
          </div>
          <Button size="sm" variant="outline">全部</Button>
          <Button size="sm" variant="outline">在途</Button>
          <Button size="sm" variant="outline">已签收</Button>
          <Button size="sm" variant="destructive">仅异常</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>运单号</Th><Th>关联订单</Th><Th>承运</Th><Th>最新节点</Th><Th>更新时间</Th><Th>异常</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.logisticsNo} className="border-t border-border">
                  <Td className="font-mono text-xs">{r.logisticsNo}</Td>
                  <Td className="font-mono text-xs">{r.orderId}</Td>
                  <Td className="text-xs">{r.carrier}</Td>
                  <Td><Badge variant="outline">{r.lastNode}</Badge></Td>
                  <Td className="text-xs">{r.updatedAt}</Td>
                  <Td className="text-xs">
                    {r.exception ? (
                      <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="h-3 w-3" />{r.exception}</span>
                    ) : "—"}
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">追踪</Button>
                      {r.exception && <Button size="sm">处理</Button>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">导入说明</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Excel 表头固定：运单号 / 关联订单号 / 节点 / 时间 / 备注</li>
          <li>系统按运单号匹配已存在订单；未匹配的将进入「待挂单」队列</li>
          <li>异常件会同步推送到「订单反馈管理」，供客服跟进</li>
        </ul>
      </Card>
    </AdminShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-rose-500" : ""}`}>{value}</div>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;