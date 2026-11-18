"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import type {
  AuditLogItem,
  ContactMessageItem,
  NewsletterSubscriberItem,
} from "@/types";

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [viewingMsg, setViewingMsg] = useState<ContactMessageItem | null>(null);

  const { data: contactData, isPending: contactLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const res = await api.get("/contact?limit=100");
      return res.data.data?.messages || [];
    },
  });

  const { data: logsData, isPending: logsLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const res = await api.get("/admin/audit-logs?limit=100");
      return res.data.data?.logs || [];
    },
  });

  const { data: newsletterData, isPending: newsletterLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const res = await api.get("/newsletter?limit=100");
      return res.data.data?.subscribers || [];
    },
  });

  const updateMsgMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/contact/${id}`, { status });
    },
    onSuccess: () => {
      toast.success("Inquiry status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
    onError: () => toast.error("Failed to update inquiry status"),
  });

  const deleteMsgMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      toast.success("Message removed");
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
    onError: () => toast.error("Failed to delete message"),
  });

  const messageColumns: ColumnDef<ContactMessageItem>[] = [
    {
      key: "sender",
      header: "Sender",
      sortable: true,
      sortValue: (m) => m.name,
      cell: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-muted-foreground">{m.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject & Topic",
      cell: (m) => (
        <div className="max-w-[260px]">
          <p className="text-xs font-semibold text-foreground truncate">{m.subject}</p>
          <Badge variant="secondary" className="text-[10px] mt-1">
            {m.category}
          </Badge>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Received",
      sortable: true,
      sortValue: (m) => new Date(m.createdAt).getTime(),
      cell: (m) => (
        <span className="text-xs text-muted-foreground">
          {new Date(m.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <Select
          value={m.status}
          onValueChange={(v) => v && updateMsgMutation.mutate({ id: m.id, status: v })}
        >
          <SelectTrigger className="w-[115px] h-8 rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">NEW</SelectItem>
            <SelectItem value="READ">READ</SelectItem>
            <SelectItem value="REPLIED">REPLIED</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (m) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewingMsg(m)}
            aria-label="Read message"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => deleteMsgMutation.mutate(m.id)}
            aria-label="Delete message"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const auditColumns: ColumnDef<AuditLogItem>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      sortValue: (l) => l.action,
      cell: (l) => <Badge variant="outline">{l.action}</Badge>,
    },
    {
      key: "entity",
      header: "Entity",
      cell: (l) => (
        <span className="text-xs font-medium">
          {l.entity} {l.entityId ? `#${l.entityId.slice(0, 8)}` : ""}
        </span>
      ),
    },
    {
      key: "user",
      header: "Actor",
      cell: (l) => <span className="text-xs text-muted-foreground">{l.user?.email || "System"}</span>,
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      sortValue: (l) => new Date(l.createdAt).getTime(),
      cell: (l) => (
        <span className="text-xs text-muted-foreground">
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  const subscriberColumns: ColumnDef<NewsletterSubscriberItem>[] = [
    {
      key: "email",
      header: "Subscriber Email",
      sortable: true,
      sortValue: (s) => s.email,
      cell: (s) => <span className="font-medium text-foreground">{s.email}</span>,
    },
    {
      key: "createdAt",
      header: "Subscribed On",
      sortable: true,
      sortValue: (s) => new Date(s.createdAt).getTime(),
      cell: (s) => (
        <span className="text-xs text-muted-foreground">
          {new Date(s.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Reports, Audit Logs & Inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review incoming contact desk inquiries, dispatch audit logs, and newsletter subscribers.
        </p>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="messages">
            Contact Inbox ({(contactData || []).length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            Dispatch Audit Trail ({(logsData || []).length})
          </TabsTrigger>
          <TabsTrigger value="newsletter">
            Newsletter ({(newsletterData || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <DataTable
            data={contactData || []}
            columns={messageColumns}
            rowKey={(m) => m.id}
            isLoading={contactLoading}
            searchPlaceholder="Search inquiries by name, email, or subject..."
            searchAccessor={(m) => `${m.name} ${m.email} ${m.subject} ${m.category}`}
            emptyTitle="No contact inquiries yet"
            emptyDescription="Messages submitted on the public /contact page appear here."
          />
        </TabsContent>

        <TabsContent value="audit">
          <DataTable
            data={logsData || []}
            columns={auditColumns}
            rowKey={(l) => l.id}
            isLoading={logsLoading}
            searchPlaceholder="Filter audit actions or actors..."
            searchAccessor={(l) => `${l.action} ${l.entity} ${l.user?.email || ""}`}
            emptyTitle="No audit entries yet"
            emptyDescription="Ambulance allocations and status updates are logged automatically."
          />
        </TabsContent>

        <TabsContent value="newsletter">
          <DataTable
            data={newsletterData || []}
            columns={subscriberColumns}
            rowKey={(s) => s.id}
            isLoading={newsletterLoading}
            searchPlaceholder="Search subscriber email..."
            searchAccessor={(s) => s.email}
            emptyTitle="No newsletter subscribers yet"
            emptyDescription="Emails submitted on the landing page appear here."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(viewingMsg)} onOpenChange={(o) => !o && setViewingMsg(null)}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{viewingMsg?.subject}</DialogTitle>
            <DialogDescription>
              From {viewingMsg?.name} ({viewingMsg?.email})
              {viewingMsg?.phone ? ` • ${viewingMsg.phone}` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewingMsg && (
            <div className="space-y-4 pt-2 text-sm">
              <Badge variant="secondary">{viewingMsg.category}</Badge>
              <p className="rounded-xl border border-border bg-muted/30 p-4 leading-relaxed whitespace-pre-line text-foreground">
                {viewingMsg.message}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
