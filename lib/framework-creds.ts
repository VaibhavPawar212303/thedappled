import { createHmac } from "crypto";

// Each learner gets their own demo sign-in for the framework-setup stage, derived from their
// assignment token. Nothing is stored: the same token always yields the same email and password,
// and the password cannot be guessed without the server secret.
const secret = () => process.env.ASSIGNMENT_SECRET || process.env.CLERK_SECRET_KEY || "dev-only-secret";

export function demoCredentials(token: string): { email: string; password: string } {
  const mac = createHmac("sha256", secret()).update(`framework-setup:${token}`).digest("base64url");
  return {
    email: `demo-${token.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}@thedappled.test`,
    // Prefix guarantees upper, lower, digit and symbol so it looks like a real password.
    password: `Dp${mac.slice(0, 8)}!7`,
  };
}
