import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kairo",
  description:
    "Guidelines change; nobody re-checks the patients already on old treatment. Kairo does.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
