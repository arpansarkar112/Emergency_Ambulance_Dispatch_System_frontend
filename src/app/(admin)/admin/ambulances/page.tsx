"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminAmbulancesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "",
    driverId: ""
  });

  const { data: drivers } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const res = await api.get('/users');
      const allUsers = res.data.data?.users || res.data.data || [];
      return (Array.isArray(allUsers) ? allUsers : []).filter((u: any) => u.role === 'DRIVER');
    }
  });

  const { data: ambulances, isPending } = useQuery({
    queryKey: ['admin-ambulances'],
    queryFn: async () => {
      const res = await api.get('/ambulances');
      const data = res.data.data;
      return data?.ambulances || data?.data || (Array.isArray(data) ? data : []);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload: any = { vehicleNumber: data.vehicleNumber, vehicleType: data.vehicleType };
      if (data.driverId) payload.driverId = data.driverId;
      
      let createdAmb = null;
      try {
        const res = await api.post('/ambulances', payload);
        createdAmb = res.data.data || res.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 403) {
          const res = await api.post('/admin/ambulances', payload);
          createdAmb = res.data.data || res.data;
        } else {
          throw err;
        }
      }
      
      // If a driver was selected but the backend didn't link it during POST, try PATCHing it
      if (payload.driverId && createdAmb && createdAmb.id && !createdAmb.driverId && !createdAmb.driver) {
        try {
          await api.patch(`/ambulances/${createdAmb.id}`, { driverId: payload.driverId });
        } catch(e) {}
      }
      
      return createdAmb;
    },
    onSuccess: () => {
      toast.success("Ambulance created successfully");
      setOpen(false);
      setFormData({ vehicleNumber: "", vehicleType: "" });
      queryClient.invalidateQueries({ queryKey: ['admin-ambulances'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create ambulance");
    }
  });

  if (isPending) {
    return <div className="p-8">Loading ambulances...</div>;
  }

  const allAmbulances = Array.isArray(ambulances) ? ambulances : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ambulances Management</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants()}>
            + Add Ambulance
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ambulance</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }} 
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number (License Plate)</Label>
                <Input 
                  id="vehicleNumber" 
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                  placeholder="e.g. XY-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input 
                  id="vehicleType" 
                  value={formData.vehicleType}
                  onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                  required
                  placeholder="e.g. ALS, BLS, ICU"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverId">Assign Driver (Optional)</Label>
                <Select 
                  value={formData.driverId} 
                  onValueChange={(val) => setFormData({ ...formData, driverId: val })}
                >
                  <SelectTrigger id="driverId">
                    <SelectValue placeholder="Select a Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {(drivers || []).map((driver: any) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Ambulance"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAmbulances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No ambulances found.
                </TableCell>
              </TableRow>
            ) : (
              allAmbulances.map((amb: any) => (
                <TableRow key={amb.id}>
                  <TableCell className="font-medium">{amb.vehicleNumber}</TableCell>
                  <TableCell>{amb.vehicleType}</TableCell>
                  <TableCell>
                    <Badge variant={amb.status === 'AVAILABLE' ? 'default' : 'secondary'} className={amb.status === 'AVAILABLE' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                      {amb.status || 'AVAILABLE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {amb.driver ? (
                      <span className="text-sm">{amb.driver.email}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
