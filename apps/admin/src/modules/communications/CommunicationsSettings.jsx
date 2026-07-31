import { useState, useEffect } from 'react';
import { Save, Mail, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settings.service';

function CommunicationsSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email
  const [email, setEmail] = useState({
    smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '',
    fromEmail: '', fromName: '', supportEmail: '',
  });
  const [smtpPassConfigured, setSmtpPassConfigured] = useState(false);
  const [smtpPassMasked, setSmtpPassMasked] = useState(null);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // WhatsApp
  const [whatsapp, setWhatsapp] = useState({ factilizaToken: '', factilizaInstance: '', supportPhone: '' });
  const [tokenConfigured, setTokenConfigured] = useState(false);
  const [tokenMasked, setTokenMasked] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [emailData, whatsappData] = await Promise.all([
        settingsService.getEmailSettings(),
        settingsService.getWhatsAppSettings(),
      ]);

      setEmail((prev) => ({
        ...prev,
        smtpHost: emailData.smtpHost || '',
        smtpPort: emailData.smtpPort || '',
        smtpUser: emailData.smtpUser || '',
        fromEmail: emailData.fromEmail || '',
        fromName: emailData.fromName || '',
        supportEmail: emailData.supportEmail || '',
      }));
      setSmtpPassConfigured(emailData.smtpPassConfigured);
      setSmtpPassMasked(emailData.smtpPassMasked);

      setWhatsapp((prev) => ({
        ...prev,
        factilizaInstance: whatsappData.factilizaInstance || '',
        supportPhone: whatsappData.supportPhone || '',
      }));
      setTokenConfigured(whatsappData.factilizaTokenConfigured);
      setTokenMasked(whatsappData.factilizaTokenMasked);

      setError(null);
    } catch (err) {
      console.error('Error fetching communications settings:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    setEmailSuccess(false);
    try {
      const data = await settingsService.updateEmailSettings({
        ...email,
        smtpPass: email.smtpPass.trim() || undefined,
      });
      setSmtpPassConfigured(data.smtpPassConfigured);
      setSmtpPassMasked(data.smtpPassMasked);
      setEmail((prev) => ({ ...prev, smtpPass: '' }));
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la configuración de correo');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveWhatsapp = async (e) => {
    e.preventDefault();
    setSavingWhatsapp(true);
    setWhatsappSuccess(false);
    try {
      const data = await settingsService.updateWhatsAppSettings({
        ...whatsapp,
        factilizaToken: whatsapp.factilizaToken.trim() || undefined,
      });
      setTokenConfigured(data.factilizaTokenConfigured);
      setTokenMasked(data.factilizaTokenMasked);
      setWhatsapp((prev) => ({ ...prev, factilizaToken: '' }));
      setWhatsappSuccess(true);
      setTimeout(() => setWhatsappSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la configuración de WhatsApp');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunicaciones</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configura el correo (notificaciones, verificación, recuperación de contraseña) y WhatsApp.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* Email */}
      <form onSubmit={handleSaveEmail} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Mail size={20} />
          Correo (SMTP)
        </h2>

        {emailSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
            Configuración de correo guardada.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host SMTP</label>
            <input
              type="text"
              value={email.smtpHost}
              onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
              placeholder="smtp.zoho.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
            <input
              type="text"
              value={email.smtpPort}
              onChange={(e) => setEmail({ ...email, smtpPort: e.target.value })}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SMTP</label>
            <input
              type="text"
              value={email.smtpUser}
              onChange={(e) => setEmail({ ...email, smtpUser: e.target.value })}
              placeholder="account@tudestino.pe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña SMTP</label>
            <div className="relative">
              <input
                type={showSmtpPass ? 'text' : 'password'}
                value={email.smtpPass}
                onChange={(e) => setEmail({ ...email, smtpPass: e.target.value })}
                placeholder={smtpPassConfigured ? smtpPassMasked : '••••••••'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSmtpPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remitente (email)</label>
            <input
              type="email"
              value={email.fromEmail}
              onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
              placeholder="account@tudestino.pe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remitente (nombre)</label>
            <input
              type="text"
              value={email.fromName}
              onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
              placeholder="TuDestino"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de soporte (visible para usuarios)</label>
            <input
              type="email"
              value={email.supportEmail}
              onChange={(e) => setEmail({ ...email, supportEmail: e.target.value })}
              placeholder="soporte@tudestino.pe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingEmail}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {savingEmail ? 'Guardando...' : 'Guardar correo'}
        </button>
      </form>

      {/* WhatsApp */}
      <form onSubmit={handleSaveWhatsapp} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle size={20} />
          WhatsApp
        </h2>

        {whatsappSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
            Configuración de WhatsApp guardada.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token de Factiliza (API de envío)</label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={whatsapp.factilizaToken || ''}
              onChange={(e) => setWhatsapp({ ...whatsapp, factilizaToken: e.target.value })}
              placeholder={tokenConfigured ? tokenMasked : 'Token de Factiliza'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {tokenConfigured
              ? 'Ya hay un token configurado. Deja vacío para no cambiarlo.'
              : 'Se usa para enviar códigos de verificación por WhatsApp.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instancia de Factiliza</label>
          <input
            type="text"
            value={whatsapp.factilizaInstance}
            onChange={(e) => setWhatsapp({ ...whatsapp, factilizaInstance: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp de soporte (visible para usuarios)</label>
          <input
            type="text"
            value={whatsapp.supportPhone}
            onChange={(e) => setWhatsapp({ ...whatsapp, supportPhone: e.target.value })}
            placeholder="+51999999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={savingWhatsapp}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {savingWhatsapp ? 'Guardando...' : 'Guardar WhatsApp'}
        </button>
      </form>
    </div>
  );
}

export default CommunicationsSettings;
