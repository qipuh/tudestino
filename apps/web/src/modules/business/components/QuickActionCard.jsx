import { Link } from 'react-router-dom';

function QuickActionCard({ icon: Icon, title, description, to, onClick, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary hover:bg-primary-dark',
    green: 'bg-green-600 hover:bg-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    gray: 'bg-gray-600 hover:bg-gray-700',
  };

  const content = (
    <>
      <div className={`${colorClasses[color]} text-white p-4 rounded-lg mb-4 inline-block`}>
        <Icon size={32} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all block group"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all w-full text-left group"
    >
      {content}
    </button>
  );
}

export default QuickActionCard;
