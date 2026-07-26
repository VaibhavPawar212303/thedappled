"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface CourseEnrollButtonProps {
    courseId: string;
    price: number;
}
export const CourseEnrollButton = ({ courseId, price }: CourseEnrollButtonProps) => {
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
            const response = await axios.post(`/api/courses/${courseId}/checkout`);

            if (response.data.free) {
                toast.success("Enrolled!");
                router.refresh();
                return;
            }

            window.location.assign(response.data.url);
        } catch {
            toast.error("Something went wrong while enrolling in the course.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <Button onClick={onClick} disabled={isLoading} size="sm" className="w-full md:w-auto">
            {isFree ? "Enroll for Free" : `Enroll in Course for ${formatPrice(price)}`}
        </Button>
    )
}
