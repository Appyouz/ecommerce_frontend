import { AuthProvider } from "../context/auth-content"
import Header from "../ui/headers"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <main className="container mx-auto px-4 py-8">
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </main>
      </body>
    </html>
  )
}

