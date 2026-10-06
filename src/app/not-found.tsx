import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-9xl font-bold tracking-tight text-primary">404</h1>
        <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</p>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
