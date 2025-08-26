import { Metadata } from "next";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

export const metadata: Metadata = {
  title: {
    default: "Polly - Polling App",
    template: "%s | Polly",
  },
  description: "A modern polling application",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Polly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}