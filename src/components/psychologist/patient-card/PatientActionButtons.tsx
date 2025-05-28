
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, TrendingUp } from "lucide-react";

interface PatientActionButtonsProps {
  onAiClick: () => void;
  onMoodClick: () => void;
}

const PatientActionButtons = ({ onAiClick, onMoodClick }: PatientActionButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onAiClick}
        className="flex items-center gap-1"
      >
        <Brain className="h-3 w-3" />
        IA
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-1"
      >
        <MessageSquare className="h-3 w-3" />
        Chat
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onMoodClick}
        className="flex items-center gap-1"
      >
        <TrendingUp className="h-3 w-3" />
        Mood
      </Button>
    </div>
  );
};

export default PatientActionButtons;
