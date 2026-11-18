import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <Badge variant="outline">Platform Governance</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: November 2026 • CallAmbulance Emergency Medical Systems
          </p>
        </header>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Emergency Dispatch Scope</h2>
            <p>
              CallAmbulance facilitates rapid coordination between patients, dispatch coordinators,
              and certified ambulance units. In situations where local public emergency services
              (such as 911) are immediately required or internet connectivity is degraded, users
              must dial their municipal emergency number directly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Accurate Triage & Contact Details</h2>
            <p>
              Users agree to provide truthful pickup addresses, working telephone numbers, and
              accurate clinical criticality descriptions so dispatch administrators can allocate
              compatible ICU or Basic Life Support units without delay.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Post-Trip Billing & Settlement</h2>
            <p>
              No upfront deposit is charged at booking time. Following safe arrival and mission
              completion, an itemized trip invoice is generated in USD and payable through Stripe
              Checkout in the Patient Payments portal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Account Responsibilities</h2>
            <p>
              Account holders are responsible for keeping login credentials confidential. Drivers
              and administrators must maintain accurate fleet readiness statuses and adhere to
              platform audit logging policies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
