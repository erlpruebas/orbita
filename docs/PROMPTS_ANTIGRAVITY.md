# PROMPTS_ANTIGRAVITY.md — Prompts Listos para Antigravity

Copia y pega estos prompts en orden dentro de Antigravity una vez hayas colocado tus archivos `.html` exportados dentro de `referencias/`.

---

## Prompt 1 — Auditoría inicial (sin tocar código todavía)

```text
Lee primero AGENTS.md, docs/SPEC.md, docs/REGLAS_NO_ROMPER.md, docs/HISTORIAL_VERSIONES.md y docs/COMPARATIVA.md.
Revisa también las imágenes de capturas/ y todos los archivos HTML que he colocado en referencias/.

NO escribas código todavía. Hazme un informe breve con:
1. Qué diferencias concretas hay entre las versiones de referencias/ en:
   - Síntesis de sonidos (osciladores, filtros, envolventes).
   - Síntesis de batería.
   - Reloj, metrónomo y looper (detecta exactamente por qué el looper podía quedar desplazado).
   - Acompañamiento automático y lógica de enganche instantáneo.
   - CSS móvil vertical/horizontal.
2. Tu propuesta concreta de qué módulo extraer de cada archivo de referencias/ para construir la arquitectura modular de docs/ARQUITECTURA_MODULAR.md.
```

---

## Prompt 2 — Construcción modular fusionando lo mejor de cada versión

```text
Perfecto. Ahora crea la versión modular definitiva de ÓRBITA siguiendo docs/ARQUITECTURA_MODULAR.md, docs/SPEC.md y respetando estrictamente cada punto de docs/REGLAS_NO_ROMPER.md.

Prioridades obligatorias:
1. Extrae exactamente la síntesis de sonidos y baterías que aprobamos en el paso anterior (sin añadir reverb oculta; reverb siempre en 0 LEDs por defecto).
2. Mantén la estética compacta de capturas/02_escritorio_ui_aprobada.jpg, 100% iconográfica, y garantiza en vertical móvil que todo quepa en 100dvh sin recortes escalando las teclas.
3. Implementa un reloj maestro limpio en js/clock-looper.js con metrónomo estrictamente mudo en reposo, precuenta exacta de 4 clics desde 0 al pulsar REC y looper sin desfase de medio compás.
4. Implementa el enganche instantáneo (late-press catch-up) en js/accompaniment.js para que si pulso en el instante +0.01s tras el inicio del compás, la nota/acorde suene de inmediato durante el tiempo restante del paso y siga en fase.
5. Integra los dos modales: Configuración (50 sonidos con preescucha melodía+acordes y 50 baterías para elegir los 9 huecos activos) y Clave de Sol (micrófono con buffer de 20s, baremo rojo-naranja-amarillo-verde, estimación de tonalidad tipo Do M / La m y teclado cromático de referencia sonoro).
6. Añade un script o página tests/verify-presets.html para verificar automáticamente que los 50 sonidos y las 50 baterías producen audio válido sin errores ni silencios.
```

---

## Prompt 3 — Diagnóstico fino del Looper y pruebas en móvil real

```text
Vamos a auditar la precisión temporal de ÓRBITA en un Android real:
1. Añade un modo diagnóstico activable solo con ?debug=1 que muestre en una pequeña esquina (sin romper el layout): estado del AudioContext, BPM, beat/step actual, latencia estimada de salida (outputLatency / baseLatency) y el delta en milisegundos al disparar notas en el looper y en el acompañamiento automático.
2. Verifica que el looper compensa correctamente cualquier desfase entre la precuenta y el inicio real de la grabación.
3. Indícame el comando exacto para levantar un servidor local y exponerlo por HTTPS para poder probar también el micrófono (Clave de Sol) desde mi móvil Android.
```
