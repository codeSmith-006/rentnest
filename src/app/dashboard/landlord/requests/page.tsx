import { IncomingRequestsSection } from "@/components/landlord/incoming-requests-section";

export default function LandlordRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Tenant Rental Requests
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review, approve, and manage tenant applications for all your listed properties.
        </p>
      </div>

      <IncomingRequestsSection />
    </div>
  );
}
