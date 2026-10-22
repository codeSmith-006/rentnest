import { ReactNode } from "react";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 ${className}`}
    >
      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon || <FolderSearch className="size-6" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
