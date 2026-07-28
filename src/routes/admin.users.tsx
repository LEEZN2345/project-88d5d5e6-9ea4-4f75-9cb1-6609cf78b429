import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "用户管理 · 运营后台" }] }),
  component: AdminUsers,
});

type Row = {
  id: string;
  nick: string;
  phone: string;
  level?: "黄金会员" | "钻石会员";
  points: number;
  invitedValid: number; // 有效邀请
  status: "active" | "frozen";
  orderBan?: { reason: string; at: string; by: string } | null;
};

const MOCK: Row[] = [
  { id: "U1001", nick: "小李", phone: "138****2311", level: "钻石会员", points: 3240, invitedValid: 6, status: "active" },
  { id: "U1002", nick: "韩姐女装-王姐", phone: "139****8877", points: 0, invitedValid: 3, status: "active" },
  { id: "U1003", nick: "Molly档口", phone: "136****1122", points: 0, invitedValid: 8, status: "active" },
  { id: "U1004", nick: "刷单可疑账号", phone: "170****0001", points: 12000, invitedValid: 0, status: "frozen", orderBan: { reason: "刷单风控", at: "2026-07-15 10:22", by: "admin" } },
  { id: "U1005", nick: "Nana", phone: "158****3333", level: "黄金会员", points: 890, invitedValid: 0, status: "active" },
];

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [banTarget, setBanTarget] = useState<Row | null>(null);
  const [banReason, setBanReason] = useState("");
  const frozen = rows.filter((u) => u.status === "frozen").length;
  const banned = rows.filter((u) => u.orderBan).length;

  const applyBan = () => {
    if (!banTarget) return;
    if (!banReason.trim()) {
      toast.error("请填写禁止下单原因");
      return;
    }
    setRows((prev) =>
      prev.map((u) =>
        u.id === banTarget.id
          ? { ...u, orderBan: { reason: banReason.trim(), at: new Date().toISOString().slice(0, 16).replace("T", " "), by: "admin" } }
          : u,
      ),
    );
    toast.success(`已禁止 ${banTarget.nick} 下单`);
    setBanTarget(null);
    setBanReason("");
  };

  const liftBan = (u: Row) => {
    setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, orderBan: null } : r)));
    toast.success(`已恢复 ${u.nick} 下单权限`);
  };

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <p className="text-xs text-muted-foreground">C 端买家统一管理 · 会员类型 / 积分 / 邀请 / 风控冻结。</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="用户总数" value={String(rows.length)} />
        <Stat label="已冻结" value={String(frozen)} />
        <Stat label="禁止下单" value={String(banned)} />
        <Stat label="黄金会员" value={String(rows.filter((u) => u.level === "黄金会员").length)} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="搜索昵称 / 手机号 / 用户 ID" className="max-w-xs" />
          <Button size="sm" variant="outline">所有等级</Button>
          <Button size="sm" variant="outline">仅冻结</Button>
          <Button size="sm" variant="outline">仅禁购</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>ID</Th><Th>昵称</Th><Th>手机</Th><Th>等级</Th><Th>积分</Th><Th>有效邀请</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                return (
                  <tr key={u.id} className="border-t border-border">
                    <Td className="font-mono text-xs">{u.id}</Td>
                    <Td>{u.nick}</Td>
                    <Td className="text-xs">{u.phone}</Td>
                    <Td className="text-xs">{u.level ?? "—"}</Td>
                    <Td>{u.points.toLocaleString()}</Td>
                    <Td>{u.invitedValid}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status === "active" ? "正常" : "冻结"}</Badge>
                        {u.orderBan && (
                          <Badge variant="destructive" title={`${u.orderBan.reason} · ${u.orderBan.at}`}>禁止下单</Badge>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <Link to="/admin/users/$id" params={{ id: u.id }}>
                          <Button size="sm" variant="outline">详情</Button>
                        </Link>
                        <Button size="sm" variant="ghost">{u.status === "active" ? "冻结" : "解冻"}</Button>
                        {u.orderBan ? (
                          <Button size="sm" variant="ghost" onClick={() => liftBan(u)}>解除禁购</Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { setBanTarget(u); setBanReason(""); }}>禁止下单</Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!banTarget} onOpenChange={(o) => { if (!o) { setBanTarget(null); setBanReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>禁止下单 · {banTarget?.nick}</DialogTitle>
            <DialogDescription>
              禁购后该用户在客户端下单/加入购物车/结算时会被拦截，并展示原因。操作会记录到风控流水。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">禁购原因 <span className="text-destructive">*</span></label>
            <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="如：刷单、恶意下单不付款、多次拒收、账号异常等" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>取消</Button>
            <Button variant="destructive" onClick={applyBan}>确认禁止下单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left font-medium">{children}</th>;
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;