import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Lock, CheckCircle, AlertCircle, Clock, ArrowLeft, X, RefreshCw } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onPasswordResetSuccess?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onPasswordResetSuccess
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // 10-minute countdown timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError('');
      setSuccessMsg('');
      setStep('request');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTimerActive(false);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Zadejte prosím platnou e-mailovou adresu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Odeslání kódu se nezdařilo.');
      }

      setSuccessMsg('Ověřovací kód byl odeslán na váš e-mail.');
      setStep('verify');
      setTimeLeft(600); // 10 minutes
      setTimerActive(true);
    } catch (err: any) {
      setError(err.message || 'Došlo k chybě při komunikaci se serverem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Ověřovací kód musí mít 6 číslic.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Nové heslo musí mít alespoň 4 znaky.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Zadaná hesla se neshodují.');
      return;
    }

    if (timeLeft <= 0) {
      setError('Platnost ověřovacího kódu vypršela. Vyžádejte si prosím nový kód.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: cleanCode,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Změna hesla se nezdařila.');
      }

      setStep('success');
      setTimerActive(false);
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(email.trim().toLowerCase());
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při změně hesla.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="forgot-password-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-[#002B49] text-white p-6 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Zavřít"
          >
            <X size={20} />
          </button>
          <div className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound size={28} className="text-brand-red" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Obnova zapomenutého hesla</h3>
          <p className="text-blue-200 text-xs mt-1">
            Nastavení nového hesla pro klientský a školní portál
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Zadejte e-mailovou adresu, kterou jste uvedli při registraci. Zašleme vám na ni <strong>šestimístný kód</strong> s platností na <strong>10 minut</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Váš e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas-email@priklad.cz"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B49] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Odesílám kód...</span>
                  </>
                ) : (
                  <span>Odeslat ověřovací kód</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
                >
                  Zpět na přihlášení
                </button>
              </div>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-700" />
                  <span>Kód odeslán na: <strong>{email}</strong></span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-brand-red bg-white px-2 py-0.5 rounded border border-blue-200">
                  <Clock size={12} />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              {successMsg && (
                <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200 flex items-center gap-1.5 font-medium">
                  <CheckCircle size={15} />
                  {successMsg}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  6místný ověřovací kód z e-mailu
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-2xl font-bold py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nové heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimálně 4 znaky"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B49] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Potvrzení nového hesla
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Zadejte heslo znovu"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B49] outline-none text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || timeLeft <= 0}
                className="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Ukládám nové heslo...</span>
                  </>
                ) : (
                  <span>Nastavit nové heslo</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft size={14} />
                  Změnit e-mail
                </button>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={isLoading}
                  className="text-brand-blue hover:underline font-bold"
                >
                  Znovu poslat kód
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Heslo úspěšně změněno!</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Vaše nové heslo bylo uloženo do databáze. Nyní se můžete přihlásit do svého účtu.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#002B49] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
              >
                Přejít k přihlášení
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
