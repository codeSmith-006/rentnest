"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/features/auth/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building2,
  Home,
  CheckCircle2,
} from "lucide-react";
import { AppError } from "@/lib/error";

function RegisterFormContent() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<"TENANT" | "LANDLORD">("TENANT");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "TENANT",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // Connect to real backend API: POST /api/auth/register
      const response = await authService.register(data);

      if (response?.data?.user) {
        setAuth(response.data.user, response.data.token);
        toast.success("Account created successfully! Welcome to RentNest.");

        if (response.data.user.role === "LANDLORD") {
          router.push("/dashboard/landlord");
        } else {
          router.push("/dashboard/tenant");
        }
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const msg = "Unable to create account. Please verify your details.";
        setServerError(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
          <UserPlus className="size-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Join RentNest to find your next home or list rental properties
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Server / API error banner */}
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Role Selection Cards */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Choose Your Role</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("TENANT");
                  setValue("role", "TENANT");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedRole === "TENANT"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/70 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Home className={`size-4 ${selectedRole === "TENANT" ? "text-primary" : "text-muted-foreground"}`} />
                  {selectedRole === "TENANT" && <CheckCircle2 className="size-3.5 text-primary" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Tenant</div>
                  <div className="text-[10px] text-muted-foreground">Looking to rent</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("LANDLORD");
                  setValue("role", "LANDLORD");
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedRole === "LANDLORD"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                    : "border-border/70 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Building2 className={`size-4 ${selectedRole === "LANDLORD" ? "text-primary" : "text-muted-foreground"}`} />
                  {selectedRole === "LANDLORD" && <CheckCircle2 className="size-3.5 text-primary" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Landlord</div>
                  <div className="text-[10px] text-muted-foreground">List & rent properties</div>
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Sarah Jenkins"
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className={errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Phone Number <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              aria-invalid={Boolean(errors.phone)}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.phone && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
                className={`pr-10 ${
                  errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold shadow-xs h-10 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
          <span>Already have an account?</span>
          <Link
            href="/auth/login"
            className="ml-1.5 font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/40 rounded-2xl" />}>
      <RegisterFormContent />
    </Suspense>
  );
}
