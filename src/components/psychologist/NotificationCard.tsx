
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from "lucide-react";

interface Notification {
  id: string;
  type: 'task_pending' | 'new_response' | 'mood_alert' | 'session_reminder';
  title: string;
  message: string;
  patientName?: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationCardProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationCard = ({ notifications, onMarkAsRead }: NotificationCardProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'task_pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'new_response':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'mood_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'session_reminder':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task_pending':
        return 'Tarefa Pendente';
      case 'new_response':
        return 'Nova Resposta';
      case 'mood_alert':
        return 'Alerta de Humor';
      case 'session_reminder':
        return 'Lembrete';
      default:
        return 'Notificação';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notificações</span>
          <Badge variant="secondary">{notifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.patientName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Paciente: {notification.patientName}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        {notification.actionLabel && notification.onAction && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={notification.onAction}
                            className="text-xs"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs"
                        >
                          Marcar como lida
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma notificação pendente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
