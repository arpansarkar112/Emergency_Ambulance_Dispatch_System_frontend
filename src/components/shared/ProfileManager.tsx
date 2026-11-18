"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, CheckCircle2, KeyRound, Loader2, ShieldCheck, Upload } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  emergencyContact: z.string().max(60).optional().or(z.literal("")),
  bloodGroup: z.string().max(10).optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process image"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ProfileManager({ heading = "My Profile", subtitle }: { heading?: string; subtitle?: string }) {
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      emergencyContact: "",
      bloodGroup: "",
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const selectedBloodGroup = watch("bloodGroup");

  const { data: user, isPending, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        emergencyContact: user.profile?.emergencyContact || "",
        bloodGroup: user.profile?.bloodGroup || "",
      });
      setAvatarPreview(user.profile?.avatarUrl || null);
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues & { avatarUrl?: string | null }) => {
      const res = await api.patch("/users/me", data);
      return res.data;
    },
    onSuccess: async (_data, vars) => {
      const fullName = `${vars.firstName} ${vars.lastName}`.trim();
      setProfileSuccess("Your personal details and avatar have been saved.");
      toast.success("Profile updated successfully!");
      await updateSession({ name: fullName, image: vars.avatarUrl ?? avatarPreview });
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.patch("/users/me/password", data);
      return res.data;
    },
    onSuccess: () => {
      setPasswordSuccess("Your password has been updated securely.");
      toast.success("Password updated successfully!");
      resetPwd();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update password");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      toast.success("Photo ready — click Save Changes to apply.");
    } catch {
      toast.error("Could not process image file.");
    }
  };

  if (isPending) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const initials =
    `${user?.profile?.firstName?.[0] || ""}${user?.profile?.lastName?.[0] || ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{heading}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {subtitle || "Manage your personal details, emergency contact profile, avatar, and security credentials."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Profile Info & Avatar Card */}
        <Card className="lg:col-span-2 rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Keep your medical dispatch details accurate for rapid response.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-emerald" />
                {user?.role || "PATIENT"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 mb-6 border-b border-border/70">
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Profile Photo</p>
                <p className="text-xs text-muted-foreground">
                  Upload a JPG, PNG, or WebP photo (automatically resized for fast loading).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Photo
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarPreview(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit((values) => {
                setProfileSuccess(null);
                updateProfileMutation.mutate({ ...values, avatarUrl: avatarPreview });
              })}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-firstName">First Name</Label>
                  <Input
                    id="profile-firstName"
                    aria-invalid={Boolean(errors.firstName)}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-lastName">Last Name</Label>
                  <Input
                    id="profile-lastName"
                    aria-invalid={Boolean(errors.lastName)}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input id="profile-email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Account email is verified and read-only.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">Phone Number</Label>
                  <Input
                    id="profile-phone"
                    placeholder="+1 (555) 234-5678"
                    {...register("phone")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-bloodGroup">Blood Group</Label>
                  <Select
                    value={selectedBloodGroup || "UNSET"}
                    onValueChange={(val) =>
                      setValue("bloodGroup", val === "UNSET" ? "" : val || "")
                    }
                  >
                    <SelectTrigger id="profile-bloodGroup" className="w-full h-10 rounded-xl">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNSET">Not specified</SelectItem>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-emergencyContact">Emergency Contact</Label>
                  <Input
                    id="profile-emergencyContact"
                    placeholder="Name & phone (e.g. Maya — +1 555 0199)"
                    {...register("emergencyContact")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-address">Default Pickup / Station Address</Label>
                  <Input
                    id="profile-address"
                    placeholder="742 Parkview Avenue, Apt 4B"
                    {...register("address")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="mt-2"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Update Password
            </CardTitle>
            <CardDescription>
              Use at least 8 characters with uppercase, lowercase, and a number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmitPwd((values) => {
                setPasswordSuccess(null);
                updatePasswordMutation.mutate({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
              })}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  aria-invalid={Boolean(pwdErrors.currentPassword)}
                  {...registerPwd("currentPassword")}
                />
                {pwdErrors.currentPassword && (
                  <p className="text-xs text-destructive">{pwdErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min 8 chars (A-z, 0-9)"
                  aria-invalid={Boolean(pwdErrors.newPassword)}
                  {...registerPwd("newPassword")}
                />
                {pwdErrors.newPassword && (
                  <p className="text-xs text-destructive">{pwdErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter new password"
                  aria-invalid={Boolean(pwdErrors.confirmPassword)}
                  {...registerPwd("confirmPassword")}
                />
                {pwdErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{pwdErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
