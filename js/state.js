/**
 * state.js — Estado único reactivo y persistencia localStorage para ÓRBITA
 */

const STORAGE_KEY = 'orbita_hw_config_v1';

const DEFAULT_STATE = {
  // Tonalidad y escala
  rootSemitone: 0,       // 0 = DO, 1 = DO#, ..., 11 = SI
  scaleMode: 'M',        // 'M' (Mayor) | 'm' (menor natural)

  // Bloque izquierdo (4 controles)
  playMode: 'chord',     // 'chord' (Acordes - LED ámbar) | 'melody' (Melodía - LED esmeralda)
  humanize: 0,           // 0..3 LEDs cian
  reverbLevel: 0,        // 0..3 LEDs violeta (ESTRICTAMENTE 0 POR DEFECTO - REGLA 4)
  accompaniment: 0,      // 0 = Manual (apagado), 1..9 = hueco activo de selectedAccompaniments
  selectedAccompaniments: [0, 1, 2, 3, 4, 5, 6, 7, 8], // 9 huecos elegidos del banco de 50 acompañamientos

  // Header controls
  yAxisMode: 'filter',   // 'filter' (Filtro) | 'volume' (Volumen) | 'drive' (Distorsión)
  keyStrike: true,       // ⚡ ON = golpe directo + patrón; OFF = Pure Gate

  // Octava y Sonido
  octaveOffset: 0,       // -2, -1, 0, +1, +2
  activeSoundSlot: 0,    // 0..8 (mostrado como 1..9)
  selectedSounds: [0, 1, 2, 3, 4, 5, 6, 7, 8], // Primeros 6 = originales v01/v04 (Bruma, Rhodes, Juno, Marimba, Órgano, Pluck)

  // Tempo, Metrónomo y Batería
  bpm: 92,               // 40..220 BPM
  metronomeEnabled: false, // ESTRICTAMENTE false en reposo (REGLA 1)
  activeDrumSlot: 0,     // 0..8 (mostrado como 1..9)
  selectedDrums: [0, 1, 2, 3, 4, 5, 6, 7, 8],  // Primeras 6 = originales v01/v04 (Lo-Fi, Pop, Bossa, House, Pulso, Funk)
  drumPlaying: false,

  // Looper
  looperState: 'idle',   // 'idle' | 'countin' | 'recording' | 'playing'
  loopBars: 0,           // 0, 1, 2, 4, 8
  currentBeat: -1,       // -1 en reposo, 0..3 en marcha
  currentStep: 0         // 0..15
};

function loadPersistedConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const safe = {};

    if (Array.isArray(parsed.selectedSounds) && parsed.selectedSounds.length >= 1 && parsed.selectedSounds.length <= 9) {
      safe.selectedSounds = parsed.selectedSounds.map(n => Math.max(0, Math.min(49, Number(n) || 0)));
    }
    if (Array.isArray(parsed.selectedDrums) && parsed.selectedDrums.length >= 1 && parsed.selectedDrums.length <= 9) {
      safe.selectedDrums = parsed.selectedDrums.map(n => Math.max(0, Math.min(49, Number(n) || 0)));
    }
    if (Array.isArray(parsed.selectedAccompaniments) && parsed.selectedAccompaniments.length >= 1 && parsed.selectedAccompaniments.length <= 9) {
      safe.selectedAccompaniments = parsed.selectedAccompaniments.map(n => Math.max(0, Math.min(49, Number(n) || 0)));
    }
    if (typeof parsed.rootSemitone === 'number') {
      safe.rootSemitone = ((parsed.rootSemitone % 12) + 12) % 12;
    }
    if (parsed.scaleMode === 'M' || parsed.scaleMode === 'm') {
      safe.scaleMode = parsed.scaleMode;
    }
    if (typeof parsed.bpm === 'number' && parsed.bpm >= 40 && parsed.bpm <= 220) {
      safe.bpm = Math.round(parsed.bpm);
    }
    if (['filter', 'volume', 'drive'].includes(parsed.yAxisMode)) {
      safe.yAxisMode = parsed.yAxisMode;
    }
    if (typeof parsed.keyStrike === 'boolean') {
      safe.keyStrike = parsed.keyStrike;
    }
    return safe;
  } catch (_) {
    return {};
  }
}

const state = {
  ...DEFAULT_STATE,
  ...loadPersistedConfig()
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  let changed = false;
  const changedKeys = [];
  for (const [k, v] of Object.entries(patch)) {
    if (state[k] !== v) {
      state[k] = v;
      changed = true;
      changedKeys.push(k);
    }
  }
  if (changed) {
    persistConfig();
    for (const fn of listeners) {
      fn(state, changedKeys);
    }
  }
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function persistConfig() {
  try {
    const toSave = {
      selectedSounds: state.selectedSounds,
      selectedDrums: state.selectedDrums,
      selectedAccompaniments: state.selectedAccompaniments,
      rootSemitone: state.rootSemitone,
      scaleMode: state.scaleMode,
      bpm: state.bpm,
      yAxisMode: state.yAxisMode,
      keyStrike: state.keyStrike
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
}
