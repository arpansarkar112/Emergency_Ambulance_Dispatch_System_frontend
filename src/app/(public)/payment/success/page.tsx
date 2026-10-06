import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Your ambulance dispatch request has been confirmed. The unit is on its way.
      </p>
      <Link href="/dashboard">
        <Button size="lg">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
