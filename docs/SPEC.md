# SPEC.md — Especificación Completa de ÓRBITA

## 1. Concepto
**ÓRBITA** es un instrumento web táctil inspirado en hardware musical boutique (estilo HiChord / sintetizador de bolsillo en aluminio anodizado oscuro). Permite tocar melodías y acordes diatónicos con una sola mano en móvil o con teclado de ordenador, acompañarse con arpegiador/arreglador automático, disparar ritmos de batería 4/4 sincronizados, grabar bucles con looper cuantizado y detectar la tonalidad cantando al micrófono.

---

## 2. Estética, Layout y Responsividad

- **Chasis:** Gris carbón mate / aluminio oscuro (`#141518`), biseles sutiles, botones táctiles oscuros y LEDs de estado de alto contraste (ámbar = acordes, esmeralda = melodía, cian = humanizador, violeta = reverb, rubí = REC, azul = expresión).
- **Panel 100% iconográfico (Zero-Text):** Sin etiquetas de texto largas en el panel principal. Solo iconos SVG claros, números, símbolos musicales (`M`, `m`, `▲`, `▼`, `◀`, `▶`), grados romanos (`I`–`VII`) y notas en español (`DO`, `RE`, `MI`, `FA`, `SOL`, `LA`, `SI`).
- **Bloqueo estricto de viewport (`100dvh`, `overflow: hidden`):** Prohibido el scroll vertical o recortes de controles.
- **Adaptación automática a orientación (móvil y escritorio):**
  - **Vertical (Portrait):** Panel de control arriba ocupando la altura mínima necesaria y superficie de 7 teclas debajo ocupando el resto de la pantalla. Las filas de teclas usan `flex: 1 1 0; min-height: 0;` para escalarse proporcionalmente al espacio disponible sin cortarse nunca.
  - **Horizontal (Landscape / Escritorio):** Panel de control compacto a la izquierda y superficie de 7 teclas altas a la derecha para facilitar el deslizamiento vertical del dedo.

---

## 3. Superficie de 7 Teclas en Zig-Zag

Disposición fiel al aparato original: **3 teclas arriba** colocadas sobre los huecos intermedios de **4 teclas abajo**, recorriendo la escala de izquierda a derecha en zig-zag (`Do → Re → Mi → Fa → Sol → La → Si`):

| Fila | Posiciones (Grado / Nota en Do M / Tecla PC) |
| :--- | :--- |
| **Superior (3 teclas)** | `II` (Re / `S`) — `IV` (Fa / `D`) — `VI` (La / `F`) |
| **Inferior (4 teclas)** | `I` (Do / `Z`) — `III` (Mi / `X`) — `V` (Sol / `C`) — `VII` (Si / `V`) |

### Comportamiento musical de las teclas
- **Escala diatónica natural automática:**
  - En **Mayor (`M`)**: `I` Mayor, `II` menor, `III` menor, `IV` Mayor, `V` Mayor, `VI` menor, `VII` disminuido (ej. en Do M: `Do, Rem, Mim, Fa, Sol, Lam, Si°`).
  - En **Menor natural (`m`)**: `I` menor, `II` disminuido, `III` Mayor, `IV` menor, `V` menor, `VI` Mayor, `VII` Mayor (ej. en La m: `Lam, Si°, Do, Rem, Mim, Fa, Sol`).
- **Multitouch + Teclado físico:** Soporte táctil simultáneo (`PointerEvents`) y atajos `Z, S, X, D, C, F, V`.
- **Expresión en Eje Y (deslizamiento vertical sobre la tecla pulsada):**
  - Permite modular en tiempo real mientras se mantiene la tecla pulsada subiendo y bajando el dedo.
  - **Indicador visual:** Solo visible mientras la tecla está pulsada (sin barras azules permanentes en reposo).
  - **Modos seleccionables para el Eje Y:**
    1. **Filtro** (paso bajo resonante tipo Moog).
    2. **Volumen** (dinámica / swell expresivo).
    3. **Distorsión** (drive / saturación cálida).

---

## 4. Panel de Control (Módulos)

### Barra superior (Header)
- Logo / marca **ÓRBITA**.
- **Botón Engranaje (Configuración 50→9):** Abre el modal de banco de 50 sonidos y 50 baterías para asignar los 9 huecos activos.
- **Botón Clave de Sol (Detector de Tonalidad):** Abre el modal de reconocimiento de tonalidad por micrófono.
- **Selector de Eje Y:** Alterna el parámetro controlado al deslizar el dedo en vertical (`Filtro` / `Volumen` / `Distorsión`).
- **Interruptor Key-Strike (`⚡`):** Activa/desactiva si al pulsar una tecla en acompañamiento automático suena además un golpe directo de acorde o solo abre la puerta del patrón (*Pure Gate*).

### Bloque Izquierdo (4 controles apilados)
1. **Modo (Melodía / Acordes):** Botón único que alterna entre 1 nota (icono corchea, LED esmeralda) y acorde de 3 notas (icono 3 notas apiladas, LED ámbar).
2. **Humanizador (0 a 3 LEDs cian):**
   - `0 LEDs`: notas simultáneas exactas.
   - `1 LED`: rasgueo sutil con micro-variación.
   - `2 LEDs`: separación media más orgánica y aleatoria en orden/velocidad.
   - `3 LEDs`: rasgueo amplio y muy expresivo.
3. **Reverb (0 a 3 LEDs violeta):**
   - **Apagada por defecto (`0 LEDs`)** para sonido seco y definido.
   - `1 LED`: poca reverb.
   - `2 LEDs`: reverb media.
   - `3 LEDs`: reverb abundante / atmosférica.
4. **Acompañamiento Automático (`0` a `9` con botones `◀` y `▶`):**
   - `0`: apagado (disparo manual normal).
   - `1`: Arpegio musical 1ª–3ª–5ª–3ª en **negras**.
   - `2`: Arpegio musical 1ª–3ª–5ª–3ª en **corcheas**.
   - `3`: **Walking Bass** rítmico no plano (bajo con pulso swing/sincopado 1ª–3ª–5ª–paso).
   - `4`–`9`: Patrones musicales ricos de golpeo de acordes y acompañamiento completo (combinando bajos graves y acordes en registro medio/alto: balada piano, pulso pop, bossa comping, neo-soul, rasgueo guitarra, etc.).

### Bloque de Tonalidad (Cuadrícula 2×2)
- Superior izquierda: Nota tónica actual (`DO`..`SI`).
- Superior derecha: `▲` (+1 semitono).
- Inferior izquierda: `M` (Mayor) o `m` (menor) — muestra directamente la letra activa y alterna al pulsar.
- Inferior derecha: `▼` (-1 semitono).

### Bloque Combinado Octava + Sonido
- Dos columnas juntas, cada una con pantalla arriba y flechas `▲` / `▼` apiladas verticalmente debajo:
  - **Octava:** `-2`, `-1`, `0`, `+1`, `+2`. Al subir/bajar, **suena inmediatamente** la nota/acorde de la tónica para oír la referencia.
  - **Sonido:** `1` a `9` (los 9 instrumentos seleccionados en el banco de 50 desde Configuración). Al subir/bajar, **suena inmediatamente** la referencia con el nuevo timbre.

### Bloque Combinado Tempo/Metrónomo + Batería
- **Tempo / BPM + Metrónomo:**
  - Pantalla con BPM + flechas `▲` / `▼` (soporte de pulsación prolongada).
  - **Tap Tempo:** Al hacer dos o más toques seguidos en el botón de tempo/metrónomo, calcula el BPM al instante.
  - **Toggle Metrónomo:** Enciende/apaga el clic del metrónomo (solo audible cuando el transporte está en marcha o en precuenta).
- **Batería 4/4:**
  - Número de patrón (`1` a `9`, elegidos del banco de 50 en Configuración).
  - Botón Play / Stop con icono altavoz o transporte.
  - Flechas `▲` / `▼` para cambiar de ritmo.

### Barra de Looper (Inferior del panel)
- **4 LEDs de pulso (compás 4/4)** + barra de progreso del bucle.
- Solo 3 botones icónicos: **REC (`●`)**, **PLAY/STOP (`▶`/`■`)**, **BORRAR (papelera)**.
- Flujo de grabación:
  1. Pulsar **REC**: detiene el transporte a 0 (esté o no encendida la batería) y lanza una **precuenta exacta de 4 clics (`1-2-3-4`)**.
  2. Al caer el tiempo 1 siguiente, comienza la grabación real sincronizada (si la batería estaba armada/activa, entra clavada en fase).
  3. Graba exactamente el sonido tal y como suena (con acordes, humanizador, reverb, filtro, etc.).
  4. Al volver a pulsar **REC**, cierra el bucle cuantizado al compás y empieza a reproducirse en loop continuo sin saltos ni silencios, permitiendo cambiar a Melodía o a otro sonido para tocar encima u overdub.

---

## 5. Servicio 1: Configuración (Banco 50 → 9)

Accesible desde el icono de **engranaje** en la barra superior (modal superpuesto con botón `✕` para volver):

- Dos pestañas: **Sonidos (50)** y **Baterías (50)**.
- **Lista de 50 Sonidos:**
  - Izquierda: casilla de selección que numera automáticamente `1, 2, 3... 9` según el orden de elección (máximo 9 activos; al desmarcar se renumeran o liberan huecos).
  - Centro: nombre descriptivo del sonido (empezando por *Bruma*, *Rhodes*, *Juno*, *Marimba*, *Órgano*, *Pluck*, etc.).
  - Derecha: botón **Play / Stop** de preescucha que reproduce en bucle (2–3 veces) una **pequeña frase melódica seguida de unos acordes** para evaluar el timbre en ambos modos.
- **Lista de 50 Patrones de Batería (4/4):**
  - Izquierda: selector numerado `1` a `9`.
  - Centro: nombre del ritmo (Lo-Fi, Pop, Bossa, House, Funk, Boom Bap, Reggae, Reggaeton, Afrobeat, etc.).
  - Derecha: botón **Play / Stop** de preescucha del patrón al BPM actual.
- Persistencia local (`localStorage`) para recordar los 9 elegidos entre sesiones.

---

## 6. Servicio 2: Detector de Tonalidad por Micrófono (Clave de Sol)

Accesible desde el icono de **clave de sol** en la barra superior (modal superpuesto con botón `✕` para volver):

- **Teclado cromático de 1 octava abajo:** 12 teclas completas (blancas: `Do, Re, Mi, Fa, Sol, La, Si`; negras: `Do#, Re#, Fa#, Sol#, La#`).
- **Referencia sonora al pulsar:** Si el usuario toca cualquier tecla de este teclado cromático, suena una nota sintetizada limpia para usarla como referencia vocal al cantar.
- **Captura y análisis en tiempo real:**
  - Botón para abrir/cerrar micrófono (`getUserMedia`, detección de pitch por autocorrelación / YIN).
  - **Buffer deslizante de 20 segundos** (con opción de limpiar/reiniciar).
  - Las frecuencias detectadas se mapean a las 12 clases de altura y cada tecla se colorea según un **baremo de 4 niveles** (presencia/estabilidad afinada en el buffer):
    - **Rojo** → presencia mínima / fuera de escala.
    - **Naranja** → presencia baja.
    - **Amarillo** → nota frecuente (candidata a la escala).
    - **Verde** → nota dominante / muy presente.
- **Cálculo de tonalidad:**
  - Con las notas acumuladas en **amarillo y verde**, estima la escala más probable (correlación Krumhansl-Schmuckler o coincidencia de 7 notas diatónicas).
  - Muestra el resultado en formato relativo claro cuando haya ambigüedad mayor/menor (ej. **`Do M / La m`**) o con preferencia si se identifica la tónica.
  - Botón directo para **Aplicar tonalidad a ÓRBITA** (ej. aplicar Mayor o aplicar su relativa menor) y volver con `✕`.
