export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <main className="container mx-auto px-4 py-8">
          {children}</main>
      </body>
    </html>
  )
}

