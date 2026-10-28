"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ambulance } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signIn, getSession } from "next-auth/react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DRIVER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
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
      role: "PATIENT",
    },
  });

  const selectedRole = watch("role");

  const routeUserBasedOnRole = async () => {
    const session = await getSession();
    const userRole = (session?.user as any)?.role || "PATIENT";
    if (userRole === "ADMIN") {
      router.push("/admin");
    } else if (userRole === "DRIVER") {
      router.push("/provider");
    } else {
      router.push("/dashboard");
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

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", values);
      
      if (res.data.success) {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch (error: any) {
      const apiError = error.response?.data;
      let errorMessage = apiError?.message || "Registration failed. Please check your network.";
      if (apiError?.errors && apiError.errors.length > 0) {
        errorMessage = apiError.errors[0].message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80">
        <Ambulance className="h-6 w-6" />
        CallAmbulance.
      </Link>
      
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input 
                id="first-name" 
                placeholder="Max" 
                {...register("firstName")}
                className="bg-gray-50/50"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input 
                id="last-name" 
                placeholder="Robinson" 
                {...register("lastName")}
                className="bg-gray-50/50"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
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
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Minimum 6 characters"
              {...register("password")}
              className="bg-gray-50/50"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setValue("role", (val as "PATIENT" | "DRIVER") || "PATIENT", { shouldValidate: true })}
            >
              <SelectTrigger className="bg-gray-50/50">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">Patient (Need Ambulance)</SelectItem>
                <SelectItem value="DRIVER">Driver (Provide Ambulance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full mt-6" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="relative my-8">
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

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
          Sign in
        </Link>
      </p>
    </div>
  );
}
