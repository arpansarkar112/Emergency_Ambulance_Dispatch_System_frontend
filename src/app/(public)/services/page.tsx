export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center text-center">
      <h1 className="text-4xl font-medium tracking-tight mb-6">Our Services</h1>
      <p className="text-lg text-muted-foreground font-light max-w-2xl mb-12">
        A seamless suite of tools for emergency response coordination.
      </p>
      <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl">
        <div className="space-y-3">
          <h3 className="text-xl font-medium">Instant Dispatching</h3>
          <p className="text-muted-foreground font-light">Algorithmic routing ensures the closest available unit is deployed to your exact coordinates.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-medium">Fleet Management</h3>
          <p className="text-muted-foreground font-light">Tools for hospitals and independent providers to manage their units seamlessly.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-medium">API Integrations</h3>
          <p className="text-muted-foreground font-light">Direct integration with existing hospital software and 911 dispatch centers.</p>
        </div>
      </div>
    </div>
  );
}
