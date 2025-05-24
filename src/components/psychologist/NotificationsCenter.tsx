
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2 } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  date: string;
  type?: string;
  read?: boolean;
}

const NotificationsCenter = () => {
  // Adicionar algumas notificações de exemplo relacionadas aos testes psicológicos
  const sampleNotifications = [
    {
      id: Date.now() + 1,
      message: "Maria Silva completou o teste PHQ-9 com pontuação 12 (moderada)",
      date: new Date().toLocaleDateString('pt-BR'),
      type: "warning",
      read: false
    },
    {
      id: Date.now() + 2,
      message: "João Pereira iniciou o teste BDI-II há 2 horas sem finalizar",
      date: new Date().toLocaleDateString('pt-BR'),
      type: "info",
      read: false
    },
    {
      id: Date.now() + 3,
      message: "Ana Souza obteve melhoria significativa no teste BAI (de 25 para 12 pontos)",
      date: new Date().toLocaleDateString('pt-BR'),
      type: "success",
      read: false
    }
  ];

  const [notificationsList, setNotificationsList] = useState<Notification[]>(sampleNotifications);

  const getNotificationIcon = (type: string = "info") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string = "info") => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const markAsRead = (id: number) => {
    setNotificationsList(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotificationsList(prev =>
      prev.filter(notif => notif.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notificationsList.filter(notif => !notif.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">Acompanhe atualizações importantes dos seus pacientes</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Marcar Todas como Lidas
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notificationsList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-2xl font-bold">
                  {notificationsList.filter(n => n.type === "warning" || n.type === "error").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Positivas</p>
                <p className="text-2xl font-bold">
                  {notificationsList.filter(n => n.type === "success").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
          <CardDescription>
            Últimas atualizações sobre seus pacientes e testes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationsList.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-l-4 rounded-lg ${getNotificationColor(notification.type)} ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notificationsList.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsCenter;
