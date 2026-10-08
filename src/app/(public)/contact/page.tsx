export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center text-center">
      <h1 className="text-4xl font-medium tracking-tight mb-6">Contact Us</h1>
      <p className="text-lg text-muted-foreground font-light max-w-2xl mb-12">
        For support, partnerships, or enterprise inquiries, reach out to our team.
      </p>
      <div className="w-full max-w-md space-y-4 text-left">
        <div className="p-6 border border-border rounded-xl">
          <h3 className="font-medium">General Inquiries</h3>
          <p className="text-muted-foreground font-light mt-1">hello@callambulance.com</p>
        </div>
        <div className="p-6 border border-border rounded-xl">
          <h3 className="font-medium">Emergency Support</h3>
          <p className="text-muted-foreground font-light mt-1">1-800-AMBULANCE (Partners only)</p>
        </div>
      </div>
    </div>
  );
}
