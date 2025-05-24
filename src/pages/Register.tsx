
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Brain, Users, Shield, CheckCircle } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [crp, setCrp] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/psychologist-dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, { 
        name, 
        user_type: 'psychologist',
        crp 
      });
      // Success message and redirect will be handled by the auth context
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/af7620ff-fa7a-44e1-b147-674b8fe0caca.png" alt="Evolut Logo" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Já tem conta?</span>
              <Button asChild variant="outline">
                <Link to="/login">Fazer Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Crie sua conta <span className="text-blue-600">gratuita</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Transforme sua prática terapêutica com a Evolut
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Insights Inteligentes</h3>
                    <p className="text-gray-600">Acompanhe o progresso dos seus pacientes com dados precisos</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestão de Pacientes</h3>
                    <p className="text-gray-600">Prontuários digitais e acompanhamento contínuo</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Segurança Total</h3>
                    <p className="text-gray-600">Dados protegidos e conformidade com LGPD</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sem Taxa de Adesão</h3>
                    <p className="text-gray-600">Pague apenas R$20/mês por paciente ativo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Registro para Psicólogos</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para criar sua conta gratuita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email profissional *</Label>
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
                    <Label htmlFor="crp">CRP (Conselho Regional de Psicologia)</Label>
                    <Input 
                      id="crp" 
                      type="text" 
                      value={crp}
                      onChange={(e) => setCrp(e.target.value)}
                      placeholder="Ex: 06/12345"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a senha novamente"
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar conta gratuita"}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Ao criar sua conta, você concorda com nossos{" "}
                    <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a>{" "}
                    e{" "}
                    <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-gray-600">Já tem uma conta? </span>
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 underline">
                    Fazer login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
