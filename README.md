# acompaña · Landing con agente de voz

Landing page de la propuesta **"Agente de IA telefónico + gestor humano para trámites de salud de adultos mayores"**.

> Tecnología que facilita, personas que acompañan.

La página muestra la solución y permite hablar por voz, desde el navegador, con **Ramon**, el agente de ElevenLabs Conversational AI. Antes de iniciar la llamada, el usuario debe escribir su número de WhatsApp y aceptar el tratamiento de datos.

## Stack

- [Vite](https://vitejs.dev/) + React 18
- [`@elevenlabs/react`](https://elevenlabs.io/docs/eleven-agents) (`useConversation`, conexión WebRTC)

## Flujo de la llamada

1. El usuario escribe su WhatsApp (celular colombiano, 10 dígitos que empiezan por 3) y marca la autorización.
2. (Opcional) El número se envía por `POST` a `VITE_LEADS_WEBHOOK_URL`.
3. El navegador pide permiso de micrófono y se inicia la sesión con el agente (`startSession({ agentId, connectionType: 'webrtc' })`).
4. Al conectar, se envía a Ramon un `contextualUpdate` con el número de WhatsApp para que no lo vuelva a pedir.
5. Al colgar, se muestra la confirmación: el resumen llega por WhatsApp y una persona del equipo continúa el caso.

Todo está en [`src/components/CallCard.jsx`](src/components/CallCard.jsx).

## Cómo correrlo

```bash
npm install
cp .env.example .env
npm run dev
```

Abre http://localhost:5173. El micrófono solo funciona en `localhost` o en HTTPS.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `VITE_ELEVENLABS_AGENT_ID` | ID del agente (por defecto, Ramon: `agent_4501m3pt08mcfe0b9ht61n44xv67`) |
| `VITE_LEADS_WEBHOOK_URL` | Opcional. Recibe `{ whatsapp, consent, createdAt }` antes de cada llamada |
| `VITE_PHONE_LINE` | Número de la línea telefónica que aparece en la página |

## Configuración del agente en ElevenLabs

- El agente debe ser **público** (sin autenticación) para que la página pueda iniciar la sesión solo con el `agentId`. Si lo vuelves privado, hay que generar un `conversationToken` desde un servidor (`GET /v1/convai/conversation/token`) y pasarlo a `startSession`.
- Agrega el dominio donde publiques la página a la lista de dominios permitidos del agente.
- Para que el resumen llegue por WhatsApp, conecta en ElevenLabs un *post-call webhook* o una herramienta del agente con tu proveedor de WhatsApp (por ejemplo, n8n + WhatsApp Cloud API).

## Despliegue

```bash
npm run build
```

Sube la carpeta `dist/` a Vercel, Netlify o GitHub Pages y configura las variables `VITE_*` en el proveedor.

## Pendientes de contenido

- `[PRECIO BASE]` en la sección de precio (`src/App.jsx`).
- `[NÚMERO DE LÍNEA]` en `VITE_PHONE_LINE`.
- Enlace a la política de tratamiento de datos (`#privacidad`).
