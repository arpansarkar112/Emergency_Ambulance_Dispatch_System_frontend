export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center text-center">
      <h1 className="text-4xl font-medium tracking-tight mb-6">Simple Pricing</h1>
      <p className="text-lg text-muted-foreground font-light max-w-2xl mb-12">
        Transparent fees for emergency response management.
      </p>
      <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl w-full">
        <div className="p-8 border border-border rounded-xl">
          <h3 className="text-2xl font-medium mb-2">Patients</h3>
          <p className="text-muted-foreground font-light mb-6">Free to request. Pay standard ambulance rates based on distance and service level.</p>
          <div className="text-3xl font-medium">$0 <span className="text-base text-muted-foreground font-light">platform fee</span></div>
        </div>
        <div className="p-8 border border-border rounded-xl bg-muted/30">
          <h3 className="text-2xl font-medium mb-2">Providers</h3>
          <p className="text-muted-foreground font-light mb-6">Join our network and manage dispatches efficiently with a flat per-ride fee.</p>
          <div className="text-3xl font-medium">5% <span className="text-base text-muted-foreground font-light">per completed ride</span></div>
        </div>
      </div>
    </div>
  );
}
