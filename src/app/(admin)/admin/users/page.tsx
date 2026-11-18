"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
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
import { Eye, ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { UserRecord } from "@/types";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const { data: users, isPending } = useQuery<UserRecord[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/users?limit=100&includeDisabled=true");
      return res.data.data?.users || [];
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch("/admin/users/role", { userId: id, role });
      return res.data;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update role");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await api.patch(`/users/${id}/status`, { active });
      return res.data;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.active ? "User restored" : "User disabled");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update account status"
      );
    },
  });

  const rows = useMemo(() => {
    const all = Array.isArray(users) ? users : [];
    if (roleFilter === "ALL") return all;
    return all.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const rowKey = useCallback((u: UserRecord) => u.id, []);
  const searchAccessor = useCallback(
    (u: UserRecord) =>
      `${u.email} ${u.profile?.firstName || ""} ${u.profile?.lastName || ""} ${u.role}`,
    []
  );

  const handleRoleChange = useCallback(
    (id: string, role: string) => {
      roleMutation.mutate({ id, role });
    },
    [roleMutation]
  );

  const handleStatusToggle = useCallback(
    (id: string, active: boolean) => {
      statusMutation.mutate({ id, active });
    },
    [statusMutation]
  );

  const columns = useMemo<ColumnDef<UserRecord>[]>(
    () => [
      {
        key: "name",
        header: "User",
        sortable: true,
        sortValue: (u) =>
          `${u.profile?.firstName || ""} ${u.profile?.lastName || ""} ${u.email}`.trim(),
        cell: (u) => {
          const fullName =
            [u.profile?.firstName, u.profile?.lastName]
              .filter(Boolean)
              .join(" ") || "No Name Set";
          return (
            <div>
              <p className="font-medium text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        sortValue: (u) => u.role,
        cell: (u) =>
          u.role === "ADMIN" ? (
            <Badge className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              ADMIN
            </Badge>
          ) : (
            <Select
              value={u.role}
              onValueChange={(val) => val && handleRoleChange(u.id, val)}
              disabled={roleMutation.isPending || Boolean(u.deletedAt)}
            >
              <SelectTrigger className="w-[125px] h-8 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">PATIENT</SelectItem>
                <SelectItem value="DRIVER">DRIVER</SelectItem>
              </SelectContent>
            </Select>
          ),
      },
      {
        key: "activity",
        header: "Activity",
        cell: (u) => (
          <span className="text-xs text-muted-foreground">
            {u.role === "DRIVER"
              ? `${u._count?.dispatches ?? 0} dispatches • ${u._count?.ambulances ?? 0} units`
              : `${u._count?.requests ?? 0} requests`}
          </span>
        ),
      },
      {
        key: "status",
        header: "Account Status",
        sortable: true,
        sortValue: (u) => (u.deletedAt ? "DISABLED" : "ACTIVE"),
        cell: (u) =>
          u.deletedAt ? (
            <Badge variant="destructive">Disabled</Badge>
          ) : (
            <Badge className="bg-emerald-600 text-white border-transparent">
              Active
            </Badge>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (u) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedUser(u)}
              aria-label={`View ${u.email}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {u.role !== "ADMIN" && (
              <Button
                variant="ghost"
                size="icon-sm"
                className={
                  u.deletedAt ? "text-brand-emerald" : "text-destructive"
                }
                disabled={statusMutation.isPending}
                onClick={() => handleStatusToggle(u.id, Boolean(u.deletedAt))}
                aria-label={u.deletedAt ? "Restore user" : "Disable user"}
              >
                {u.deletedAt ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [
      handleRoleChange,
      handleStatusToggle,
      roleMutation.isPending,
      statusMutation.isPending,
    ]
  );

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Manage Users
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect registered patients and drivers, promote fleet roles, and
          govern account status.
        </p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        isLoading={isPending}
        searchPlaceholder="Search by name or email (debounced)..."
        searchAccessor={searchAccessor}
        profilerId="AdminUsersDataTable"
        filterSlot={
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v || "ALL")}
          >
            <SelectTrigger className="w-[150px] h-10 rounded-xl">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="PATIENT">Patients</SelectItem>
              <SelectItem value="DRIVER">Drivers</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(o) => !o && setSelectedUser(null)}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>User Account Details</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <dl className="divide-y divide-border text-sm pt-2">
              <div className="py-2.5 flex justify-between">
                <dt className="text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">
                  {[
                    selectedUser.profile?.firstName,
                    selectedUser.profile?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Not provided"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium text-foreground">
                  {selectedUser.role}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">
                  {selectedUser.profile?.phone || "Not provided"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-medium text-foreground text-right max-w-[200px]">
                  {selectedUser.profile?.address || "Not provided"}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium text-foreground">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
