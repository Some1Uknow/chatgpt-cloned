"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/chat";

  return <SignIn afterSignInUrl={redirectUrl} afterSignUpUrl={redirectUrl} />;
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-white" />
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </div>
  );
}
