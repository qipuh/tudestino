import { useState } from 'react';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { MessageSquare, Users, Image, Video } from 'lucide-react';
import CreateContentSidebar from '../../social/components/CreateContentSidebar';

function AccountSocial() {
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);

  return (
    <UserAccountLayout activeMenu="social">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Muro Social</h1>
          <p className="text-gray-600 mt-1">
            Comparte tus experiencias de viaje y conecta con otros viajeros
          </p>
        </div>

        {/* Create Post Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            <input
              type="text"
              placeholder="¿Qué estás pensando?"
              onClick={() => setShowCreateSidebar(true)}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              readOnly
            />
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowCreateSidebar(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Image size={20} className="text-blue-500" />
              <span className="text-sm font-medium">Foto</span>
            </button>
            <button
              onClick={() => setShowCreateSidebar(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Video size={20} className="text-green-500" />
              <span className="text-sm font-medium">Video</span>
            </button>
          </div>
        </div>

        {/* Posts Feed Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tu muro social está vacío
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza a compartir tus experiencias de viaje y conecta con otros viajeros
          </p>
          <button
            onClick={() => setShowCreateSidebar(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Crear primera publicación
          </button>
        </div>
      </div>

      {/* Create Content Sidebar */}
      <CreateContentSidebar
        isOpen={showCreateSidebar}
        onClose={() => setShowCreateSidebar(false)}
      />
    </UserAccountLayout>
  );
}

export default AccountSocial;
