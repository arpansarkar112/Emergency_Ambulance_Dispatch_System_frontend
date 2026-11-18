"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { User, Truck, ShieldCheck, Loader2 } from "lucide-react";
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
  {
    key: "ADMIN",
    label: "Demo Admin",
    sublabel: "admin@ambulance.com",
    email: "admin@ambulance.com",
    password: "admin123",
    redirectTo: "/admin",
    icon: ShieldCheck,
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
      const apiRes = await api.post("/auth/login", {
        email: account.email,
        password: account.password,
      });

      const authData = apiRes.data?.data;
      if (!apiRes.data?.success || !authData?.accessToken) {
        throw new Error(apiRes.data?.message || "Invalid credentials");
      }

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
        window.location.assign(account.redirectTo);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err.response?.data?.message || err.message || "An error occurred during demo login";
      toast.error(`Demo login failed: ${msg}`);
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col space-y-3 pt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2.5 font-medium text-muted-foreground">
            Instant Demo Login (Auto-Fill)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isBusy = loading === account.key;
          return (
            <Button
              key={account.key}
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 flex items-center justify-between text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => handleDemoLogin(account)}
              disabled={loading !== null}
            >
              <span className="flex items-center gap-2.5">
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="font-medium text-xs sm:text-sm text-foreground">
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
