# ESTADO_ACTUAL.md — Contexto Completo de ÓRBITA para Continuar el Desarrollo

*Última actualización: 2026-11-24 · Commit base en `main`: `cfa500b`+*

---

## 1. Repositorio, Despliegue y Entorno Local

- **Carpeta local del proyecto:** `d:\hiclone`
- **Repositorio GitHub:** `https://github.com/erlpruebas/orbita` (cuenta `erlpruebas`, rama `main`)
- **URL pública en producción (GitHub Pages con HTTPS oficial):**
  `https://erlpruebas.github.io/orbita/`
- **Herramientas instaladas en Windows:**
  - `Node.js` (`v22.23.4`)
  - `MinGit`: `C:\Users\erlqu\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe` (también en PATH de usuario)
  - `GitHub CLI (gh)`: `C:\Program Files\GitHub CLI\gh.exe` (autenticado como `erlpruebas` vía keyring de Windows con permisos `repo`, `workflow`, `gist`, `read:org`)
- **Servidor local opcional para pruebas en PC/Wi-Fi:**
  `node d:\hiclone\server.mjs` (o doble clic en `d:\hiclone\iniciar-orbita.bat`) → sirve HTTP en `:3000` y HTTPS autofirmado en `:3443`.
- **Regla obligatoria al publicar cualquier cambio:**
  1. Incrementar `CACHE_NAME` en `d:\hiclone\sw.js` (actualmente `orbita-hw-v10`) para que el móvil y la PWA descarguen siempre la última versión.
  2. Hacer `git add`, `git commit` y `git push origin main` para que GitHub Pages actualice `https://erlpruebas.github.io/orbita/` en ~15–20 segundos.

---

## 2. Arquitectura Modular Actual (`d:\hiclone`)

La aplicación es 100% estática (HTML + CSS + ES Modules nativos, sin paso de build ni dependencias externas en runtime):

```text
d:\hiclone\
├── index.html                  # Chasis hardware, SVG sprites, barra OLED fija y 3 modales
├── manifest.json               # Manifiesto PWA instalable a pantalla completa
├── sw.js                       # Service Worker Network-First (CACHE_NAME = 'orbita-hw-v10')
├── .nojekyll                   # Desactiva Jekyll en GitHub Pages
├── server.mjs                  # Servidor local HTTP (:3000) + HTTPS (:3443)
├── iniciar-orbita.bat          # Lanzador rápido local
├── css/
│   ├── tokens.css              # Paleta aluminio oscuro (#141518), LEDs y tipografía
│   ├── layout.css              # Layout 100dvh Portrait/Landscape, 7 teclas zig-zag y barra OLED fija
│   └── modals.css              # Estilos de Banco 50→9, Clave de Sol y Estudio de Maqueta 2 pistas
├── js/
│   ├── main.js                 # Arranque, unlock global AudioContext, ?debug=1 HUD y registro SW
│   ├── state.js                # Estado reactivo + persistencia localStorage (9 sonidos, 9 acomp, 9 baterías)
│   ├── theory.js               # Escalas M/m, tríadas, 7ª diatónica, grados I-VII, atajos Z-S-X-D-C-F-V
│   ├── audio-core.js           # AudioContext singleton, masterCompressor, reverb (0 LEDs default), FX Eje Y
│   ├── synth-presets.js        # 50 sonidos (1-6 originales v01/v04), doble ganancia envGain×releaseGain
│   ├── accompaniment.js        # 50 patrones de acompañamiento, Late-Press Catch-Up y preview 1 compás
│   ├── drum-engine.js          # Batería 100% seca (sin reverb) + 50 patrones 4/4 + preview 1 compás
│   ├── clock-looper.js         # Reloj lookahead, metrónomo mudo en reposo, precuenta 1-2-3-4 y looper 0-offset
│   ├── tonality-mic.js         # Detector de tonalidad (Clave de Sol): YIN, buffer 20s, baremo 4 colores, teclado ref
│   ├── demo-recorder.js        # Estudio de Maqueta 2 pistas (AudioWorklet 3ch, Sincro ms, Eco/Chorus, export MP3)
│   ├── ui-deck.js              # Controles del panel hardware, Tap Tempo, barra OLED fija y LEDs
│   ├── ui-keyboard.js          # 7 teclas zig-zag multitouch, deslizamiento Eje Y y atajos PC
│   ├── ui-modals.js            # Modales: Banco 50→9 (3 pestañas), Clave de Sol y Estudio de Maqueta 2 pistas
│   └── vendor/
│       └── lame.min.js         # Codificador MP3 estéreo 192 kbps autoalojado (lamejs 1.2.1)
├── tests/
│   └── verify-presets.html     # Auditoría automática de los 50 sonidos + 50 baterías (RMS > 0)
├── docs/                       # SPEC.md, REGLAS_NO_ROMPER.md, ARQUITECTURA_MODULAR.md, ESTADO_ACTUAL.md
├── capturas/                   # Capturas de referencia visual aprobada y error a evitar
└── referencias/                # Bocetos originales y Bruma-boceto-sonoro.mp3
```

---

## 3. Decisiones y Mejoras Aprobadas por el Usuario (NO ROMPER)

### Interfaz y Layout
1. **Barra superior limpia:** Contiene únicamente `ÓRBITA`, **Grabar Maqueta (`● 🎙`)**, **Configuración (`⚙`)**, **Clave de Sol (`𝄞`)**, **Selector Eje Y** y **Key-Strike (`⚡`)**. *(El botón QR de "Probar en el móvil" se eliminó porque ya usa la URL fija de GitHub Pages).*
2. **Barra OLED fija (NO en movimiento):** Muestra los 3 elementos activos con su icono y color (`[♪ Bruma] | [arp Manual] | [drum Lo-Fi]`), colocada **dentro de `#control-deck`, justo debajo de Octava/Sonido y Tempo/Batería** (y encima del Looper). Pulsar cualquiera de los 3 abre directamente su pestaña en Configuración.
3. **100dvh estricto sin recortes:** En móvil vertical caben todos los controles y las 7 teclas en zig-zag se escalan con `flex: 1 1 0; min-height: 0;`. Las barras azules de expresión del Eje Y solo aparecen mientras se pulsa la tecla.

### Motor de Audio, Envolventes y Preescuchas
4. **Soltar tecla con decay suave (cero clics ni cortes en seco):** Cada voz en `js/synth-presets.js` usa **dos nodos de ganancia en serie (`envGain × releaseGain`)**. `envGain` nunca se cancela al soltar una tecla viva; `releaseGain` cae suavemente (`relDur >= 320 ms`).
5. **Eje Y sin ruido al soltar:** Al pulsar la tecla, el sonido ataca limpio/neutro; la modulación del Eje Y solo actúa al **deslizar** verticalmente (`> 6 px`) y **nunca** se resetea el filtro en `pointerup` para evitar barridos durante la cola de caída.
6. **Preescuchas del Configurador (`50 → 9`):**
   - Hay **3 pestañas configurables**: `SONIDOS (50)`, `ACOMP. (50)` y `BATERÍAS (50)`.
   - El botón derecho es **únicamente Play (`▶`)**: suena **una sola vez** (1 vuelta de melodía+acordes en sonidos, 1 compás en acompañamientos y baterías) y se calla solo.
   - Al pulsar Play en otro elemento mientras suena una muestra, se ejecuta `stop(null, true)` (`forceImmediate`) para **detener al instante** la anterior (incluidas sus notas futuras) y que nunca suenen dos cosas a la vez.

### Estudio de Maqueta Multipista (2 Pistas: Música + Voz/Guitarra)
7. **Grabación de 2 pistas sincronizadas (`js/demo-recorder.js`):**
   - `AudioWorklet` de 3 canales: Canales 0 y 1 = Música estéreo interna de ÓRBITA; Canal 2 = Micrófono externo.
   - **Micrófono en modo musical crudo:** `echoCancellation: false`, `noiseSuppression: false`, `autoGainControl: false` y filtro paso-alto muy suave a `40 Hz`. *(Es vital mantenerlos en `false` para que el móvil capture guitarra acústica + voz con naturalidad sin que Android/Chrome recorte los instrumentos como ruido).*
   - El micrófono **nunca** se reenvía a `ctx.destination` (cero acople).
8. **Parada automática al finalizar grabación:** Al parar la grabación de maqueta se llama a `stopAllTransportForPlayback()` para detener batería y reproducción del looper y permitir escuchar la maqueta en silencio.
9. **Mezclador, Efectos, Sincro, Recorte y Exportación MP3:**
   - **Forma de onda OLED 2 pistas** (Verde = Música arriba, Ámbar = Voz abajo) con deslizadores de **Recorte (`Inicio` y `Final`)**.
   - **Volumen independiente** para `MÚSICA (0–150%)` y `VOZ (0–180%)`.
   - **Compensación de latencia `SINCRO` (`-400 ms` a `+150 ms`):** Botones `-10`, `+10`, `AUTO` (correlación de ataques + latencia hardware), desplazamiento visual de la onda ámbar bajo la verde y memoria persistente por dispositivo en `localStorage` (`orbita_voice_sync_offset_ms_v1`).
   - **Efectos solo en Pista 2 (Voz):** `ECO VOZ` (`0–3 LEDs` cian) y `CHORUS VOZ` (`0–3 LEDs` violeta), auditables en tiempo real con `▶ ESCUCHAR MEZCLA`.
   - **Exportación definitiva en MP3 real (`192 kbps`, `audio/mpeg`):** Render offline en `OfflineAudioContext` codificado con `js/vendor/lame.min.js` (`EXPORTAR (.MP3)` y `COMPARTIR MAQUETA (.MP3)`).

---

## 4. Comandos Rápidos para el Siguiente Agente

### Publicar cambios a GitHub Pages
```powershell
$env:PATH = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
$git = "C:\Users\erlqu\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
Set-Location "d:\hiclone"
& $git status
& $git add .
& $git commit -m "descripción del cambio"
& $git push origin main
```

### Levantar servidor local de prueba
```powershell
node d:\hiclone\server.mjs
```
