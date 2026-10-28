"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
    },
  });

  const { data: user, isPending, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || ""
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await api.patch('/users/me', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  if (isPending) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-9 w-48" />
        <Card className="max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={user?.email || ""} 
                disabled 
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone / Emergency Contact</Label>
              <Input 
                id="phone"
                {...register("phone")}
                placeholder="+1 234 567 8900"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                {...register("address")}
                placeholder="123 Main St, City, Country"
              />
            </div>

            <Button 
              type="submit" 
              className="mt-4"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
