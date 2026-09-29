import { useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { PhoneIcon, CheckIcon, LoopMark, MicIcon, HangUpIcon, IdCardIcon } from './Icons.jsx';

// Quita las etiquetas de expresión de voz ([amablemente], [ríe]...) que no deben verse en pantalla.
const cleanTranscript = (text = '') => text.replace(/\[[^\]]*\]\s*/g, '').replace(/\s{2,}/g, ' ').trim();

const BAR_COUNT = 9;
// Perfil en forma de campana para que las barras se vean orgánicas.
const BAR_SHAPE = Array.from({ length: BAR_COUNT }, (_, i) => 0.45 + 0.55 * Math.sin(((i + 1) / (BAR_COUNT + 1)) * Math.PI));

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

// ?demo=llamada muestra la pantalla de llamada con datos de ejemplo, sin micrófono (para revisar el diseño o presentar).
const DEMO = new URLSearchParams(window.location.search).get('demo') === 'llamada';

export default function CallCard({ id, compact = false }) {
  const [step, setStep] = useState(DEMO ? 'call' : 'phone'); // phone | call | done
  const [phone, setPhone] = useState(DEMO ? '3001234567' : '');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [lastAgentLine, setLastAgentLine] = useState(
    DEMO ? cleanTranscript('[amablemente] De nada, David, que te mejores pronto de tu rodilla. Que tengas un excelente día.') : ''
  );
  const [lastUserLine, setLastUserLine] = useState(DEMO ? 'Muchas gracias, Marcela.' : '');
  const [lastSource, setLastSource] = useState('ai');
  const [seconds, setSeconds] = useState(DEMO ? 87 : 0);
  const [muted, setMuted] = useState(false);
  const wasConnected = useRef(false);
  const whatsappRef = useRef('');
  const barsRef = useRef([]);
  const orbRingRef = useRef(null);

  const conversation = useConversation({
    micMuted: muted,
    onConnect: () => {
      wasConnected.current = true;
      // Le damos contexto a Marcela sin interrumpir su saludo.
      conversation.sendContextualUpdate?.(
        `El usuario ya registró su número de WhatsApp: ${whatsappRef.current}. No se lo vuelvas a pedir; úsalo para enviarle el resumen de la solicitud.`
      );
    },
    onDisconnect: () => {
      if (wasConnected.current) setStep('done');
      wasConnected.current = false;
    },
    onMessage: ({ message, source }) => {
      const text = cleanTranscript(message);
      if (!text) return;
      if (source === 'ai') setLastAgentLine(text);
      else setLastUserLine(text);
      setLastSource(source === 'ai' ? 'ai' : 'user');
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

  // Las barras y el anillo siguen el volumen real: de Marcela cuando habla, del usuario cuando escucha.
  useEffect(() => {
    if (status !== 'connected') return undefined;
    let frame;
    const tick = () => {
      let level = 0;
      try {
        level = isSpeaking ? conversation.getOutputVolume() : muted ? 0 : conversation.getInputVolume();
      } catch {
        level = 0;
      }
      const v = Math.min(1, level * 2.2);
      barsRef.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${0.18 + v * BAR_SHAPE[i] * 0.82})`;
      });
      if (orbRingRef.current) orbRingRef.current.style.transform = `scale(${1 + v * 0.14})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, isSpeaking, muted, conversation]);

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
    // Formato internacional sin "+" ni espacios (ej. 573189128065), listo para la API de WhatsApp.
    whatsappRef.current = `57${phone}`;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Necesitamos permiso para usar su micrófono. Actívelo en el navegador y vuelva a intentarlo.');
      return;
    }

    setLastAgentLine('');
    setLastUserLine('');
    setMuted(false);
    setStep('call');
    saveLead(whatsappRef.current);

    try {
      // `whatsapp` viaja como variable dinámica: el agente la usa como {{whatsapp}} y vuelve en el
      // post-call webhook en data.conversation_initiation_client_data.dynamic_variables.whatsapp
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
        dynamicVariables: { whatsapp: whatsappRef.current },
      });
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

  const connecting = !DEMO && status !== 'connected';

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
            <PhoneIcon /> Hablar con Marcela
          </button>
          <p className="muted center small">¿Prefiere marcar? Llame al <strong>{PHONE_LINE}</strong></p>
        </form>
      )}

      {step === 'call' && (
        <div className="live">
          <div className="live__top">
            <span className="live__who">
              <span className="live__avatar"><LoopMark color="#FFFFFF" size={22} /></span>
              Marcela<span className="live__role"> · asistente</span>
            </span>
            {!connecting && (
              <span className="live__timer" aria-label={`Duración ${formatTime(seconds)}`}>
                <span className="live__rec" aria-hidden="true" />{formatTime(seconds)}
              </span>
            )}
          </div>

          <div className={`orb${connecting ? ' orb--connecting' : ''}${isSpeaking ? ' orb--speaking' : ''}${!connecting && !isSpeaking && !muted ? ' orb--listening' : ''}${muted && !isSpeaking ? ' orb--muted' : ''}`}>
            <div className="orb__ring" ref={orbRingRef} />
            <div className="orb__core"><LoopMark color="#FFFFFF" size={60} /></div>
          </div>

          <p
            className={`turn${connecting ? ' turn--wait' : muted ? ' turn--muted' : isSpeaking ? ' turn--agent' : ' turn--user'}`}
            role="status"
            aria-live="polite"
          >
            {connecting ? (
              'Conectando con Marcela…'
            ) : muted ? (
              <><MicIcon size={22} off /> Su micrófono está apagado</>
            ) : isSpeaking ? (
              'Marcela está hablando'
            ) : (
              <><MicIcon size={22} /> Su turno: puede hablar</>
            )}
          </p>

          <div className={`wave${isSpeaking ? ' wave--agent' : ' wave--user'}${connecting || (muted && !isSpeaking) ? ' wave--idle' : ''}`} aria-hidden="true">
            {BAR_SHAPE.map((_, i) => (
              <span key={i} ref={(el) => { barsRef.current[i] = el; }} />
            ))}
          </div>

          {(lastAgentLine || lastUserLine) ? (
            <div className={`transcript${lastSource === 'user' ? ' transcript--user-last' : ''}`} aria-label="Últimas frases de la conversación">
              {lastUserLine && (
                <div className="msg msg--user">
                  <span className="msg__who">Usted</span>
                  <p>{lastUserLine}</p>
                </div>
              )}
              {lastAgentLine && (
                <div className="msg msg--agent">
                  <span className="msg__who">Marcela</span>
                  <p>{lastAgentLine}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="tip">
              <IdCardIcon /> Tenga a mano su documento y el carné de su EPS.
            </p>
          )}

          <div className="call-actions">
            <button
              type="button"
              className={`btn call-btn call-btn--mute${muted ? ' is-on' : ''}`}
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              disabled={connecting}
            >
              <MicIcon off={muted} />
              {muted ? 'Activar micrófono' : 'Silenciar'}
            </button>
            <button type="button" className="btn call-btn call-btn--end" onClick={hangUp}>
              <HangUpIcon /> Colgar
            </button>
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
