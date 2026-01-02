import { Calendar, User, Edit, Trash2, Plus, DollarSign, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const activityIcons = {
  reservation: Calendar,
  review: Star,
  edit: Edit,
  delete: Trash2,
  create: Plus,
  payment: DollarSign,
  default: Calendar
};

const activityColors = {
  reservation: 'bg-blue-100 text-blue-600',
  review: 'bg-yellow-100 text-yellow-600',
  edit: 'bg-purple-100 text-purple-600',
  delete: 'bg-red-100 text-red-600',
  create: 'bg-green-100 text-green-600',
  payment: 'bg-emerald-100 text-emerald-600',
  default: 'bg-gray-100 text-gray-600'
};

function ActivityFeed({ activities = [], title = "Actividad Reciente" }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || activityIcons.default;
          const colorClass = activityColors[activity.type] || activityColors.default;

          return (
            <div key={activity.id || index} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    Por {activity.user.name || 'Usuario'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {activity.createdAt
                    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: es })
                    : 'Reciente'
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityFeed;
