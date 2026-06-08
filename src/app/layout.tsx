import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { headers } from "next/headers";

const outfitFont = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OliveEstate Admin",
  description: "Real Estate Inventory Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname === "/login";

  return (
    <html
      lang="en"
      className={`${outfitFont.variable} ${geistMono.variable} h-full antialiased text-[16px]`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {isLoginPage ? (
            <main className="flex-1 flex flex-col items-center justify-center min-h-screen">
              {children}
            </main>
          ) : (
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 overflow-auto w-full h-screen relative flex flex-col p-4 md:p-8">
                <SidebarTrigger className="mb-6 bg-muted/50 hover:bg-muted p-2 rounded-full transition-colors w-10 h-10" />
                {children}
              </main>
            </SidebarProvider>
          )}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
