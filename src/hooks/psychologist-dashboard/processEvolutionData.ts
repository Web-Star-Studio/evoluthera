
import { EvolutionData } from './types';

export const processEvolutionData = (moodData: any[], tasksData: any[]): EvolutionData[] => {
  const evolutionData: EvolutionData[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayMoods = moodData.filter(mood => 
      mood.created_at.startsWith(dateStr)
    );
    
    const averageMood = dayMoods.length > 0 
      ? dayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / dayMoods.length
      : 0;
    
    const dayTasks = tasksData.filter(task => 
      task.completed_at && task.completed_at.startsWith(dateStr)
    );

    evolutionData.push({
      date: dateStr,
      averageMood: Number(averageMood.toFixed(1)),
      activePatients: dayMoods.length > 0 ? new Set(dayMoods.map(m => m.patient_id)).size : 0,
      completedTasks: dayTasks.length
    });
  }

  return evolutionData;
};
