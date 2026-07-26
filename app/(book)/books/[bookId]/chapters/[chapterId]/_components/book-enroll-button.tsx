"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface BookEnrollButtonProps {
  price: number;
  bookId: string;
}

export const BookEnrollButton = ({
  price,
  bookId,
}: BookEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isFree = !price || price <= 0;

  const onClick = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`/api/books/${bookId}/checkout`);

      if (response.data.free) {
        toast.success("Added to your library!");
        router.refresh();
        return;
      }

      window.location.assign(response.data.url);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      {isFree ? "Get for Free" : `Buy for ${formatPrice(price)}`}
    </Button>
  )
}
