# REGLAS_NO_ROMPER.md — Invariantes y Bugs Resueltos

Estas reglas documentan problemas reales que aparecieron durante las iteraciones anteriores. Cualquier cambio en el proyecto **debe verificar todos estos puntos** antes de darse por bueno.

---

## 1. Reloj y Metrónomo
- **Metrónomo estrictamente mudo en reposo:** Cuando la batería y el looper están parados, el reloj de transporte DEBE estar detenido (`running = false`). Prohibido dejar un metrónomo sonando en segundo plano al abrir la app.
- **Cuándo puede sonar el clic:**
  1. Siempre durante los 4 tiempos de precuenta del looper (`PRE 1-2-3-4`).
  2. Durante reproducción de batería/looper **solo** si el LED de metrónomo fue activado manualmente por el usuario.

## 2. Looper (Cero desfase de medio compás)
- **Síntoma histórico resuelto:** En versiones anteriores el looper grababa con un retardo aparente de medio compás respecto a lo tocado en el tiempo 1.
- **Causa raíz típica a evitar:** Desalineación entre el reloj visual (`setTimeout`/`requestAnimationFrame`), el lookahead del scheduler (`+100 ms`), la latencia del buffer de captura PCM o arrancar la captura antes/después del `audioCtx.currentTime` exacto del downbeat.
- **Regla obligatoria:**
  - Al pulsar **REC**, parar el transporte actual, reiniciar el contador a 0, lanzar 4 clics de precuenta programados con `audioCtx.currentTime`, y fijar un `recordStartTime` exacto en el pulso 5 (tiempo 1 del compás 1).
  - Si se usa grabación PCM (`AudioWorklet` o buffer), descartar/recortar exactamente los samples previos a `recordStartTime` (compensando tamaño de bloque) o usar un grabador de eventos/audio sample-accurate sincronizado a la misma referencia `audioCtx.currentTime`.
  - Incluir una pequeña ventana de tolerancia (*downbeat snap* de ~50–75 ms) por si el dedo toca 20 ms antes o después del tiempo 1.
  - Al cerrar grabación, cuantizar la duración al múltiplo entero de compases más cercano (1, 2, 4 u 8 compases) con crossfade suave (~5–10 ms) para evitar clics.

## 3. Acompañamiento Automático: Enganche Instantáneo (*Late-Press Catch-Up*)
- **Problema real de interpretación:** Un humano rara vez pulsa la tecla antes del instante `0.00 s` del compás; normalmente pulsa en `+0.01 s` o `+0.04 s`. Si el motor espera al siguiente paso del grid, se produce un silencio antinatural en el ataque.
- **Regla obligatoria:**
  - **Si el transporte está parado:** Al pulsar una tecla con acompañamiento (1–9), arranca instantáneamente desde el paso 0 sin espera.
  - **Si el transporte está corriendo:** Al pulsar una tecla en mitad de un paso/compás (p. ej. `0,01 s` después del beat 1), el motor **calcula qué nota/acorde corresponde estar sonando en ese instante del patrón**, la dispara **inmediatamente** (con la duración restante del paso) y continúa en fase con los pasos siguientes. Nunca debe quedar un silencio hasta el siguiente pulso.
  - Respetar el interruptor **`⚡` Key-Strike / Pure Gate**:
    - `⚡ ON`: además del patrón, dispara un golpe de acorde inmediato al tocar la tecla.
    - `⚡ OFF` (Pure Gate): pulsar o soltar la tecla abre o cierra la puerta del acompañamiento en fase sin doble disparo innecesario.

## 4. Motor de Audio y Desbloqueo en Móvil
- **AudioContext síncrono:** `audioCtx = new AudioContext()` y `audioCtx.resume()` deben ejecutarse directamente dentro de un handler `pointerdown` / `touchstart` / `keydown` para evitar el bloqueo de autoplay en Chrome Android / Safari iOS (que provocó la versión silenciosa v9).
- **Verificación de todos los presets:** Ningún preset puede quedar mudo (en una iteración anterior el sonido #2 falló por un parámetro inválido en un nodo Web Audio). Proteger ganancias y frecuencias con `Math.max(0.0001, ...)` en rampas exponenciales y validar cada preset con un test automático.
- **Reverb apagada por defecto (`0 LEDs`):** No aplicar reverb oculta permanente sobre la mezcla ni sobre la batería. La batería debe sonar seca y con pegada, separada del envío de reverb del sintetizador.

## 5. Interfaz y Móvil
- **Cero recorte en vertical:** Nunca dar altura fija excesiva a las teclas que empuje o recorte el panel superior (ver `capturas/03_movil_error_recorte_NO_USAR.jpg`).
- **Sin barras de expresión permanentes:** El medidor vertical de filtro/volumen/distorsión solo debe iluminarse durante el toque activo.
- **Atajos de PC inamovibles:** `Z` (I), `S` (II), `X` (III), `D` (IV), `C` (V), `F` (VI), `V` (VII).
