"use client";
import { usePathname } from "next/navigation";

export function useIsHome(): boolean {
    const pathname = usePathname();
    return pathname === "/";
}