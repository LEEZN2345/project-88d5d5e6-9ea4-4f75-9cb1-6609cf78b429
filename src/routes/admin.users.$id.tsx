import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ORDERS, STATUS_LABEL, formatCNY } from "@/lib/mock-data";
import { ArrowLeft, Ban, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id")({
  head: () => ({ meta: [{ title: "用户详情 · 运营后台" }] }),
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  const orders = ORDERS.slice(0, 3);

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin/users" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />返回用户列表
        </Link>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("已重置密码链接已发送")}>重置密码</Button>
          <Button size="sm" variant="destructive" onClick={() => toast.warning("已冻结该用户")}><Ban className="mr-1 h-4 w-4" />冻结</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">陈</div>
            <div>
              <div className="text-lg font-semibold">陈** <Badge variant="outline" className="ml-2">买手</Badge></div>
              <div className="text-xs text-muted-foreground">{id} · 138****2211</div>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">会员等级</dt><dd>黄金买手</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">注册时间</dt><dd>2024-03-15</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">最近登录</dt><dd>2026-07-12 09:20</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">积分余额</dt><dd>3,240</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">邀请有效数</dt><dd>6</dd></div>
          </dl>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">KYC 认证</div>
              <Badge><ShieldCheck className="mr-1 h-3 w-3" />已通过</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground">姓名</span><div>陈**</div></div>
              <div><span className="text-xs text-muted-foreground">身份证号</span><div>330****199205*****</div></div>
              <div><span className="text-xs text-muted-foreground">审核时间</span><div>2024-03-16 10:22</div></div>
              <div><span className="text-xs text-muted-foreground">审核人</span><div>客服-小南</div></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">最近订单</div>
            <div className="divide-y divide-border">
              {orders.map((o) => (
                <Link key={o.id} to="/admin/orders/$id" params={{ id: o.id }} className="flex items-center justify-between py-2 text-sm hover:bg-accent/50">
                  <div>
                    <div className="font-mono text-xs">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{o.createdAt}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{STATUS_LABEL[o.status]}</Badge>
                    <div className="mt-1 text-xs">{o.totalCNY ? formatCNY(o.totalCNY) : "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">运营备注</div>
            <Textarea placeholder="内部备注（其他运营可见）…" className="min-h-20" />
            <div className="mt-2 text-right"><Button size="sm" onClick={() => toast.success("已保存")}>保存</Button></div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}