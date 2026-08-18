import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCEND — Your Training System",
  description: "Adaptive Fitness Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}