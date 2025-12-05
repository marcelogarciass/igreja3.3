'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    churchName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function canReachSupabaseHost() {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      if (!url) return false
      await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const reachable = await canReachSupabaseHost()
      if (!reachable) {
        setError('Falha de rede ao conectar ao Supabase. Verifique a URL em .env.local e sua conexão.')
        setLoading(false)
        return
      }
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // 2. Create church
        const { data: churchData, error: churchError } = await supabase
          .from('churches')
          .insert([{
            name: formData.churchName,
          }])
          .select()
          .single()

        if (churchError) {
          setError('Erro ao criar igreja: ' + churchError.message)
          return
        }

        // 3. Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            church_id: churchData.id,
            email: formData.email,
            name: formData.userName,
            role: 'admin'
          }])

        if (userError) {
          setError('Erro ao criar perfil: ' + userError.message)
          return
        }

        router.push('/dashboard')
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Falha de rede ao conectar ao Supabase. Tente novamente em instantes.')
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Cadastro</CardTitle>
          <CardDescription>
            Crie sua conta e configure sua igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Igreja
              </label>
              <Input
                id="churchName"
                name="churchName"
                type="text"
                value={formData.churchName}
                onChange={handleInputChange}
                required
                placeholder="Igreja Batista Central"
              />
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome
              </label>
              <Input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleInputChange}
                required
                placeholder="João Silva"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <a href="/login" className="font-medium text-primary hover:underline">
                Faça login aqui
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
