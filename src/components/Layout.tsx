import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Building2, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {user && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline-block">Ethos API</span>
              </Link>

              <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                <Link
                  to="/"
                  className={`transition-colors hover:text-foreground/80 ${
                    location.pathname === '/' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Condomínios
                </Link>
                {profile?.role === 'administrador' && (
                  <Link
                    to="/usuarios"
                    className={`transition-colors hover:text-foreground/80 ${
                      location.pathname === '/usuarios' ? 'text-foreground' : 'text-foreground/60'
                    }`}
                  >
                    Usuários
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block font-medium">
                {profile?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block">Sair</span>
              </Button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
