# HISTORIAL_VERSIONES.md — Mapa de las 14 Versiones del Chat

Para rescatar los códigos originales que más te gustaron del chat de Gemini, entra en la pestaña **Código** del Canvas de cada mensaje correspondiente y guarda los archivos en la carpeta `referencias/`.

| Versión | Turno del chat (aprox.) | Qué aportó esta versión | Valor para rescatar |
| :--- | :--- | :--- | :--- |
| **v01** | Respuesta 1 ("Orbita-disposiciones...") | Primer prototipo completo con **6 sonidos originales** (*Bruma*, *Rhodes*, *Juno*, *Marimba*, *Órgano*, *Pluck*) y **6 baterías originales** (Lo-Fi, Pop, Bossa, House, Pulso, Funk) + botón Fijar acorde. | **ALTO** — Contiene los timbres y baterías base originales que te gustaron mucho. |
| **v02** | Respuesta 2 ("Los controles hay que hacerlos más pequeños...") | Primera versión **100% iconográfica** (sin texto), cuadrícula 2×2 de tonalidad, detección Portrait/Landscape y captura 1 (`capturas/01_escritorio_referencia_base.jpg`). | Medio — Referencia de transición gráfica. |
| **v03** | Respuesta 3 ("dividir el botón de melodía... humanizar...") | Añadió **Humanizador**, módulos combinados Octava+Sonido y Tempo+Batería. **Aquí cambiaron sonidos/baterías y apareció reverb fija** (te gustó la gráfica — ver `capturas/02_escritorio_ui_aprobada.jpg`). | **ALTO (UI)** — Muy buena referencia de la parte gráfica aprobada. |
| **v04** | Respuesta 4 ("vuelve a los sonidos... ZSEXD C...") | **Restauró los 6 sonidos originales**, amplió a **20 baterías**, añadió toggle de **Reverb OFF por defecto** y fijó el teclado **`Z-S-X-D-C-F-V`**. | **MUY ALTO** — Combinación limpia de buena gráfica + sonidos restaurados + 20 baterías + mapeo `Z-S-X-D-C-F-V`. |
| **v05** | Respuesta 5 ("una, dos o tres lucecitas... 20 sonidos... arpegiador") | Humanizador 0–3 LEDs, Reverb 0–3 LEDs, preview sonoro al cambiar octava/sonido, **20 sonidos** (el #2 fallaba aquí) y primer arpegiador/acompañamiento 0–9. | Medio — Referencia de los 20 presets de synth. |
| **v06** | Respuesta 6 ("1ª-3ª-5ª-3ª negras y corcheas... tap tempo... eje Y") | Añadió **Tap Tempo**, selector de modificador en eje Y (Filtro/Pitch/Distorsión) y primer intento de *late-press catch-up*. | Medio. |
| **v07** | Respuesta 7 ("selector que cuando tocas suene o no... metrónomo parado") | Añadió interruptor **Key-Strike vs Pure Gate (`⚡`)** y regla estricta de silencio del metrónomo en reposo. | Medio. |
| **v08** | Respuesta 8 ("walking bass... flechas izquierda/derecha...") | Introdujo **AudioWorklet looper**, patrón **Walking Bass** y flechas `◀` `▶` en acompañamiento. *(Aquí se rompió el layout móvil — ver `capturas/03_movil_error_recorte_NO_USAR.jpg`).* | Bajo (UI rota) / Útil solo si quieres revisar el AudioWorklet. |
| **v09** | Respuesta 9 ("vuelve a que gráficamente se vea como antes") | Restauró estética compacta y corrigió los 20 presets. *(Dio fallo de silencio en tu prueba: "No suenan los sonidos").* | **NO USAR** (fallo de audio). |
| **v10** | Respuesta 10 ("No suenan los sonidos") | Reparó el desbloqueo del `AudioContext` para que volviera a sonar todo. | Bajo — Superada por v11–v14. |
| **v11** | Respuesta 11 ("todo tiene que caber en vertical y escalas las teclas") | Fijó `100dvh` con escalado `flex: 1` de teclas en vertical sin recortes y *catch-up* inicial. | **ALTO (CSS móvil)** — Muy útil para comprobar el ajuste vertical en móvil. |
| **v12** | Respuesta 12 ("cuando no tengo batería el metrónomo parado... más musical") | Mejoró la musicalidad de los **9 patrones de acompañamiento** y el reinicio a 0 con precuenta al grabar. | **ALTO (Acompañamiento)** — Referencia de los 9 patrones musicales. |
| **v13** | Respuesta 13 ("Continua") | Consolidación del motor de eventos del looper y los 20 presets. | Medio. |
| **v14** | Respuesta 15 ("50 sonidos, 50 baterías... clave de sol micrófono") | Última versión completa: añade **Configuración 50→9** (con preescucha) y **Detector de tonalidad por micrófono** (buffer 20 s + teclado cromático de referencia) + eje Y Filtro/Volumen/Distorsión. | **MUY ALTO (Base actual)** — Punto de partida con todas las funciones nuevas. |

---

## Recomendación de mínimo viable para guardar en `referencias/`

No hace falta que copies las 14 versiones. Con guardar estas **4** en `referencias/` tienes el 100% del oro del proyecto:
1. `referencias/v01_sonidos_y_baterias_originales.html` (de la Respuesta 1)
2. `referencias/v04_ui_aprobada_y_20_baterias.html` (de la Respuesta 4)
3. `referencias/v12_acompanamientos_musicales.html` (de la Respuesta 12)
4. `referencias/v14_completa_50_y_micro.html` (de la última respuesta con Canvas)
