import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aapun — peer conversations, human-first",
  description:
    "Connect with people who share similar lived experiences for warm, one-on-one peer conversations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          <header className="flex shrink-0 items-center justify-end gap-3 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton />
                <SignUpButton />
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
