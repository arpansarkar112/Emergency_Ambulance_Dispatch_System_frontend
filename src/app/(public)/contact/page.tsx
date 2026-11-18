"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contactSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  category: z.string().min(2, "Please select an inquiry topic"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(160),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      category: "Dispatch Support",
      subject: "",
      message: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    setSuccessMsg(null);
    setServerError(null);
    try {
      const res = await api.post("/contact", values);
      const msg =
        res.data?.message || "Your message has been logged with our 24/7 dispatch support team.";
      setSuccessMsg(msg);
      toast.success(msg);
      reset({
        name: "",
        email: "",
        phone: "",
        category: "Dispatch Support",
        subject: "",
        message: "",
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: Array<{ message: string }> } };
      };
      const apiErr = err.response?.data;
      const msg =
        apiErr?.errors?.[0]?.message ||
        apiErr?.message ||
        "Could not submit your inquiry. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border/70 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 space-y-3 max-w-4xl">
          <Badge variant="outline" className="text-primary border-primary/30">
            24/7 Command Desk & Support
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Contact CallAmbulance
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Reach our clinical dispatch coordinators for hospital fleet partnerships, scheduled
            inter-facility transfers, billing inquiries, or driver onboarding. For immediate
            life-threatening emergencies, call 911 or request dispatch directly in your dashboard.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Column */}
          <div className="lg:col-span-5 space-y-4">
            {[
              {
                icon: Phone,
                title: "24/7 Emergency Dispatch Hotline",
                value: "1-800-911-CARE (1-800-911-2273)",
                sub: "Immediate voice triage for urgent transport coordination",
              },
              {
                icon: Mail,
                title: "Command & Billing Desk",
                value: "dispatch@callambulance.health",
                sub: "Hospital partnerships, receipts & insurance documentation",
              },
              {
                icon: MapPin,
                title: "Central Dispatch Headquarters",
                value: "410 Medical Plaza, Suite 400, Metro City",
                sub: "Adjacent to Midtown Trauma Hub — Station 01",
              },
              {
                icon: Clock,
                title: "Response Guarantee",
                value: "24/7 Live Dispatch • < 2 hr Support Reply",
                sub: "All contact inquiries are stored and routed directly to Admin",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="rounded-xl border border-border/80 bg-card shadow-xs">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Working Contact Form Stored in PostgreSQL */}
          <Card className="lg:col-span-7 rounded-xl border border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Send a Message to Our Dispatch Desk</CardTitle>
              <CardDescription>
                Fill out the form below. Your inquiry is securely stored in our database and
                reviewed by our dispatch operations team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMsg && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Inquiry Received</p>
                    <p className="text-xs mt-0.5">{successMsg}</p>
                  </div>
                </div>
              )}

              {serverError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Dr. Jordan Patel"
                      aria-invalid={Boolean(errors.name)}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email Address</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="jordan@hospital.org"
                      aria-invalid={Boolean(errors.email)}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone">Phone Number (Optional)</Label>
                    <Input
                      id="contact-phone"
                      placeholder="+1 (555) 234-5678"
                      {...register("phone")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-category">Inquiry Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(v) =>
                        setValue("category", v || "Dispatch Support", { shouldValidate: true })
                      }
                    >
                      <SelectTrigger id="contact-category" className="w-full h-10 rounded-xl">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dispatch Support">Dispatch Support</SelectItem>
                        <SelectItem value="Hospital Partnership">Hospital / Fleet Partnership</SelectItem>
                        <SelectItem value="Scheduled Transfer">Scheduled Inter-Hospital Transfer</SelectItem>
                        <SelectItem value="Billing & Stripe">Billing & Stripe Receipt</SelectItem>
                        <SelectItem value="Driver Onboarding">Driver / Paramedic Onboarding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    id="contact-subject"
                    placeholder="e.g. Scheduled Mobile ICU transfer inquiry"
                    aria-invalid={Boolean(errors.subject)}
                    {...register("subject")}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Provide details on your inquiry, preferred callback window, or facility requirements..."
                    aria-invalid={Boolean(errors.message)}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto gap-2" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
