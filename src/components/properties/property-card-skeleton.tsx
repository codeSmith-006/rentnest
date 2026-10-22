import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image placeholder */}
        <Skeleton className="h-52 w-full rounded-none" />

        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between py-2 border-y">
            <Skeleton className="h-3.5 w-14 rounded-md" />
            <Skeleton className="h-3.5 w-14 rounded-md" />
            <Skeleton className="h-3.5 w-16 rounded-md" />
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-2">
        <Skeleton className="h-9 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
