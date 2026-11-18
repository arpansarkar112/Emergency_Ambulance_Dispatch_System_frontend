import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <Badge variant="outline">Legal & Data Protection</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: November 2026 • CallAmbulance Emergency Medical Systems
          </p>
        </header>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>
              To coordinate rapid emergency medical transport, CallAmbulance collects account
              credentials (email and bcrypt-hashed password), profile information (name, contact
              phone, default pickup address, optional blood group, and emergency contact), and
              dispatch records (pickup location, destination hospital, and clinical priority tier).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. How We Use Dispatch Data</h2>
            <p>
              Your pickup coordinates, contact telephone, and clinical urgency level are shared
              solely with authorized dispatch administrators and your assigned paramedic driver for
              the duration of the active emergency mission and billing reconciliation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Payments & Stripe Security</h2>
            <p>
              CallAmbulance never stores raw payment card numbers. All post-trip medical transport
              invoices are processed through PCI-DSS compliant Stripe Checkout sessions, and only
              transaction references and settlement statuses are recorded in our database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Access Controls & Retention</h2>
            <p>
              Role-based access control (RBAC) restricts administrative and driver views strictly to
              authorized accounts via signed JWT tokens. You may update your personal contact
              details at any time from your Profile dashboard or contact{" "}
              <span className="text-foreground font-medium">dispatch@callambulance.health</span> for
              account data requests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
