
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const moodOptions = [
    { value: 1, emoji: "😢", label: "Muito Triste", color: "text-red-500" },
    { value: 2, emoji: "😔", label: "Triste", color: "text-orange-500" },
    { value: 3, emoji: "😐", label: "Neutro", color: "text-yellow-500" },
    { value: 4, emoji: "😊", label: "Feliz", color: "text-green-500" },
    { value: 5, emoji: "😁", label: "Muito Feliz", color: "text-emerald-500" },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Selecione um humor",
        description: "Por favor, escolha como você está se sentindo hoje.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("mood_records")
        .insert({
          mood_score: selectedMood,
          notes: notes || null,
          patient_id: "temp-user-id", // Substituir por auth.uid() quando autenticação estiver implementada
        });

      if (error) throw error;

      toast({
        title: "Humor registrado!",
        description: "Seu humor foi salvo com sucesso.",
      });

      setSelectedMood(null);
      setNotes("");
    } catch (error) {
      console.error("Erro ao salvar humor:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível registrar seu humor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">Como você está se sentindo hoje?</CardTitle>
        <CardDescription>
          Registre seu humor diário para acompanhar sua evolução emocional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="grid grid-cols-5 gap-4">
          {moodOptions.map((mood) => (
            <div key={mood.value} className="text-center">
              <button
                onClick={() => setSelectedMood(mood.value)}
                className={`w-full p-4 rounded-xl transition-all duration-200 ${
                  selectedMood === mood.value
                    ? "bg-emerald-100 border-2 border-emerald-500 scale-105"
                    : "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className={`text-sm font-medium ${mood.color}`}>
                  {mood.label}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label htmlFor="mood-notes" className="text-sm font-medium text-gray-700">
            Observações (opcional)
          </label>
          <Textarea
            id="mood-notes"
            placeholder="Como foi seu dia? O que influenciou seu humor?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? "Salvando..." : "Registrar Humor"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
