import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "用户与 KYC · 运营后台" }] }),
  component: AdminUsers,
});

type Role = "buyer" | "b_store" | "c_user";
type KycStatus = "none" | "pending" | "approved" | "rejected";
type Row = {
  id: string;
  nick: string;
  phone: string;
  role: Role;
  level?: "黄金" | "白银";
  kyc: KycStatus;
  points: number;
  invitedValid: number; // 有效邀请
  status: "active" | "frozen";
};

const ROLE_LABEL: Record<Role, string> = { buyer: "买手", b_store: "实体店(B)", c_user: "散客(C)" };
const KYC_LABEL: Record<KycStatus, { label: string; v: "default" | "secondary" | "outline" | "destructive" }> = {
  none: { label: "未提交", v: "outline" },
  pending: { label: "待审核", v: "destructive" },
  approved: { label: "已通过", v: "default" },
  rejected: { label: "已驳回", v: "secondary" },
};

const MOCK: Row[] = [
  { id: "U1001", nick: "小李", phone: "138****2311", role: "c_user", level: "白银", kyc: "approved", points: 3240, invitedValid: 6, status: "active" },
  { id: "U1002", nick: "韩姐女装-王姐", phone: "139****8877", role: "b_store", kyc: "pending", points: 0, invitedValid: 3, status: "active" },
  { id: "U1003", nick: "Molly档口", phone: "136****1122", role: "b_store", kyc: "approved", points: 0, invitedValid: 8, status: "active" },
  { id: "U1004", nick: "刷单可疑账号", phone: "170****0001", role: "c_user", kyc: "none", points: 12000, invitedValid: 0, status: "frozen" },
  { id: "U1005", nick: "买手-Nana", phone: "158****3333", role: "buyer", level: "黄金", kyc: "approved", points: 890, invitedValid: 0, status: "active" },
];

function AdminUsers() {
  const pendingKyc = MOCK.filter((u) => u.kyc === "pending").length;
  const frozen = MOCK.filter((u) => u.status === "frozen").length;

  return (
    <AdminShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">用户 / KYC</h1>
        <p className="text-xs text-muted-foreground">三类用户统一管理 · 实体店营业执照 / 散客实名 / 会员等级 / 风控冻结。</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="用户总数" value={String(MOCK.length)} />
        <Stat label="待审核 KYC" value={String(pendingKyc)} />
        <Stat label="已冻结" value={String(frozen)} />
        <Stat label="散客占比" value={`${Math.round(MOCK.filter((u) => u.role === "c_user").length / MOCK.length * 100)}%`} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="搜索昵称 / 手机号 / 用户 ID" className="max-w-xs" />
          <Button size="sm" variant="outline">所有角色</Button>
          <Button size="sm" variant="outline">所有 KYC 状态</Button>
          <Button size="sm" variant="outline">仅冻结</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>ID</Th><Th>昵称</Th><Th>手机</Th><Th>角色</Th><Th>等级</Th><Th>KYC</Th><Th>积分</Th><Th>有效邀请</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {MOCK.map((u) => {
                const k = KYC_LABEL[u.kyc];
                return (
                  <tr key={u.id} className="border-t border-border">
                    <Td className="font-mono text-xs">{u.id}</Td>
                    <Td>{u.nick}</Td>
                    <Td className="text-xs">{u.phone}</Td>
                    <Td className="text-xs"><Badge variant="outline">{ROLE_LABEL[u.role]}</Badge></Td>
                    <Td className="text-xs">{u.level ?? "—"}</Td>
                    <Td><Badge variant={k.v}>{k.label}</Badge></Td>
                    <Td>{u.points.toLocaleString()}</Td>
                    <Td>{u.invitedValid}</Td>
                    <Td><Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status === "active" ? "正常" : "冻结"}</Badge></Td>
                    <Td>
                      <div className="flex gap-1">
                        {u.kyc === "pending" && <Button size="sm">审核</Button>}
                        <Button size="sm" variant="outline">详情</Button>
                        <Button size="sm" variant="ghost">{u.status === "active" ? "冻结" : "解冻"}</Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">审核字段</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>实体店（B）：营业执照照片 + 档口位置 + 主营品类 + 合作起始日</li>
          <li>散客（C）：身份证正反面 + 手机号验证 + 设备/地址/支付账号唯一性</li>
          <li>驳回需填写原因，会推送到用户端「我的 → KYC」查看</li>
        </ul>
      </Card>
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