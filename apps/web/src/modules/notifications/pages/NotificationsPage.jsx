import { Bell, Check, Heart, MessageSquare, Calendar, Briefcase } from 'lucide-react';

function NotificationsPage() {
  // Placeholder notifications
  const notifications = [
    {
      id: 1,
      type: 'message',
      icon: MessageSquare,
      title: 'Nuevo mensaje',
      description: 'Tienes un nuevo mensaje en tu bandeja',
      time: 'Hace 5 minutos',
      read: false,
    },
    {
      id: 2,
      type: 'booking',
      icon: Calendar,
      title: 'Reserva confirmada',
      description: 'Tu reserva ha sido confirmada',
      time: 'Hace 1 hora',
      read: false,
    },
    {
      id: 3,
      type: 'like',
      icon: Heart,
      title: 'Me gusta en tu publicación',
      description: 'A alguien le gustó tu publicación',
      time: 'Hace 2 horas',
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
              <p className="text-gray-600 mt-1">
                Mantente al día con todas tus actualizaciones
              </p>
            </div>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              Marcar todas como leídas
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-gray-600">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          className={!notification.read ? 'text-blue-600' : 'text-gray-600'}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
