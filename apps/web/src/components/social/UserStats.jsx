import { Users, UserCheck, Video, Heart } from 'lucide-react';

function UserStats({
  followersCount = 0,
  followingCount = 0,
  reelsCount = 0,
  totalLikes = 0,
  onFollowersClick,
  onFollowingClick
}) {
  const stats = [
    {
      label: 'Seguidores',
      value: followersCount,
      icon: Users,
      color: 'text-primary',
      onClick: onFollowersClick,
      clickable: true
    },
    {
      label: 'Siguiendo',
      value: followingCount,
      icon: UserCheck,
      color: 'text-primary-dark',
      onClick: onFollowingClick,
      clickable: true
    },
    {
      label: 'Reels',
      value: reelsCount,
      icon: Video,
      color: 'text-primary',
      clickable: false
    },
    {
      label: 'Likes',
      value: totalLikes,
      icon: Heart,
      color: 'text-red-600',
      clickable: false
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const content = (
          <>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2 ${stat.color}`}>
              <Icon size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stat.value)}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </>
        );

        if (stat.clickable && stat.onClick) {
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition text-center"
            >
              {content}
            </button>
          );
        }

        return (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow text-center">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default UserStats;
