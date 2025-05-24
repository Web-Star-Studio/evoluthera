
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("patient");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register logic
    switch (userType) {
      case "patient":
        navigate("/patient-dashboard");
        break;
      case "psychologist":
        navigate("/psychologist-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Evolua</h1>
          </Link>
          <p className="text-gray-600">Sua jornada de bem-estar começa aqui</p>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription>
              {isLogin ? "Acesse sua conta" : "Junte-se à nossa plataforma"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" type="text" required />
                  </div>
                  
                  <div>
                    <Label>Tipo de usuário</Label>
                    <RadioGroup value={userType} onValueChange={setUserType} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patient" id="patient" />
                        <Label htmlFor="patient">Paciente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="psychologist" id="psychologist" />
                        <Label htmlFor="psychologist">Psicólogo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">Administrador</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required />
              </div>
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                {isLogin ? "Criar nova conta" : "Já tenho uma conta"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
