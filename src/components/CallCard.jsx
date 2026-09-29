import { useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { PhoneIcon, CheckIcon, LoopMark } from './Icons.jsx';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_4501m3pt08mcfe0b9ht61n44xv67';
const LEADS_WEBHOOK_URL = import.meta.env.VITE_LEADS_WEBHOOK_URL;
const PHONE_LINE = import.meta.env.VITE_PHONE_LINE || '[NÚMERO DE LÍNEA]';

const formatPhone = (digits) =>
  digits.length > 6 ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits;

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

async function saveLead(whatsapp) {
  if (!LEADS_WEBHOOK_URL) return;
  try {
    await fetch(LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp, consent: true, createdAt: new Date().toISOString() }),
    });
  } catch {
    // No bloqueamos la llamada si el registro falla.
  }
}

export default function CallCard({ id, compact = false }) {
  const [step, setStep] = useState('phone'); // phone | call | done
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [lastAgentLine, setLastAgentLine] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const wasConnected = useRef(false);
  const whatsappRef = useRef('');

  const conversation = useConversation({
    micMuted: muted,
    onConnect: () => {
      wasConnected.current = true;
      // Le damos contexto a Ramon sin interrumpir su saludo.
      conversation.sendContextualUpdate?.(
        `El usuario ya registró su número de WhatsApp: ${whatsappRef.current}. No se lo vuelvas a pedir; úsalo para enviarle el resumen de la solicitud.`
      );
    },
    onDisconnect: () => {
      if (wasConnected.current) setStep('done');
      wasConnected.current = false;
    },
    onMessage: ({ message, source }) => {
      if (source === 'ai') setLastAgentLine(message);
    },
    onError: (err) => {
      console.error(err);
      setError('No pudimos conectar la llamada. Intente de nuevo en un momento.');
      setStep('phone');
    },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    if (status !== 'connected') return undefined;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const onPhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
    setError('');
  };

  const startCall = async (e) => {
    e.preventDefault();
    if (!/^3\d{9}$/.test(phone)) {
      setError('Escriba un celular de 10 dígitos que empiece por 3.');
      return;
    }
    if (!consent) {
      setError('Para continuar, marque la casilla de autorización.');
      return;
    }
    setError('');
    whatsappRef.current = `+57${phone}`;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Necesitamos permiso para usar su micrófono. Actívelo en el navegador y vuelva a intentarlo.');
      return;
    }

    setLastAgentLine('');
    setMuted(false);
    setStep('call');
    saveLead(whatsappRef.current);

    try {
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' });
    } catch (err) {
      console.error(err);
      setError('No pudimos conectar la llamada. Intente de nuevo en un momento.');
      setStep('phone');
    }
  };

  const hangUp = async () => {
    await conversation.endSession();
    setStep('done');
  };

  const restart = () => {
    setStep('phone');
    setPhone('');
    setConsent(false);
    setError('');
  };

  const connecting = status !== 'connected';

  return (
    <div className={`call-card${compact ? ' call-card--compact' : ''}`} id={id}>
      {step === 'phone' && (
        <form className="stack" onSubmit={startCall} noValidate>
          <div className="stack stack--tight">
            <h2 className="call-card__title">Hablemos ahora</h2>
            <p className="muted">Primero escriba su WhatsApp. Ahí le enviaremos el resumen de lo que pidió.</p>
          </div>
          <label htmlFor={`${id}-wa`} className="label">Su número de WhatsApp</label>
          <div className={`phone-field${error ? ' phone-field--error' : ''}`}>
            <span className="phone-field__prefix" aria-hidden="true">+57</span>
            <input
              id={`${id}-wa`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="300 123 4567"
              value={formatPhone(phone)}
              onChange={onPhoneChange}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-err` : undefined}
            />
          </div>
          {error && (
            <p id={`${id}-err`} role="alert" className="error">{error}</p>
          )}
          <label className="consent">
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(''); }} />
            <span>Acepto que usen mis datos para gestionar mi trámite y escribirme por WhatsApp.</span>
          </label>
          <button type="submit" className="btn btn--lime btn--block">
            <PhoneIcon /> Hablar con Ramon
          </button>
          <p className="muted center small">¿Prefiere marcar? Llame al <strong>{PHONE_LINE}</strong></p>
        </form>
      )}

      {step === 'call' && (
        <div className="stack center-items" aria-live="polite">
          <div className={`orb${isSpeaking ? ' orb--speaking' : ''}`}>
            <div className="orb__core"><LoopMark color="#FFFFFF" size={64} /></div>
          </div>
          <div className="stack stack--tight center">
            <h2 className="call-card__title">{connecting ? 'Conectando con Ramon…' : 'En llamada con Ramon'}</h2>
            <p className="muted">
              {connecting ? 'Un momento, por favor.' : `${isSpeaking ? 'Ramon está hablando' : 'Ramon lo escucha'} · ${formatTime(seconds)}`}
            </p>
          </div>
          <div className={`wave${isSpeaking ? ' wave--active' : ''}`} aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 90}ms` }} />)}
          </div>
          {lastAgentLine && <blockquote className="bubble">“{lastAgentLine}”</blockquote>}
          <div className="row">
            <button type="button" className="btn btn--outline" onClick={() => setMuted((m) => !m)} disabled={connecting}>
              {muted ? 'Activar micrófono' : 'Silenciar'}
            </button>
            <button type="button" className="btn btn--danger" onClick={hangUp}>Colgar</button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="stack" aria-live="polite">
          <div className="check-circle"><CheckIcon /></div>
          <h2 className="call-card__title">Recibimos su solicitud</h2>
          <p className="muted">
            Le enviaremos el resumen a su WhatsApp <strong>+57 {formatPhone(phone)}</strong>.
          </p>
          <p className="bubble bubble--sky">
            Una persona de nuestro equipo revisará su caso y lo llamará para explicarle el costo, la fecha y los siguientes pasos.
          </p>
          <button type="button" className="btn btn--outline btn--block" onClick={restart}>Volver al inicio</button>
        </div>
      )}
    </div>
  );
}
