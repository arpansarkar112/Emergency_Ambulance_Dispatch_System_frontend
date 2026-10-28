"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const queryClient = useQueryClient();
  const [verifying, setVerifying] = useState(Boolean(sessionId));
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    let active = true;
    api
      .post("/payments/verify-session", { sessionId })
      .then(() => {
        if (!active) return;
        setVerified(true);
        toast.success("Payment verified and marked as Paid!");
        queryClient.invalidateQueries({ queryKey: ["my-requests"] });
        queryClient.invalidateQueries({ queryKey: ["admin-requests-payments"] });
        queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        queryClient.invalidateQueries({ queryKey: ["provider-requests"] });
      })
      .catch((err) => {
        console.error("Failed to verify payment session:", err);
      })
      .finally(() => {
        if (active) setVerifying(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {verifying ? (
        <>
          <Loader2 className="h-20 w-20 text-primary animate-spin mb-6" />
          <h1 className="text-3xl font-bold mb-4">Verifying Your Payment...</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Please wait a moment while we confirm your transaction and update your payment status.
          </p>
        </>
      ) : (
        <>
          <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {verified
              ? "Your payment has been confirmed and updated across all records."
              : "Thank you! Your ambulance dispatch payment has been processed."}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/payments">
              <Button size="lg">View My Payments</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">Return to Dashboard</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading payment confirmation...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
