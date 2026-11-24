# AGENTS.md — Instrucciones del Proyecto ÓRBITA

Antes de modificar o crear código en este repositorio (`d:\hiclone`), lee siempre en este orden:
1. `docs/ESTADO_ACTUAL.md` (**contexto actualizado**, arquitectura real desplegada, decisiones recientes del usuario, GitHub Pages y comandos de despliegue).
2. `docs/SPEC.md` (especificación funcional y de interfaz).
3. `docs/REGLAS_NO_ROMPER.md` (restricciones estrictas de audio, reloj, looper y layout).

## Reglas de trabajo obligatorias
- **No tocar el diseño visual sin permiso explícito.** La estética hardware oscura (`#141518`), compacta, 100% iconográfica y bloqueada a `100dvh` está aprobada. La barra OLED de 3 elementos (`Bruma | Manual | Lo-Fi`) debe permanecer **fija (sin marquee)** debajo de Octava/Sonido y Tempo/Batería.
- **No alterar timbres ni patrones de batería cuando se edite la UI o el looper.** Mantener separados los módulos ES en `js/`.
- **Cero regresiones de audio:**
  - El metrónomo permanece completamente mudo en reposo.
  - La reverb arranca siempre en `0 LEDs` (apagada) y la batería es 100% seca.
  - Cada voz usa doble etapa `envGain × releaseGain` con decay suave (`>= 320 ms`) para no hacer ruido ni cortar en seco al soltar la tecla; nunca resetear el filtro del Eje Y en `pointerup`.
  - El micrófono del Estudio de Maqueta debe mantenerse en modo musical crudo (`echoCancellation: false`, `noiseSuppression: false`, `autoGainControl: false`, highpass `40 Hz`) para capturar guitarra y voz sin recortes.
- **Preescuchas en Configuración (`50 → 9`):** Botón único de Play (`▶`), suena 1 sola vez y al pulsar otro Play detiene inmediatamente el anterior.
- **Despliegue tras cada cambio aprobado:** Incrementar `CACHE_NAME` en `sw.js` y hacer `git push origin main` hacia `https://github.com/erlpruebas/orbita` para actualizar GitHub Pages (`https://erlpruebas.github.io/orbita/`).
- **Idioma:** Documentación, comentarios y notas musicales (`DO, RE, MI, FA, SOL, LA, SI`, `M`/`m`) en español.
