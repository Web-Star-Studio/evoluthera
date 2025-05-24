
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTestData } from "@/hooks/useTestData";
import { useEffect } from "react";
import { User, Stethoscope, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { 
    createTestPatient, 
    createTestPsychologist, 
    createTestAdmin, 
    loginAsDemoUser, 
    loading: testLoading 
  } = useTestData();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllDemoAccounts = async () => {
    try {
      await createTestPatient();
      await createTestPsychologist();
      await createTestAdmin();
    } catch (error) {
      console.error('Error creating demo accounts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #1893f8)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/af7620ff-fa7a-44e1-b147-674b8fe0caca.png" alt="Evolut Logo" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Novo por aqui?</span>
              <Button asChild variant="outline">
                <Link to="/register">Criar conta gratuita</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Entrar na Evolut</h1>
            <p className="text-gray-600">Acesse sua conta ou teste com uma conta demo</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full text-white"
                    style={{ backgroundColor: '#1893f8' }}
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline text-sm" style={{ color: '#1893f8' }}>
                    Esqueceu sua senha?
                  </a>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-gray-600">Não tem uma conta? </span>
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 underline" style={{ color: '#1893f8' }}>
                    Criar conta gratuita
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Demo Accounts */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" style={{ color: '#1893f8' }} />
                  Contas Demo
                </CardTitle>
                <CardDescription>
                  Acesse rapidamente com contas de demonstração pré-configuradas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Demo User Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => loginAsDemoUser('patient')}
                    disabled={testLoading}
                    variant="outline"
                    className="w-full justify-start gap-3 p-4 h-auto"
                  >
                    <User className="h-5 w-5 text-pink-600" />
                    <div className="text-left">
                      <div className="font-medium">Entrar como Paciente</div>
                      <div className="text-sm text-gray-500">paciente.demo@evolut.com</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => loginAsDemoUser('psychologist')}
                    disabled={testLoading}
                    variant="outline"
                    className="w-full justify-start gap-3 p-4 h-auto"
                  >
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Entrar como Psicólogo</div>
                      <div className="text-sm text-gray-500">psicologo.demo@evolut.com</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => loginAsDemoUser('admin')}
                    disabled={testLoading}
                    variant="outline"
                    className="w-full justify-start gap-3 p-4 h-auto"
                  >
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Entrar como Admin</div>
                      <div className="text-sm text-gray-500">admin.demo@evolut.com</div>
                    </div>
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Configuração Inicial</h4>
                  <Button
                    onClick={handleCreateAllDemoAccounts}
                    disabled={testLoading}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: '#1893f8', color: '#1893f8' }}
                  >
                    {testLoading ? "Criando..." : "Criar Todas as Contas Demo"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Cria/atualiza as contas demo com dados fictícios para demonstração
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Credenciais Demo</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div><strong>Senha para todas:</strong> demo123</div>
                    <div>• Paciente: Maria Silva</div>
                    <div>• Psicólogo: Dr. João Santos</div>
                    <div>• Admin: Admin Sistema</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
