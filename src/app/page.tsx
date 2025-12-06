import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Church, Users, DollarSign, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Church className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Nexus Igreja
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema robusto de gestão financeira multi-tenant para igrejas
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Gestão Financeira</CardTitle>
              <CardDescription>
                Controle completo de entradas, saídas e relatórios financeiros
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Gestão de Membros</CardTitle>
              <CardDescription>
                Cadastro e controle de membros com diferentes níveis de acesso
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Relatórios e KPIs</CardTitle>
              <CardDescription>
                Dashboard com indicadores em tempo real e gráficos interativos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Comece Agora</CardTitle>
              <CardDescription>
                Acesse o sistema ou crie uma nova conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login" prefetch={false}>
                <Button className="w-full" size="lg">
                  Fazer Login
                </Button>
              </Link>
              <Link href="/register" prefetch={false}>
                <Button variant="outline" className="w-full" size="lg">
                  Criar Conta
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
