import { Button } from "@/components/ui/button";

export function OneClickLogin() {
  return (
    <div className="flex flex-col space-y-4 pt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            🚀 Quick Demo Login
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
          👨‍💼 Admin
        </Button>
        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
          👤 User
        </Button>
      </div>
      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
        🛠️ Provider
      </Button>
    </div>
  );
}
