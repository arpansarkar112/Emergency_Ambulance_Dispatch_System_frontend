"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { User, Truck, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";

interface OneClickLoginProps {
  onSelectCredentials?: (email: string, password: string) => void;
}

const DEMO_ACCOUNTS = [
  {
    key: "PATIENT",
    label: "Demo User (Patient)",
    sublabel: "arpansarkar112@gmail.com",
    email: "arpansarkar112@gmail.com",
    password: "password123",
    redirectTo: "/dashboard",
    icon: User,
  },
  {
    key: "DRIVER",
    label: "Demo Provider (Driver)",
    sublabel: "driver@ambulance.com",
    email: "driver@ambulance.com",
    password: "password123",
    redirectTo: "/provider",
    icon: Truck,
  },
] as const;

export function OneClickLogin({ onSelectCredentials }: OneClickLoginProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setLoading(account.key);
    if (onSelectCredentials) {
      onSelectCredentials(account.email, account.password);
    }
    try {
      // 1. Authenticate against /api/v1/auth/login
      const apiRes = await api.post("/auth/login", {
        email: account.email,
        password: account.password,
      });

      const authData = apiRes.data?.data;
      if (!apiRes.data?.success || !authData?.accessToken) {
        throw new Error(apiRes.data?.message || "Invalid credentials");
      }

      // 2. Establish NextAuth session with the verified token & user
      const res = await signIn("credentials", {
        redirect: false,
        email: account.email,
        password: account.password,
        accessToken: authData.accessToken,
        userJson: JSON.stringify(authData.user),
      });

      if (res?.error) {
        toast.error(`Demo login failed: ${res.error}`);
        setLoading(null);
      } else {
        toast.success(`Signed in as ${account.label}`);
        window.location.href = account.redirectTo;
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during demo login";
      toast.error(`Demo login failed: ${msg}`);
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col space-y-3 pt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 font-medium text-muted-foreground">
            One-Click Demo Role Login
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-1">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isBusy = loading === account.key;
          return (
            <Button
              key={account.key}
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 flex items-center justify-between text-left border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() => handleDemoLogin(account)}
              disabled={loading !== null}
            >
              <span className="flex items-center gap-2.5">
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="font-medium text-xs sm:text-sm text-gray-900">
                  {account.label}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[165px]">
                {account.sublabel}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

