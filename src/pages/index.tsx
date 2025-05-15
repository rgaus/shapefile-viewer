"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import ShapefileRendererWrapper from "@/components/ShapefileRendererWrapper";
import UploadShapefile from "@/components/UploadShapefile";
import { ShapefileDataProvider } from "@/contexts/shapefile-data";
import ShapefileSidebar from "@/components/ShapefileSidebar";

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
      <ShapefileDataProvider>
        <UploadShapefile />
        <div className="flex h-full w-full">
          <ShapefileSidebar />
          <ShapefileRendererWrapper />
        </div>
      </ShapefileDataProvider>
    </div>
  );
}
