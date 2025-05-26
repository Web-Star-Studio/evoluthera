import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_BASE_URL =
  (import.meta as any).env.VITE_SUPABASE_FUNCTIONS_URL ||
  "https://phjpyojetgxfsmqhhjfa.supabase.co/functions/v1";
const INVITE_FUNCTION_URL = `${FUNCTIONS_BASE_URL}/generate-invite-link`;

export const InvitePatientButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setInviteUrl(null);
    try {
      // Obter token atual da sessão
      // Evita depender do nome de chave no localStorage
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Token de autenticação não encontrado.");
      const res = await fetch(INVITE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const resp = await res.json();
      if (!res.ok || !resp.url) {
        throw new Error(resp.error || "Erro ao gerar link de convite.");
      }
      setInviteUrl(resp.url);
      toast({
        title: "Link gerado com sucesso!",
        description: "Copie e envie para o paciente.",
      });
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
      toast({
        title: "Erro ao gerar link",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={handleGenerate} disabled={loading}>
          ➕ Gerar link de convite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar link de convite</DialogTitle>
          <DialogDescription>
            Gere um link único para convidar um paciente. O link expira em 24h ou após o cadastro.
          </DialogDescription>
        </DialogHeader>
        {loading && <p className="text-sm text-muted-foreground">Gerando link...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {inviteUrl && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm bg-muted"
              value={inviteUrl}
              readOnly
              onFocus={e => e.target.select()}
            />
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" /> Copiar link
            </Button>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePatientButton; 