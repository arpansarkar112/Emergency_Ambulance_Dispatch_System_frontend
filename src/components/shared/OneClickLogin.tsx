"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OneClickLogin() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDemoLogin = async (role: string, email: string) => {
    setLoading(role);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: "demo_password", // The backend should theoretically bypass or use standard for demo
        role,
      });

      if (res?.error) {
        toast.error(`Demo login failed: ${res.error}`);
      } else {
        toast.success(`Logged in as Demo ${role}`);
        if (role === "admin") router.push("/admin");
        if (role === "provider") router.push("/provider");
        if (role === "user") router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred during demo login");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4 pt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            🚀 Quick Demo Login
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleDemoLogin("admin", "admin@example.com")}
          disabled={loading !== null}
        >
          {loading === "admin" ? "..." : "👨‍💼 Admin"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleDemoLogin("user", "user@example.com")}
          disabled={loading !== null}
        >
          {loading === "user" ? "..." : "👤 User"}
        </Button>
      </div>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => handleDemoLogin("provider", "provider@example.com")}
        disabled={loading !== null}
      >
        {loading === "provider" ? "..." : "🛠️ Provider"}
      </Button>
    </div>
  );
}
