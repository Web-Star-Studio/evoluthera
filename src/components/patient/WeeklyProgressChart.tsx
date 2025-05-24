
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target } from "lucide-react";

const WeeklyProgressChart = () => {
  const [weeklyData, setWeeklyData] = useState([
    { day: "Seg", mood: 3, tasks: 2, date: "2024-01-15" },
    { day: "Ter", mood: 4, tasks: 1, date: "2024-01-16" },
    { day: "Qua", mood: 3, tasks: 3, date: "2024-01-17" },
    { day: "Qui", mood: 5, tasks: 2, date: "2024-01-18" },
    { day: "Sex", mood: 4, tasks: 1, date: "2024-01-19" },
    { day: "Sáb", mood: 4, tasks: 0, date: "2024-01-20" },
    { day: "Dom", mood: 5, tasks: 1, date: "2024-01-21" },
  ]);

  const chartConfig = {
    mood: {
      label: "Humor",
      color: "#10b981",
    },
    tasks: {
      label: "Tarefas",
      color: "#3b82f6",
    },
  };

  const averageMood = weeklyData.reduce((sum, day) => sum + day.mood, 0) / weeklyData.length;
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Humor Médio Semanal</p>
                <p className="text-3xl font-bold text-emerald-700">{averageMood.toFixed(1)}</p>
                <p className="text-emerald-600 text-sm">de 5.0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tarefas Completadas</p>
                <p className="text-3xl font-bold text-blue-700">{totalTasks}</p>
                <p className="text-blue-600 text-sm">esta semana</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Humor</CardTitle>
          <CardDescription>Seu humor ao longo da semana (escala de 1 a 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[1, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tasks Completion Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas Completadas</CardTitle>
          <CardDescription>Número de tarefas realizadas por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="tasks" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProgressChart;
