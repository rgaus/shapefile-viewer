"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import ShapefileRendererWrapper from "@/components/ShapefileRendererWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className={cn(geistSans.className, geistMono.className, "fixed inset-0")}>
      <ShapefileRendererWrapper />
    </div>
  );
}
