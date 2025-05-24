
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, User, Stethoscope, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const { profile } = useAuth();

  const getDashboardRoute = (userType: string) => {
    switch (userType) {
      case 'patient':
        return '/patient-dashboard';
      case 'psychologist':
        return '/psychologist-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'patient':
        return <User className="h-5 w-5 text-pink-600" />;
      case 'psychologist':
        return <Stethoscope className="h-5 w-5 text-green-600" />;
      case 'admin':
        return <Settings className="h-5 w-5 text-purple-600" />;
      default:
        return <Shield className="h-8 w-8 text-red-600" />;
    }
  };

  const getUserTypeName = (userType: string) => {
    switch (userType) {
      case 'patient':
        return 'Paciente';
      case 'psychologist':
        return 'Psicólogo';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          
          {profile && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getUserTypeIcon(profile.user_type)}
                <span className="font-medium text-blue-900">
                  Logado como: {getUserTypeName(profile.user_type)}
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {profile.name}
              </p>
              <Button asChild className="w-full" style={{ backgroundColor: '#1893f8' }}>
                <Link to={getDashboardRoute(profile.user_type)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ir para Meu Dashboard
                </Link>
              </Button>
            </div>
          )}
          
          {!profile && (
            <Button asChild className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Fazer Login
              </Link>
            </Button>
          )}
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
