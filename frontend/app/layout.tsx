import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cổng Thông Tin Sáng Kiến Công Đoàn Petrovietnam",
  description:
    "Prototype cổng thông tin sáng kiến Công đoàn BM QL&ĐH Petrovietnam.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
