import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/admin/logistics")({
  head: () => ({ meta: [{ title: "物流批量上传 · 运营后台" }] }),
  component: AdminLogistics,
});

const TEMPLATE_FIELDS = [
  { name: "订单号", required: true, example: "DD20251128001" },
  { name: "运单号", required: true, example: "DDKR202511280001" },
  { name: "物流商", required: true, example: "通关社A" },
  { name: "当前节点", required: true, example: "起运" },
  { name: "节点时间", required: true, example: "2025-11-28 22:00" },
  { name: "备注", required: false, example: "航班 KE5523" },
];

const NODE_ENUM = ["韩国仓入库", "打包出库", "起运", "到港清关", "国内派送", "已签收"];

function AdminLogistics() {
  return (
    <AdminShell>
      <h1 className="mb-1 text-xl font-semibold">物流批量上传</h1>
      <p className="mb-4 text-xs text-muted-foreground">通关社回单导出后,按模板上传 Excel,系统解析为物流时间线,异常行打包错误报告下载。</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">拖拽 Excel 文件到此处</div>
            <div className="mt-1 text-xs text-muted-foreground">支持 .xlsx / .xls,单次最多 5000 行</div>
            <Button className="mt-4" size="sm">选择文件</Button>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">需要模板?</span>
            <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />下载模板 v1</Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileSpreadsheet className="h-4 w-4" /> 模板 v1 字段
          </div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr><th className="py-1 text-left">字段</th><th className="py-1 text-left">必填</th><th className="py-1 text-left">示例</th></tr>
            </thead>
            <tbody>
              {TEMPLATE_FIELDS.map((f) => (
                <tr key={f.name} className="border-t border-border">
                  <td className="py-1 font-medium">{f.name}</td>
                  <td className="py-1">{f.required ? "是" : "否"}</td>
                  <td className="py-1 font-mono text-muted-foreground">{f.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-[11px] text-muted-foreground">
            「当前节点」枚举值:{NODE_ENUM.join(" / ")}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <div className="text-sm font-semibold">近期上传记录</div>
        <table className="mt-2 w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="py-1 text-left">文件名</th><th className="py-1 text-left">上传时间</th><th className="py-1 text-left">总行数</th><th className="py-1 text-left">成功</th><th className="py-1 text-left">异常</th><th className="py-1 text-left">操作</th></tr>
          </thead>
          <tbody>
            {[
              { f: "logistics_1128.xlsx", t: "2025-11-28 19:42", total: 412, ok: 408, err: 4 },
              { f: "logistics_1127.xlsx", t: "2025-11-27 18:30", total: 356, ok: 356, err: 0 },
            ].map((r) => (
              <tr key={r.f} className="border-t border-border">
                <td className="py-1">{r.f}</td><td className="py-1">{r.t}</td><td className="py-1">{r.total}</td>
                <td className="py-1 text-emerald-600">{r.ok}</td>
                <td className="py-1 text-rose-500">{r.err}</td>
                <td className="py-1">{r.err > 0 ? <Button size="sm" variant="outline">下载异常报告</Button> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}