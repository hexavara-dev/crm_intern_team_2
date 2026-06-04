"use client";

import { useAuth } from "./auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !user && pathname !== "/login") {
        router.push("/login");
      }
    }, [user, isLoading, router, pathname]);

    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (!user && pathname !== "/login") {
      return null;
    }

    return <Component {...props} />;
  };
}
