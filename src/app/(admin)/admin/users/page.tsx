"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isPending } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100');
      const data = res.data.data;
      return data?.users || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch('/admin/users/role', { userId: id, role });
      return res.data;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user role");
    }
  });

  if (isPending) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-9 w-56" />
        <div className="rounded-md border bg-card mt-4 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const allUsers = Array.isArray(users) ? users : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              allUsers.map((user: any) => {
                const name = user.profile?.firstName
                  ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
                  : 'No Profile';
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      {user.role === 'ADMIN' ? (
                        <span className="text-sm font-semibold text-primary">ADMIN</span>
                      ) : (
                        <Select 
                          value={user.role} 
                          onValueChange={(val) => {
                            if (val) updateMutation.mutate({ id: user.id, role: val });
                          }}
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PATIENT">PATIENT</SelectItem>
                            <SelectItem value="DRIVER">DRIVER</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
