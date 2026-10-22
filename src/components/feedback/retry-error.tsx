import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetryErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function RetryError({
  title = "Failed to load data",
  message = "An error occurred while connecting to the server. Please try again.",
  onRetry,
  isLoading = false,
  className = "",
}: RetryErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 ${className}`}
    >
      <div className="size-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="mt-4 gap-2"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Retry Request
        </Button>
      )}
    </div>
  );
}
