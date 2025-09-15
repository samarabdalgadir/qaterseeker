import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

/**
 * Authentication button component using Clerk
 * Shows sign in/up buttons for unauthenticated users
 * Shows user button for authenticated users
 */
export function AuthButton() {
  return (
    <>
      <SignedOut>
        <div className="flex gap-2">
          <Button asChild size="sm" variant={"outline"}>
            <SignInButton />
          </Button>
          <Button asChild size="sm" variant={"default"}>
            <SignUpButton />
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </SignedIn>
    </>
  );
}
