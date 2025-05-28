
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const getMoodColor = (avgMood: number) => {
  if (avgMood >= 4) return "text-green-600 bg-green-50";
  if (avgMood >= 3) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export const getMoodIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export const getActivityStatus = (lastActivity: string | null) => {
  if (!lastActivity) {
    return { text: "Nunca ativo", color: "bg-gray-100 text-gray-600" };
  }

  const lastActivityDate = new Date(lastActivity);
  const daysSinceActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceActivity === 0) {
    return { text: "Ativo hoje", color: "bg-green-100 text-green-800" };
  }
  if (daysSinceActivity <= 3) {
    return { text: `${daysSinceActivity}d atrás`, color: "bg-yellow-100 text-yellow-800" };
  }
  return { text: `${daysSinceActivity}d atrás`, color: "bg-red-100 text-red-800" };
};
