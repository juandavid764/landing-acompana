import { useEffect, useRef, useState } from 'react';
import CallCard from './components/CallCard.jsx';
import MobileCta from './components/MobileCta.jsx';
import { LoopMark, PhoneIcon, CheckIcon, DashIcon, MenuIcon, CloseIcon } from './components/Icons.jsx';

import { PHONE_LINE, PHONE_TEL } from './config.js';

const STEPS = [
  { n: 1, title: 'Llama', text: 'Marca un número o habla desde esta página. Marcela, nuestra asistente de IA, contesta a cualquier hora. Sin apps ni formularios.', who: 'ai' },
  { n: 2, title: 'Cuenta qué necesita', text: 'Marcela le pregunta el trámite, su nombre, su documento y su EPS. Su solicitud queda registrada.', who: 'ai' },
  { n: 3, title: 'Recibe el resumen', text: 'Al colgar, le llega por WhatsApp lo que pidió, en sus propias palabras.', who: 'ai' },
  { n: 4, title: 'Una persona revisa', text: 'Un supervisor valida su solicitud y la asigna a un gestor, o la atiende él mismo.', who: 'human' },
  { n: 5, title: 'Lo llaman y se resuelve', text: 'El gestor le explica si es virtual o presencial, el costo y la fecha. Hace el trámite y le confirma el resultado.', who: 'human' },
];

const VALUES = [
  ['Tecnología y atención humana', 'La IA recibe y organiza su solicitud; un asesor la orienta y la gestiona.'],
  ['Todo empieza por teléfono', 'Sin aplicaciones, páginas web ni formularios para comenzar.'],
  ['Acompañamiento a su medida', 'El nivel de apoyo se adapta a lo que usted necesite.'],
  ['Citas y autorizaciones', 'Nos enfocamos en autorizaciones y citas con especialistas.'],
  ['Seguimiento de su solicitud', 'Le contamos cómo avanza, con confirmación escrita y recordatorios.'],
  ['Más autonomía', 'Hágalo usted mismo, acompañado, sin depender de un hijo o un nieto.'],
  ['Lenguaje claro', 'Le explicamos cada paso sin términos complicados.'],
  ['Pensado para personas mayores', 'Diseñado a partir de sus barreras reales con lo digital.'],
];

const YES = [
  'Entender el trámite sin navegar una plataforma',
  'Atención humana real, no un menú de opciones',
  'Confirmación escrita y recordatorios',
  'Hacerlo sin depender de un hijo o un nieto',
];

const NO = [
  'Crear agenda donde la entidad no la tiene',
  'Conseguir un medicamento que no está en inventario',
  'Acelerar los tiempos internos de la EPS o IPS',
];

const PRICE_FACTORS = [
  'Tipo de trámite',
  'Entidad (EPS / IPS)',
  'Virtual, telefónico o presencial',
  'Urgencia',
  'Horario',
  'Documentos a la mano',
  'Si requiere autorización o poder',
  'Ubicación, si es presencial',
];

const NAV = [
  ['#como-funciona', 'Cómo funciona'],
  ['#beneficios', 'Beneficios'],
  ['#alcance', 'Qué resolvemos'],
  ['#precio', 'Precio'],
];

function focusForm() {
  const input = document.querySelector('#solicitar input[type="tel"]');
  // El foco va dentro del mismo toque: iOS solo abre el teclado si focus() ocurre en el gesto del usuario.
  input?.focus({ preventScroll: true });
  document.getElementById('solicitar')?.scrollIntoView({ behavior: 'smooth', block: input ? 'center' : 'start' });
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  // El menú móvil se cierra con Escape (devolviendo el foco al botón) o tocando fuera de él.
  // El toque de afuera solo cierra el menú: no activa lo que había debajo (p. ej. la casilla del formulario).
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const onOutsideClick = (e) => {
      // e.detail === 0: clic generado por teclado (p. ej. Enter en el formulario); no lo bloqueamos.
      if (navRef.current?.contains(e.target) || e.detail === 0) return;
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
    };
    // Desplazarse por la página también cierra el menú (un gesto de scroll no genera clic).
    const startY = window.scrollY;
    const onScroll = () => Math.abs(window.scrollY - startY) > 40 && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onOutsideClick, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onOutsideClick, true);
      window.removeEventListener('scroll', onScroll);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip" href="#solicitar">Ir al formulario de llamada</a>

      <header className="hero" id="inicio">
        <svg className="hero__ribbon" viewBox="0 0 1440 980" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M -80 900 C 260 860 620 780 820 560 C 960 400 1040 200 960 150 C 880 100 820 260 900 430 C 990 620 1250 660 1350 470 C 1410 350 1390 250 1320 190" />
        </svg>

        <nav className="nav container" aria-label="Principal" ref={navRef}>
          <a href="#inicio" className="brand">
            <LoopMark /> <span>acompaña</span>
          </a>
          {/* El botón va antes de los enlaces en el DOM: al abrir el menú, Tab / VoiceOver pasan directo a ellos. */}
          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div id="menu-principal" className={`nav__links${menuOpen ? ' is-open' : ''}`}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </div>
          <button type="button" className="btn btn--white nav__cta" onClick={focusForm}>Solicitar llamada</button>
        </nav>

        <div className="hero__body container">
          <div className="hero__copy">
            <span className="pill">Trámites de salud para personas mayores</span>
            <h1>Sus trámites de salud, con una llamada.</h1>
            <p className="lead">
              Marcela, nuestra asistente, toma su solicitud a cualquier hora. Después, una persona de nuestro equipo lo llama y la resuelve con usted.
            </p>
            <p className="tagline">Tecnología que facilita, personas que acompañan.</p>
          </div>
          <CallCard id="solicitar" />
        </div>
      </header>

      <main>
        <section className="insight container">
          <div className="insight__icon"><PhoneIcon size={84} color="#0A3E8C" strokeWidth={1.6} /></div>
          <div className="stack">
            <span className="eyebrow">El reto</span>
            <h2 className="h2">La llamada es el canal que el adulto mayor ya domina.</h2>
            <p className="body-lg muted">No tiene que aprender una aplicación. La tecnología trabaja del otro lado del teléfono, y usted solo conversa.</p>
          </div>
        </section>

        <section className="band band--white" id="como-funciona">
          <div className="container stack stack--lg">
            <div className="section-head">
              <div className="stack stack--tight">
                <span className="eyebrow">Cómo funciona</span>
                <h2 className="h2">Cinco pasos, una sola llamada para empezar</h2>
              </div>
              <ul className="legend">
                <li><span className="dot dot--sky" />Pasos 1–3: Marcela, asistente de IA, 24/7</li>
                <li><span className="dot dot--lime" />Pasos 4–5: personas de nuestro equipo</li>
              </ul>
            </div>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n} className={`step step--${s.who}`}>
                  <span className="step__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="values" id="beneficios">
          <div className="container stack stack--lg">
            <div className="stack section-intro">
              <span className="eyebrow">Por qué acompaña</span>
              <h2 className="h2">Trámites de salud más sencillos, claros y seguros</h2>
              <p className="body-lg muted">
                Usted elige: hacer el trámite con acompañamiento o dejarlo en nuestras manos. Menos dependencia de la familia, menos filas y menos frustración.
              </p>
            </div>
            <div className="values__grid">
              {VALUES.map(([title, text]) => (
                <article key={title} className="value">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
          <svg className="values__ribbon" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
            <path d="M -40 200 C 300 240 520 120 700 150 C 860 176 980 240 1180 170 C 1300 128 1380 60 1500 70" />
          </svg>
        </section>

        <section className="band band--navy" id="alcance">
          <div className="container stack stack--lg">
            <h2 className="h2">Lo que resolvemos, dicho con honestidad</h2>
            <div className="scope">
              <div className="scope__card scope__card--yes">
                <span className="eyebrow eyebrow--green">Lo que sí resolvemos</span>
                <ul>
                  {YES.map((t) => <li key={t}><CheckIcon />{t}</li>)}
                </ul>
              </div>
              <div className="scope__card scope__card--no">
                <span className="eyebrow eyebrow--peach">Lo que no prometemos</span>
                <ul>
                  {NO.map((t) => <li key={t}><DashIcon />{t}</li>)}
                </ul>
                <p className="scope__note">Eso se lo decimos con transparencia desde la primera llamada.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="price container" id="precio">
          <div className="stack price__intro">
            <span className="eyebrow">Precio</span>
            <h2 className="h2">Paga por su trámite, no por una suscripción</h2>
            <p className="body-lg muted">
              Antes de empezar, el gestor le dice el costo exacto. Desde <strong className="ink">[PRECIO BASE]</strong> por trámite.
            </p>
          </div>
          <div className="stack">
            <p className="label">El valor depende de:</p>
            <ul className="chips">
              {PRICE_FACTORS.map((f) => <li key={f} className="chip">{f}</li>)}
              <li className="chip chip--lime">Varios trámites juntos cuestan menos</li>
            </ul>
          </div>
        </section>

        <section className="container">
          <div className="cta">
            <svg className="cta__ribbon" viewBox="0 0 1280 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <path d="M 1300 380 C 1080 420 940 330 960 210 C 975 120 1060 90 1100 150 C 1140 210 1060 320 900 340 C 760 358 700 440 690 520" />
            </svg>
            <div className="stack cta__copy">
              <h2 className="h2">¿Tiene un trámite pendiente? Empecemos hoy.</h2>
              <p className="body-lg">Deje su WhatsApp y hable con Marcela en este mismo momento.</p>
            </div>
            <button type="button" className="btn btn--navy btn--lg" onClick={focusForm}>Solicitar mi llamada</button>
          </div>
        </section>
      </main>

      <footer className="footer container">
        <div className="stack stack--tight footer__about">
          <span className="footer__brand">acompaña</span>
          <p className="muted">
            Facilitamos la gestión de trámites administrativos de salud de las personas mayores, uniendo tecnología y acompañamiento humano, para fortalecer su autonomía.
          </p>
        </div>
        <div className="stack stack--tight footer__links">
          {PHONE_TEL ? <a href={`tel:${PHONE_TEL}`}>Línea: {PHONE_LINE}</a> : <span>Línea: {PHONE_LINE}</span>}
          <a href="#privacidad">Política de tratamiento de datos</a>
        </div>
      </footer>

      <MobileCta onClick={focusForm} hidden={menuOpen} />
    </>
  );
}
