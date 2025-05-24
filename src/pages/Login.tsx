
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Entrar na Evolut</h1>
            <p className="text-gray-600">Acesse sua conta para continuar</p>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default Login;
