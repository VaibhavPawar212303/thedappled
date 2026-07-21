export {};

declare global {
  interface UserPublicMetadata {
    userType?: "teacher" | "student";
  }
}
