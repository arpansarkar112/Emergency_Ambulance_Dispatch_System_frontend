"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ambulance } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { OneClickLogin } from "@/components/shared/OneClickLogin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const routeUserBasedOnRole = async (explicitRole?: string) => {
    let role = explicitRole;
    if (!role) {
      const session = await getSession();
      role = (session?.user as any)?.role || "PATIENT";
    }
    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else if (role === "DRIVER") {
      window.location.href = "/provider";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
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
        toast.error(res.error);
        setLoading(false);
      } else {
        toast.success("Login successful!");
        await routeUserBasedOnRole(authData.user?.role);
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        idToken: credentialResponse.credential,
      });

      if (res?.error) {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4 py-10">
      <Link href="/" className="flex items-center gap-2 mb-6 text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80">
        <Ambulance className="h-6 w-6" />
        CallAmbulance.
      </Link>
      
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              placeholder="name@example.com" 
              type="email" 
              {...register("email")}
              className="bg-gray-50/50"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              {...register("password")}
              className="bg-gray-50/50"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <OneClickLogin
          onSelectCredentials={(email, password) => {
            setValue("email", email, { shouldValidate: true });
            setValue("password", password, { shouldValidate: true });
          }}
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
            useOneTap={false}
            shape="rectangular"
            theme="outline"
            text="continue_with"
            size="large"
            width="100%"
          />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
          Sign up
        </Link>
      </p>
    </div>
  );
}
