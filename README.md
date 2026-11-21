# ÓRBITA — Kit de Migración a Antigravity

Este paquete contiene toda la especificación, el historial de versiones, las reglas críticas para evitar regresiones, las capturas de referencia visual y los prompts listos para continuar el desarrollo de **ÓRBITA** en **Antigravity** con arquitectura modular.

> **Nota importante sobre los archivos `.html` de versiones anteriores:**
> Los códigos completos de las 14 iteraciones generadas en el Canvas del chat anterior no son accesibles de forma automática desde el historial del asistente, por lo que **no vienen empaquetados aquí** (para no incluir versiones inventadas). En `docs/HISTORIAL_VERSIONES.md` tienes el mapa exacto de cada versión para que exportes desde el botón **Código / Exportar** del chat solo las 3 o 4 versiones que te interesen y las pegues en la carpeta `referencias/`.

---

## Estructura del proyecto

```text
orbita/
├── AGENTS.md                        # Reglas permanentes para agentes de código (Antigravity, etc.)
├── README.md                        # Esta guía rápida
├── .gitignore
├── capturas/                        # Referencias visuales reales (qué SÍ y qué NO gustó)
│   ├── 01_escritorio_referencia_base.jpg
│   ├── 02_escritorio_ui_aprobada.jpg
│   └── 03_movil_error_recorte_NO_USAR.jpg
├── docs/
│   ├── SPEC.md                      # Especificación completa de producto, audio y UI
│   ├── REGLAS_NO_ROMPER.md          # Invariantes técnicos y bugs ya diagnosticados
│   ├── HISTORIAL_VERSIONES.md       # Mapa de las 14 versiones del chat para rescatar las clave
│   ├── ARQUITECTURA_MODULAR.md      # Plan para trocear index.html en módulos ES limpios
│   ├── COMPARATIVA.md               # Plantilla para anotar qué versión gana en cada bloque
│   └── PROMPTS_ANTIGRAVITY.md       # Prompts listos para copiar y pegar en Antigravity
└── referencias/
    └── README.txt                   # Carpeta donde guardar los .html exportados del Canvas
```

---

## Pasos rápidos para arrancar en Antigravity

1. Descomprime este ZIP en tu carpeta de proyectos (por ejemplo `C:\proyectos\orbita` o `~/proyectos/orbita`).
2. Inicializa Git desde la raíz:
   ```bash
   git init
   git add .
   git commit -m "chore: kit inicial de migracion de Orbita"
   ```
3. Abre los mensajes del chat anterior que más te gustaron (consulta `docs/HISTORIAL_VERSIONES.md`), pulsa en la pestaña **Código** del Canvas, copia el HTML y guárdalo dentro de `referencias/` con nombres descriptivos:
   - `referencias/v01_sonidos_originales.html`
   - `referencias/v04_ui_compacta_zsexdcfv.html`
   - `referencias/v14_completa_50_y_micro.html`
   *(y cualquier otra que quieras conservar o auditar).*
4. Rellena tus preferencias en `docs/COMPARATIVA.md` (te llevará 2 minutos).
5. Abre la carpeta en **Antigravity** y pega el **Prompt 1** de `docs/PROMPTS_ANTIGRAVITY.md`.

---

## Nota para probar el micrófono en Android

El detector de tonalidad usa `navigator.mediaDevices.getUserMedia({ audio: true })`. En navegadores móviles, el acceso al micrófono se bloquea en páginas servidas por `http://` (salvo `localhost` en el propio PC). Para probarlo en el móvil real, sirve el proyecto por **HTTPS** mediante:
- Un túnel rápido (Cloudflare Tunnel / Tailscale / ngrok), o
- Un despliegue estático automático en **Netlify** o **Vercel** conectado a tu repositorio Git.
