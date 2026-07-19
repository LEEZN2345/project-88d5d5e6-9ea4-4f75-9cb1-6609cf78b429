import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ROLE_LABEL, type AdminRole } from "@/lib/auth-role";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "员工与权限 · 运营后台" }] }),
  component: AdminStaff,
});

type Staff = {
  id: string;
  name: string;
  phone: string;
  roles: AdminRole[];
  status: "active" | "disabled";
  createdAt: string;
};

const INITIAL: Staff[] = [
  { id: "S001", name: "王老板", phone: "138****0001", roles: ["super"], status: "active", createdAt: "2025-01-10" },
  { id: "S002", name: "客服-小林", phone: "139****2233", roles: ["orders"], status: "active", createdAt: "2025-03-02" },
  { id: "S003", name: "客服-Nana", phone: "136****7788", roles: ["orders"], status: "active", createdAt: "2025-04-11" },
  { id: "S004", name: "仓库-老张", phone: "150****6611", roles: ["shipping"], status: "active", createdAt: "2025-02-20" },
  { id: "S005", name: "跨境-Amy", phone: "158****9090", roles: ["orders", "shipping"], status: "active", createdAt: "2025-05-06" },
  { id: "S006", name: "临时工-测试号", phone: "170****0000", roles: ["shipping"], status: "disabled", createdAt: "2025-06-01" },
];

const ROLE_OPTIONS: AdminRole[] = ["super", "orders", "shipping"];

function AdminStaff() {
  const [rows, setRows] = useState<Staff[]>(INITIAL);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Staff | null>(null);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !q ||
          r.name.includes(q) ||
          r.phone.includes(q) ||
          r.id.toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  return (
    <AdminShell>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">员工与权限</h1>
          <p className="text-xs text-muted-foreground">
            总管理员在此新增员工、勾选后台角色。同一员工可同时拥有多个角色（如同时管订单与发货）。
          </p>
        </div>
        <Button onClick={() => setEditing({ id: "", name: "", phone: "", roles: [], status: "active", createdAt: "" })}>
          <UserPlus className="mr-1 h-4 w-4" /> 新增员工
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="员工总数" value={String(rows.length)} />
        <Stat label="总管理员" value={String(rows.filter((r) => r.roles.includes("super")).length)} />
        <Stat label="订单管理员" value={String(rows.filter((r) => r.roles.includes("orders")).length)} />
        <Stat label="发货管理员" value={String(rows.filter((r) => r.roles.includes("shipping")).length)} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Input
            placeholder="搜索姓名 / 手机号 / 工号"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>工号</Th><Th>姓名</Th><Th>手机</Th><Th>角色</Th><Th>状态</Th><Th>加入时间</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <Td className="font-mono text-xs">{s.id}</Td>
                  <Td>{s.name}</Td>
                  <Td className="text-xs">{s.phone}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {s.roles.length === 0 && <span className="text-xs text-muted-foreground">未分配</span>}
                      {s.roles.map((r) => (
                        <Badge key={r} variant={r === "super" ? "default" : "outline"}>
                          {ROLE_LABEL[r]}
                        </Badge>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={s.status === "active" ? "default" : "destructive"}>
                      {s.status === "active" ? "在职" : "已停用"}
                    </Badge>
                  </Td>
                  <Td className="text-xs">{s.createdAt || "—"}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(s)}>编辑</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === s.id ? { ...r, status: r.status === "active" ? "disabled" : "active" } : r,
                            ),
                          )
                        }
                      >
                        {s.status === "active" ? "停用" : "启用"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500"
                        onClick={() => {
                          setRows((prev) => prev.filter((r) => r.id !== s.id));
                          toast.success("已删除员工");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">权限说明</div>
        <ul className="list-disc space-y-0.5 pl-5">
          <li><b>总管理员</b>：拥有全部后台菜单，可新增/停用其他员工、分配角色。</li>
          <li><b>订单管理员</b>：新订单+预定、订单反馈、现货、拼单、售后换货。</li>
          <li><b>发货管理员</b>：发货管理、物流单、现货、售后换货。</li>
          <li>同一员工可勾选多个角色，权限取并集。</li>
          <li>本页为静态演示，正式版将接入 Lovable Cloud <code>user_roles</code> 表并做服务端校验。</li>
        </ul>
      </Card>

      <EditDialog
        staff={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          setRows((prev) => {
            const exists = prev.find((r) => r.id === next.id);
            if (exists) return prev.map((r) => (r.id === next.id ? next : r));
            const id = next.id || `S${String(prev.length + 1).padStart(3, "0")}`;
            const createdAt = next.createdAt || new Date().toISOString().slice(0, 10);
            return [...prev, { ...next, id, createdAt }];
          });
          toast.success("已保存");
          setEditing(null);
        }}
      />
    </AdminShell>
  );
}

function EditDialog({
  staff,
  onClose,
  onSave,
}: {
  staff: Staff | null;
  onClose: () => void;
  onSave: (s: Staff) => void;
}) {
  const [draft, setDraft] = useState<Staff | null>(staff);

  // 同步外部选中的员工
  if (staff && (!draft || draft.id !== staff.id)) {
    setDraft(staff);
  }
  if (!staff && draft) setDraft(null);

  if (!draft) return null;
  const isNew = !staff?.id;

  return (
    <Dialog open={!!staff} onOpenChange={(o) => !o && onClose()}>
      <DialogTrigger asChild><span /></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "新增员工" : `编辑 · ${draft.name || draft.id}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="姓名">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="手机号">
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </Field>
          <Field label="角色（可多选）">
            <div className="space-y-2 rounded-md border border-border p-3">
              {ROLE_OPTIONS.map((r) => {
                const checked = draft.roles.includes(r);
                return (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setDraft({
                          ...draft,
                          roles: v ? [...draft.roles, r] : draft.roles.filter((x) => x !== r),
                        })
                      }
                    />
                    <span>{ROLE_LABEL[r]}</span>
                    <span className="text-xs text-muted-foreground">
                      {r === "super" && "所有权限"}
                      {r === "orders" && "新订单+预定 / 反馈 / 现货 / 拼单 / 售后换货"}
                      {r === "shipping" && "发货 / 物流 / 现货 / 售后换货"}
                    </span>
                  </label>
                );
              })}
            </div>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            onClick={() => {
              if (!draft.name || !draft.phone) return toast.error("姓名与手机号必填");
              if (draft.roles.length === 0) return toast.error("至少分配一个角色");
              onSave(draft);
            }}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
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