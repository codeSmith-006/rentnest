"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/features/auth/auth.schema";
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
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { AppError } from "@/lib/error";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // Connect to real backend API: POST /api/auth/login
      const response = await authService.login(data);

      if (response?.data?.user) {
        setAuth(response.data.user, response.data.token);
        toast.success(`Welcome back, ${response.data.user.name}!`);

        // Route to redirect URL or role-based dashboard
        if (redirectUrl) {
          router.push(redirectUrl);
          return;
        }

        const role = response.data.user.role;
        if (role === "ADMIN") router.push("/dashboard/admin");
        else if (role === "LANDLORD") router.push("/dashboard/landlord");
        else router.push("/dashboard/tenant");
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setServerError(err.message);
        toast.error(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const msg = "Invalid email or password. Please verify your credentials.";
        setServerError(msg);
        toast.error(msg);
      }
    }
  };

  const fillDemoAccount = (role: "TENANT" | "LANDLORD" | "ADMIN") => {
    if (role === "TENANT") {
      setValue("email", "tenant@rentnest.com");
      setValue("password", "password123");
    } else if (role === "LANDLORD") {
      setValue("email", "landlord@rentnest.com");
      setValue("password", "password123");
    } else {
      setValue("email", "admin@rentnest.com");
      setValue("password", "password123");
    }
    setServerError(null);
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
          <KeyRound className="size-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your RentNest account to manage properties and rentals
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

          {/* Email field */}
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

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              <>
                <Lock className="size-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          {/* Demo account quick fill presets */}
          <div className="pt-3 border-t space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase text-center tracking-wider">
              Quick-Fill Demo Credentials
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fillDemoAccount("TENANT")}
                className="text-[11px] h-7"
              >
                Tenant
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fillDemoAccount("LANDLORD")}
                className="text-[11px] h-7"
              >
                Landlord
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fillDemoAccount("ADMIN")}
                className="text-[11px] h-7"
              >
                Admin
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/auth/register"
            className="ml-1.5 font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/40 rounded-2xl" />}>
      <LoginFormContent />
    </Suspense>
  );
}
