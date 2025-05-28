
import React from "react";
import { Target, Calendar } from "lucide-react";
import { PatientData } from "./types";

interface PatientStatsProps {
  patient: PatientData;
}

const PatientStats = ({ patient }: PatientStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tarefas</span>
          <Target className="h-4 w-4 text-blue-500" />
        </div>
        <div className="font-semibold text-lg">
          {patient.patient_stats?.tasks_completed || 0}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sequência</span>
          <Calendar className="h-4 w-4 text-orange-500" />
        </div>
        <div className="font-semibold text-lg">
          {patient.patient_stats?.streak_days || 0} dias
        </div>
      </div>
    </div>
  );
};

export default PatientStats;
