"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ambulance, AlertCircle, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { signIn, getSession } from "next-auth/react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/axios";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["PATIENT", "DRIVER"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PATIENT",
    },
  });

  const selectedRole = watch("role");
  const passwordVal = watch("password") || "";

  const pwdChecks = [
    { label: "8+ characters", ok: passwordVal.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(passwordVal) },
    { label: "Lowercase", ok: /[a-z]/.test(passwordVal) },
    { label: "Number", ok: /[0-9]/.test(passwordVal) },
  ];

  const routeUserBasedOnRole = async () => {
    const session = await getSession();
    const userRole = (session?.user as { role?: string } | undefined)?.role || "PATIENT";
    if (userRole === "ADMIN") router.push("/admin");
    else if (userRole === "DRIVER") router.push("/provider");
    else router.push("/dashboard");
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        idToken: credentialResponse.credential,
      });

      if (res?.error) {
        setServerError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Google sign-up successful!");
        await routeUserBasedOnRole();
      }
    } catch {
      toast.error("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await api.post("/auth/register", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (res.data.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/login?registered=true");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: Array<{ message: string }> } };
      };
      const apiError = err.response?.data;
      let errorMessage = apiError?.message || "Registration failed. Please check your details.";
      if (apiError?.errors && apiError.errors.length > 0) {
        errorMessage = apiError.errors[0].message;
      }
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2.5 mb-6 text-xl font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Ambulance className="h-5 w-5" />
        </span>
        <span>
          Call<span className="text-primary">Ambulance</span>
        </span>
      </Link>

      <div className="w-full max-w-[470px] bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 sm:p-8">
        <div className="flex flex-col space-y-1.5 text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Register as a Patient for rapid dispatch or as a Certified Driver
          </p>
        </div>

        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-first-name">First Name</Label>
              <Input
                id="reg-first-name"
                placeholder="Arpan"
                aria-invalid={Boolean(errors.firstName)}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-last-name">Last Name</Label>
              <Input
                id="reg-last-name"
                placeholder="Sarkar"
                aria-invalid={Boolean(errors.lastName)}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Min 8 chars, upper, lower & number"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {pwdChecks.map((c) => (
                <span
                  key={c.label}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  <Check className={`h-3 w-3 ${c.ok ? "opacity-100" : "opacity-30"}`} />
                  {c.label}
                </span>
              ))}
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm-password">Confirm Password</Label>
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-role">Account Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(val) =>
                setValue("role", (val as "PATIENT" | "DRIVER") || "PATIENT", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="reg-role" className="w-full h-10 rounded-xl">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">Patient — Request Emergency Dispatch</SelectItem>
                <SelectItem value="DRIVER">Driver — Operate Fleet Ambulance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full mt-2" size="lg" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2.5 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center w-full overflow-hidden rounded-xl">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
                useOneTap={false}
                shape="rectangular"
                theme="outline"
                text="continue_with"
                size="large"
                width="360"
              />
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
