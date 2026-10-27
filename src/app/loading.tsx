import { Loader2, Home } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <div className="relative size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
        <Home className="size-6 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Loading RentNest...</span>
      </div>
    </div>
  );
}
