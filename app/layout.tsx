import "@/app/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BYOSE TECH CALENDAR",
  description: "Event Manager application for Bioccité",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
