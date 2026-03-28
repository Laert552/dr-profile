import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Doctor Profile System",
  description: "Manage your doctor profile and documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
