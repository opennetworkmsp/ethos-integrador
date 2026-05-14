import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Home from './pages/Home'
import Condominios from './pages/Condominios'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Usuarios from './pages/Usuarios'
import Perfil from './pages/Perfil'
import BaseConhecimento from './pages/BaseConhecimento'
import Assistente from './pages/Assistente'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/condominios" element={<Condominios />} />
              <Route path="/base-conhecimento" element={<BaseConhecimento />} />
              <Route path="/assistente" element={<Assistente />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
