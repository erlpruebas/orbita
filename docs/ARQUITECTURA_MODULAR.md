# ARQUITECTURA_MODULAR.md — Refactorización Recomendada

El principal motivo de regresiones durante el desarrollo en chat fue editar un único `index.html` monolítico de miles de líneas. En Antigravity conviene dividir ÓRBITA en módulos ES nativos (`<script type="module" src="./js/main.js">`) sin necesidad de frameworks pesados ni build steps obligatorios (o con Vite ligero si prefieres recarga en caliente).

## Estructura objetivo de `src/` (o raíz web)

```text
orbita/
├── index.html               # Solo estructura semántica del chasis, SVG sprites y modales
├── css/
│   ├── tokens.css           # Variables de color hardware, LEDs, sombras, tipografía
│   ├── layout.css           # Grid Portrait/Landscape 100dvh y escalado flex de teclas
│   └── modals.css           # Estilos de Configuración (50→9) y Detector de Tonalidad
└── js/
    ├── main.js              # Arranque, wiring de eventos y persistencia localStorage
    ├── state.js             # Estado único reactivo (tonalidad, modo, bancos 1-9, BPM, FX)
    ├── theory.js            # Escalas M/m, notas en español, tríadas diatónicas y frecuencias
    ├── audio-core.js        # AudioContext singleton, unlock síncrono, master bus, reverb, FX eje Y
    ├── synth-presets.js     # Catálogo de 50 sonidos (encabezado por los originales v01/v04)
    ├── drum-engine.js       # Síntesis de batería seca + catálogo de 50 patrones 4/4
    ├── accompaniment.js     # Motor 0-9 + lógica de enganche instantáneo (late-press catch-up)
    ├── clock-looper.js      # Scheduler lookahead, metrónomo mudo en reposo, precuenta y looper
    ├── tonality-mic.js      # Micrófono, detector de pitch, buffer 20s, mapa de calor y referencia
    ├── ui-deck.js           # Controles del panel hardware, LEDs y tap tempo
    ├── ui-keyboard.js       # 7 teclas zig-zag multitouch, eje Y y atajos Z-S-X-D-C-F-V
    └── ui-modals.js         # Modales de Banco 50→9 (con preescucha) y Clave de Sol
```

## Ventajas directas para iterar
- Si retocas `clock-looper.js` para clavar el tiempo al milisegundo, es físicamente imposible romper `synth-presets.js` o `css/layout.css`.
- Puedes crear una página `tests/audio-check.html` para validar automáticamente que los 50 sonidos y las 50 baterías producen señal válida (RMS > 0 y sin `NaN`) en 2 segundos.
- Puedes activar un modo debug opcional (`?debug=1`) que muestre en consola el desfase exacto en milisegundos del looper y del catch-up del acompañamiento.
