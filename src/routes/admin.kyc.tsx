import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/kyc")({
  head: () => ({ meta: [{ title: "KYC 审核 · 运营后台" }] }),
  component: AdminKyc,
});

type KycStatus = "pending" | "approved" | "rejected";
type Row = {
  id: string;
  user: string;
  phone: string;
  type: "实体店" | "散客" | "买手";
  submittedAt: string;
  status: KycStatus;
  materials: string[];
  rejectReason?: string;
};

const MOCK: Row[] = [
  { id: "K001", user: "韩姐女装-王姐", phone: "139****8877", type: "实体店", submittedAt: "2026-07-12 09:20", status: "pending", materials: ["营业执照", "档口照片", "身份证"] },
  { id: "K002", user: "买手-Nana", phone: "158****3333", type: "买手", submittedAt: "2026-07-11 15:40", status: "pending", materials: ["身份证正反", "手持照"] },
  { id: "K003", user: "小李", phone: "138****2311", type: "散客", submittedAt: "2026-07-08 10:22", status: "approved", materials: ["身份证正反"] },
  { id: "K004", user: "刷单可疑账号", phone: "170****0001", type: "散客", submittedAt: "2026-07-06 22:10", status: "rejected", materials: ["身份证正反"], rejectReason: "同设备重复注册 · 疑似刷单" },
];

function AdminKyc() {
  const [tab, setTab] = useState<KycStatus>("pending");
  const [selected, setSelected] = useState<Row | null>(null);
  const list = MOCK.filter((r) => r.status === tab);

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">KYC 审核</h1>
        <p className="text-xs text-muted-foreground">分实体店 / 散客 / 买手三类，材料驳回需填写原因，用户端可见。</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as KycStatus)}>
        <TabsList>
          <TabsTrigger value="pending">待审 ({MOCK.filter((r) => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">已通过 ({MOCK.filter((r) => r.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">已驳回 ({MOCK.filter((r) => r.status === "rejected").length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-3">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-0 lg:col-span-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <Th>工单号</Th><Th>用户</Th><Th>类型</Th><Th>提交时间</Th><Th>状态</Th><Th>操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id} className={`border-t border-border ${selected?.id === r.id ? "bg-accent/50" : ""}`}>
                      <Td className="font-mono text-xs">{r.id}</Td>
                      <Td>{r.user}<div className="text-[10px] text-muted-foreground">{r.phone}</div></Td>
                      <Td><Badge variant="outline">{r.type}</Badge></Td>
                      <Td className="text-xs">{r.submittedAt}</Td>
                      <Td>
                        {r.status === "pending" && <Badge variant="destructive">待审</Badge>}
                        {r.status === "approved" && <Badge>已通过</Badge>}
                        {r.status === "rejected" && <Badge variant="secondary">已驳回</Badge>}
                      </Td>
                      <Td><Button size="sm" variant="outline" onClick={() => setSelected(r)}><Eye className="mr-1 h-3 w-3" />查看</Button></Td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="p-4">
              {!selected ? (
                <div className="text-xs text-muted-foreground">点击左侧「查看」进行审核</div>
              ) : (
                <div>
                  <div className="mb-2 text-sm font-semibold">审核 {selected.id}</div>
                  <dl className="mb-3 space-y-1 text-sm">
                    <div><dt className="text-xs text-muted-foreground">用户</dt><dd>{selected.user} · {selected.phone}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">类型</dt><dd>{selected.type}</dd></div>
                  </dl>
                  <div className="mb-3">
                    <div className="mb-1 text-xs text-muted-foreground">材料</div>
                    <div className="grid grid-cols-3 gap-1">
                      {selected.materials.map((m, i) => (
                        <div key={i} className="aspect-square rounded border border-border bg-muted text-center text-[10px] text-muted-foreground">
                          <div className="flex h-full items-center justify-center px-1">{m}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selected.status === "pending" ? (
                    <>
                      <Textarea placeholder="驳回原因（若通过可留空）…" className="mb-2 min-h-16 text-xs" />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => { toast.success("已通过"); setSelected(null); }}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />通过
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => { toast.warning("已驳回"); setSelected(null); }}>
                          <XCircle className="mr-1 h-4 w-4" />驳回
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      {selected.status === "rejected" && selected.rejectReason && <>驳回原因：{selected.rejectReason}</>}
                      {selected.status === "approved" && "审核已通过。"}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;