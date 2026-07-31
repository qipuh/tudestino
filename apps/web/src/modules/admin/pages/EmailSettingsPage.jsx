import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, AlertTriangle, Send, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import adminService from '../services/adminService';

const emptyForm = {
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
  fromName: 'TuDestino',
  supportEmail: '',
};

function EmailSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [passConfigured, setPassConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, message: string }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEmailSettings();
      const data = response.data;
      setForm({
        smtpHost: data.smtpHost || '',
        smtpPort: data.smtpPort || '587',
        smtpUser: data.smtpUser || '',
        smtpPass: '',
        fromEmail: data.fromEmail || '',
        fromName: data.fromName || 'TuDestino',
        supportEmail: data.supportEmail || '',
      });
      setPassConfigured(data.smtpPassConfigured);
    } catch (err) {
      console.error('Error loading email settings:', err);
      setError('No se pudo cargar la configuración de correo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSaved(false);

      const payload = { ...form };
      // No mandar el password vacío - así no se pisa el guardado si el
      // admin solo quiere cambiar otro campo.
      if (!payload.smtpPass) delete payload.smtpPass;

      const response = await adminService.updateEmailSettings(payload);
      const data = response.data;
      setForm((prev) => ({ ...prev, smtpPass: '' }));
      setPassConfigured(data.smtpPassConfigured);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving email settings:', err);
      setError(err.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;

    try {
      setTestSending(true);
      setTestResult(null);
      const response = await adminService.sendTestEmail(testEmail);
      setTestResult({ ok: true, message: response.message || 'Correo de prueba enviado' });
    } catch (err) {
      setTestResult({
        ok: false,
        message: err.response?.data?.message || 'Error al enviar el correo de prueba',
      });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-mute hover:text-ink mb-4">
          <ArrowLeft size={16} />
          Volver al panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Configuración de Correo</h1>
            <p className="text-sm text-mute">SMTP usado para verificación de cuenta y recuperación de contraseña</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-line p-6 mb-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Servidor SMTP</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">Host SMTP</label>
                <input
                  type="text"
                  value={form.smtpHost}
                  onChange={handleChange('smtpHost')}
                  placeholder="mail.tudominio.com"
                  className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Puerto</label>
                <input
                  type="number"
                  value={form.smtpPort}
                  onChange={handleChange('smtpPort')}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Usuario SMTP</label>
              <input
                type="text"
                value={form.smtpUser}
                onChange={handleChange('smtpUser')}
                placeholder="correo@tudominio.com"
                className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Contraseña SMTP
                {passConfigured && (
                  <span className="ml-2 text-xs font-normal text-green-600">(ya configurada)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.smtpPass}
                  onChange={handleChange('smtpPass')}
                  placeholder={passConfigured ? '••••••••••••' : 'Contraseña'}
                  className="w-full px-3 py-2 pr-10 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-mute">Deja vacío para mantener la contraseña actual</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Correo remitente</label>
                <input
                  type="email"
                  value={form.fromEmail}
                  onChange={handleChange('fromEmail')}
                  placeholder="no-reply@tudominio.com"
                  className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Nombre remitente</label>
                <input
                  type="text"
                  value={form.fromName}
                  onChange={handleChange('fromName')}
                  placeholder="TuDestino"
                  className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Correo de soporte (público)</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={handleChange('supportEmail')}
                placeholder="soporte@tudominio.com"
                className="w-full px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle size={16} className="flex-shrink-0" />
              Configuración guardada
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t border-line">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-line p-6">
          <h2 className="text-lg font-semibold text-ink mb-2">Probar Configuración</h2>
          <p className="text-sm text-mute mb-4">
            Envía un correo de prueba real para confirmar que las credenciales SMTP funcionan.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="destino@ejemplo.com"
              className="flex-1 px-3 py-2 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <button
              onClick={handleTestEmail}
              disabled={testSending || !testEmail}
              className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {testSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar prueba
            </button>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 mt-4 p-3 rounded-xl text-sm ${
                testResult.ok
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle size={16} className="flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="flex-shrink-0" />
              )}
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailSettingsPage;
