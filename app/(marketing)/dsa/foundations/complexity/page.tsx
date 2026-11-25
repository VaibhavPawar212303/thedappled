import { permanentRedirect } from "next/navigation";

// The single "Complexity & Big-O" lesson was split into four beginner steps (Foundations 1-4).
// Old links (including the Dec 10 LinkedIn post) land on step 1.
export default function ComplexityRedirect() {
  permanentRedirect("/dsa/foundations/algorithms");
}
