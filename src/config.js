export const PHONE_LINE = import.meta.env.VITE_PHONE_LINE || '[NÚMERO DE LÍNEA]';

// Solo se vuelve enlace `tel:` cuando la variable tiene un número real (no el marcador de posición).
export const PHONE_TEL = /\d{7,}/.test(PHONE_LINE.replace(/\D/g, '')) ? PHONE_LINE.replace(/[^\d+]/g, '') : '';
