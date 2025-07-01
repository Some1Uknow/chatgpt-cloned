import { useAuth } from "@clerk/nextjs";

export function useAuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth();

  return { isSignedIn: isSignedIn && isLoaded };
}
