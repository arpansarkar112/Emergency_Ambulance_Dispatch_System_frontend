import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <XCircle className="h-24 w-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Your payment was not completed. The dispatch request is currently pending.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard/payments">
          <Button size="lg" variant="default">Try Again</Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
