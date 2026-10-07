import { useEffect, useState } from 'react';
import { PhoneIcon } from './Icons.jsx';

// Barra fija inferior (solo en teléfono, ver styles.css): mantiene la acción principal siempre
// a un toque. Se oculta en cuanto la tarjeta del formulario asoma en pantalla (así nunca la tapa),
// con el menú abierto, y durante o después de una llamada.
export default function MobileCta({ onClick, hidden = false }) {
  const [formVisible, setFormVisible] = useState(false);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const card = document.getElementById('solicitar');
    if (!card || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setInCall(['call', 'done'].includes(root.dataset.callStep));
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['data-call-step'] });
    return () => mo.disconnect();
  }, []);

  const show = !hidden && !formVisible && !inCall;

  return (
    <div className={`mobile-cta${show ? ' is-visible' : ''}`} aria-hidden={!show}>
      <button type="button" className="btn btn--lime mobile-cta__btn" onClick={onClick} tabIndex={show ? 0 : -1}>
        <PhoneIcon size={24} /> Hablar con Marcela
      </button>
    </div>
  );
}
