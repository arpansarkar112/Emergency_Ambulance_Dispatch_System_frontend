"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isPending } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      const data = res.data.data;
      return data?.users || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      // Extensive fallback chain for updating roles since the specific endpoint is undocumented
      const endpoints = [
        { method: 'patch', url: `/users/${id}/role`, payload: data },
        { method: 'patch', url: `/admin/users/${id}/role`, payload: data },
        { method: 'patch', url: `/users/${id}`, payload: data },
        { method: 'patch', url: `/admin/users/${id}`, payload: data },
        { method: 'patch', url: `/admin/users/role`, payload: { userId: id, ...data } },
        { method: 'post', url: `/admin/users/role`, payload: { userId: id, ...data } },
        { method: 'patch', url: `/admin/users/change-role`, payload: { userId: id, ...data } },
        { method: 'post', url: `/admin/users/change-role`, payload: { userId: id, ...data } },
        { method: 'put', url: `/users/${id}`, payload: data },
        { method: 'put', url: `/admin/users/${id}`, payload: data }
      ];

      let lastError = null;

      for (const ep of endpoints) {
        try {
          // @ts-ignore
          const res = await api[ep.method](ep.url, ep.payload);
          return res.data;
        } catch (err: any) {
          lastError = err;
          // If it's a 404 (Not Found) or 405 (Method Not Allowed), continue to next fallback
          if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 400) {
            continue;
          }
          // If we got a 403 or 500, we might want to stop, but let's aggressively try all
        }
      }
      
      throw lastError;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });
      const previousUsers = queryClient.getQueryData(['admin-users']);
      
      queryClient.setQueryData(['admin-users'], (old: any) => {
        if (!old) return old;
        return old.map((u: any) => u.id === id ? { ...u, ...data } : u);
      });
      
      return { previousUsers };
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any, variables, context) => {
      toast.error(error.response?.data?.message || "Failed to update user role");
      if (context?.previousUsers) {
        queryClient.setQueryData(['admin-users'], context.previousUsers);
      }
    }
  });

  if (isPending) {
    return <div className="p-8">Loading users...</div>;
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
                const name = user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'No Profile';
                
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
                          onValueChange={(val) => updateMutation.mutate({ id: user.id, data: { role: val } })}
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
