# AGENTS.md — Instrucciones del Proyecto ÓRBITA

Antes de modificar o crear código en este repositorio, lee siempre:
1. `docs/SPEC.md` (especificación funcional y de interfaz).
2. `docs/REGLAS_NO_ROMPER.md` (restricciones estrictas de audio, reloj, looper y layout).
3. `docs/COMPARATIVA.md` (criterio del propietario sobre qué código extraer de `referencias/`).

## Reglas de trabajo obligatorias
- **No tocar el diseño visual sin permiso explícito.** La estética hardware oscura (`#141518`), compacta, 100% iconográfica y bloqueada a `100dvh` está aprobada. Consulta `capturas/02_escritorio_ui_aprobada.jpg` (referencia positiva) y `capturas/03_movil_error_recorte_NO_USAR.jpg` (error a evitar).
- **No alterar timbres ni patrones de batería cuando se edite la UI o el looper.** Mantener separados los módulos de síntesis, baterías, acompañamiento, reloj/looper, micrófono y UI (ver `docs/ARQUITECTURA_MODULAR.md`).
- **Cero regresiones de audio:** El metrónomo permanece completamente mudo en reposo; el `AudioContext` se desbloquea de forma síncrona en el primer gesto del usuario; el acompañamiento automático engancha sin silencios incluso con pulsaciones ligeramente tardías (`+10 ms` tras el tiempo 1).
- **Idioma de la interfaz y documentación:** Cero texto innecesario en el panel principal (solo iconos SVG, números, grados romanos y notas en español: `DO`, `RE`, `MI`, `FA`, `SOL`, `LA`, `SI`, `M`/`m`). Documentación y comentarios en español.
