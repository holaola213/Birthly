import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { HeaderNav } from "@/components/header-nav";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Birthly",
  description: "Never forget a friend's birthday again",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {user ? (
            <>
              <header className="border-b">
                <div className="container mx-auto flex items-center justify-between px-4 py-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Birthly" className="h-36 w-auto" />
                  </Link>
                  <HeaderNav user={{ username: user.username, name: user.name }} />
                </div>
              </header>
              <main className="container mx-auto px-4 py-8">{children}</main>
            </>
          ) : (
            <>{children}</>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
