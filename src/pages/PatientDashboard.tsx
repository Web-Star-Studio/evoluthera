
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import MoodTracker from "@/components/patient/MoodTracker";
import DiaryEntry from "@/components/patient/DiaryEntry";
import TasksList from "@/components/patient/TasksList";
import WeeklyProgressChart from "@/components/patient/WeeklyProgressChart";
import SimplifiedMoodChart from "@/components/patient/SimplifiedMoodChart";
import GamificationCard from "@/components/patient/GamificationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, BookOpen, Target, TrendingUp, Award, BarChart3 } from "lucide-react";

const PatientDashboard = () => {
  const [activeStreak, setActiveStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(120);
  const [weeklyMoodAverage, setWeeklyMoodAverage] = useState(4.2);
  const [completedTasks, setCompletedTasks] = useState(5);
  const [totalTasks, setTotalTasks] = useState(8);

  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Bem-Estar</h1>
          <p className="text-gray-600">Como você está se sentindo hoje?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">{weeklyMoodAverage}</div>
              <p className="text-sm text-emerald-600">Humor Médio</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{completedTasks}/{totalTasks}</div>
              <p className="text-sm text-blue-600">Tarefas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{activeStreak}</div>
              <p className="text-sm text-purple-600">Dias Seguidos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{totalPoints}</div>
              <p className="text-sm text-orange-600">Pontos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Humor
            </TabsTrigger>
            <TabsTrigger value="diary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Diário
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-6">
            <MoodTracker />
          </TabsContent>

          <TabsContent value="diary" className="mt-6">
            <DiaryEntry />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TasksList />
          </TabsContent>

          <TabsContent value="evolution" className="mt-6">
            <SimplifiedMoodChart />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <WeeklyProgressChart />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <GamificationCard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
