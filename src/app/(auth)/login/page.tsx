"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ambulance, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { OneClickLogin } from "@/components/shared/OneClickLogin";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";
  const isRegistered = searchParams.get("registered") === "true";
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const routeUserBasedOnRole = async (explicitRole?: string) => {
    let role = explicitRole;
    if (!role) {
      const session = await getSession();
      role = (session?.user as { role?: string } | undefined)?.role || "PATIENT";
    }
    if (role === "ADMIN") {
      window.location.assign("/admin");
    } else if (role === "DRIVER") {
      window.location.assign("/provider");
    } else {
      window.location.assign("/dashboard");
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      const apiRes = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const authData = apiRes.data?.data;
      if (!apiRes.data?.success || !authData?.accessToken) {
        throw new Error(apiRes.data?.message || "Invalid email or password");
      }

      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        accessToken: authData.accessToken,
        userJson: JSON.stringify(authData.user),
      });

      if (res?.error) {
        setServerError(res.error);
        toast.error(res.error);
        setLoading(false);
      } else {
        toast.success("Login successful! Redirecting...");
        await routeUserBasedOnRole(authData.user?.role);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err.response?.data?.message || err.message || "Authentication failed";
      setServerError(msg);
      toast.error(msg);
      setLoading(false);
    }
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
        toast.success("Google login successful!");
        await routeUserBasedOnRole();
      }
    } catch {
      toast.error("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 py-10 relative">
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

      <div className="w-full max-w-[440px] bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 sm:p-8">
        <div className="flex flex-col space-y-1.5 text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dispatch dashboard and live telemetry
          </p>
        </div>

        {isExpired && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Your session expired for security. Please sign in again.</span>
          </div>
        )}

        {isRegistered && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Account created successfully! Sign in with your credentials below.</span>
          </div>
        )}

        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link href="/contact" className="text-xs font-medium text-primary hover:underline">
                Need access help?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button className="w-full mt-2" size="lg" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <OneClickLogin
          onSelectCredentials={(email, password) => {
            setValue("email", email, { shouldValidate: true });
            setValue("password", password, { shouldValidate: true });
          }}
        />

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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background" />}>
      <LoginFormContent />
    </Suspense>
  );
}
