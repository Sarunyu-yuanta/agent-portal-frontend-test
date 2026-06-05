import type { Metadata } from "next";
import "./globals.css";
import "@sarunyu/system-one/styles.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Yuanta Agent Portal",
  description: "AI-Powered Relationship Manager Platform for Wealth Management",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="h-full bg-background antialiased">{children}</body>
    </html>
  );
}
