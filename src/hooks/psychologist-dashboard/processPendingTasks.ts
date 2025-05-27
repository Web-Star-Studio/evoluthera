
import { PendingTask } from './types';

export const processPendingTasks = (tasksData: any[]): PendingTask[] => {
  return tasksData
    .filter(task => task.status === 'completed' && !task.psychologist_comment)
    .slice(0, 10)
    .map(task => ({
      id: task.id,
      title: task.title,
      patientName: task.profiles?.name || 'Paciente',
      patientId: task.patient_id,
      priority: task.priority || 'normal',
      dueDate: task.due_date,
      status: task.status
    }));
};
