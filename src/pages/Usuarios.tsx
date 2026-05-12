import { useEffect, useState } from 'react'
import { getProfiles, manageUser } from '@/services/users'
import { useAuth, Profile } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserFormDialog } from '@/components/UserFormDialog'
import { toast } from 'sonner'
import { Loader2, Plus, ShieldAlert, Trash2, User as UserIcon, Edit } from 'lucide-react'

export default function Usuarios() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  const { user: currentUser } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'usuario',
  })

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const data = await getProfiles()
      setProfiles(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setDialogMode('create')
    setFormData({ email: '', password: '', full_name: '', role: 'usuario' })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (profile: Profile) => {
    setDialogMode('edit')
    setEditingId(profile.id)
    setFormData({
      email: profile.email,
      password: '',
      full_name: profile.full_name || '',
      role: profile.role,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await manageUser({ action: 'create', ...data })
        toast.success('Usuário criado com sucesso')
      } else {
        await manageUser({
          action: 'update',
          id: editingId,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          ...(data.password ? { password: data.password } : {}),
        })
        toast.success('Usuário atualizado com sucesso')
      }
      setIsDialogOpen(false)
      loadProfiles()
    } catch (error: any) {
      toast.error(dialogMode === 'create' ? 'Erro ao criar usuário' : 'Erro ao atualizar usuário', {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    try {
      await manageUser({ action: 'delete', id })
      toast.success('Usuário removido com sucesso')
      loadProfiles()
    } catch (error: any) {
      toast.error('Erro ao remover usuário', { description: error.message })
    }
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os acessos ao sistema e permissões dos usuários.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        initialData={formData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {profile.full_name || 'Sem nome'}
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge variant={profile.role === 'administrador' ? 'default' : 'secondary'}>
                          {profile.role === 'administrador' ? (
                            <ShieldAlert className="mr-1 h-3 w-3" />
                          ) : (
                            <UserIcon className="mr-1 h-3 w-3" />
                          )}
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(profile)}
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {profile.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(profile.id)}
                            title="Remover usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
