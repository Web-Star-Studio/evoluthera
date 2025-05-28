
import React from "react";
import { getMoodColor, getMoodIcon } from "./utils";
import { PatientData } from "./types";

interface PatientMoodSectionProps {
  patient: PatientData;
}

const PatientMoodSection = ({ patient }: PatientMoodSectionProps) => {
  const avgMood = patient.mood_analytics?.avg_mood || 0;
  const moodRecords = patient.mood_analytics?.total_mood_records || 0;

  if (moodRecords === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Humor Médio</span>
        {getMoodIcon(patient.mood_analytics?.mood_trend || 'stable')}
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-full text-sm font-medium ${getMoodColor(avgMood)}`}>
          {avgMood.toFixed(1)}/5
        </div>
        <span className="text-xs text-gray-600">
          {moodRecords} registros
        </span>
      </div>
    </div>
  );
};

export default PatientMoodSection;
