import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

function ShareButtons({ event, url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = `¡Mira este evento! ${event.name}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Error al copiar el enlace');
    }
  };

  const handleShare = (platform) => {
    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  // Web Share API (nativo en móviles)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Botones solo con iconos en una fila */}
      <div className="flex gap-2 justify-center">
        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-md hover:shadow-lg"
          title="Compartir en Facebook"
        >
          <Facebook size={18} />
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full transition shadow-md hover:shadow-lg"
          title="Compartir en WhatsApp"
        >
          <MessageCircle size={18} />
        </button>

        {/* Twitter */}
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center justify-center w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition shadow-md hover:shadow-lg"
          title="Compartir en Twitter"
        >
          <Twitter size={18} />
        </button>

        {/* Copiar enlace */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition shadow-md hover:shadow-lg ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title={copied ? '¡Copiado!' : 'Copiar enlace'}
        >
          <LinkIcon size={18} />
        </button>
      </div>

      {/* URL preview */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">URL del evento:</p>
        <p className="text-xs text-gray-900 truncate font-mono">{shareUrl}</p>
      </div>
    </div>
  );
}

export default ShareButtons;
