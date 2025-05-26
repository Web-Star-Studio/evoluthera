import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_BASE_URL =
  (import.meta as any).env.VITE_SUPABASE_FUNCTIONS_URL ||
  "https://phjpyojetgxfsmqhhjfa.supabase.co/functions/v1";

const InviteRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [psychologistId, setPsychologistId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`${FUNCTIONS_BASE_URL}/validate-invite-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.valid) {
          setValid(true);
          setPsychologistId(data.psychologist_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${FUNCTIONS_BASE_URL}/consume-invite-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao concluir cadastro");

      // Login automático
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Bem-vindo!",
        description: "Cadastro concluído com sucesso.",
      });
      navigate("/patient-dashboard");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Carregando...</p>;
  }

  if (!valid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <CardTitle className="text-xl">Link inválido ou expirado</CardTitle>
            <p>Tente solicitar um novo link ao seu psicólogo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Conclusão de Cadastro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Concluir Cadastro
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegistration; 