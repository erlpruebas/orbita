/**
 * theory.js — Teoría musical diatónica, notas en español, tríadas y frecuencias
 */

export const NOTE_NAMES_UPPER = [
  'DO', 'DO#', 'RE', 'RE#', 'MI', 'FA',
  'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'
];

export const NOTE_NAMES_TITLE = [
  'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa',
  'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'
];

export const ROMAN_DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Atajos de PC inamovibles (REGLAS_NO_ROMPER.md #5): Z (I), S (II), X (III), D (IV), C (V), F (VI), V (VII)
export const DEGREE_SHORTCUTS = ['Z', 'S', 'X', 'D', 'C', 'F', 'V'];

// Escala Mayor natural (M) y menor natural (m)
const SCALE_INTERVALS = {
  M: [0, 2, 4, 5, 7, 9, 11],
  m: [0, 2, 3, 5, 7, 8, 10]
};

const SCALE_QUALITIES = {
  M: ['M', 'm', 'm', 'M', 'M', 'm', 'dim'],
  m: ['m', 'dim', 'M', 'm', 'm', 'M', 'M']
};

const CHORD_INTERVALS = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6]
};

const SEVENTH_INTERVALS = {
  M: 11,   // Maj7
  m: 10,   // m7
  dim: 10  // m7b5
};

/**
 * Convierte nota MIDI a frecuencia en Hz (LA4 = 69 = 440 Hz)
 */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convierte frecuencia en Hz a número MIDI flotante
 */
export function freqToMidiFloat(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Formatea la etiqueta del acorde en español: Do, Rem, Mim, Fa, Sol, Lam, Si°
 */
export function formatChordLabel(pitchClass, quality) {
  const base = NOTE_NAMES_TITLE[((pitchClass % 12) + 12) % 12];
  if (quality === 'm') return `${base}m`;
  if (quality === 'dim') return `${base}°`;
  return base;
}

/**
 * Devuelve la información completa de los 7 grados diatónicos para el estado actual
 */
export function getDiatonicDegrees(rootSemitone = 0, scaleMode = 'M', octaveOffset = 0) {
  const intervals = SCALE_INTERVALS[scaleMode] || SCALE_INTERVALS.M;
  const qualities = SCALE_QUALITIES[scaleMode] || SCALE_QUALITIES.M;
  const baseRootMidi = 60 + ((rootSemitone % 12) + 12) % 12 + (octaveOffset * 12);

  return intervals.map((semitones, idx) => {
    const noteMidi = baseRootMidi + semitones;
    const pitchClass = ((rootSemitone + semitones) % 12 + 12) % 12;
    const quality = qualities[idx];
    const triadOffsets = CHORD_INTERVALS[quality];
    const triadMidi = triadOffsets.map(offset => noteMidi + offset);

    // En grado V de escala Mayor la 7ª diatónica es menor (dominante 7: +10 semitonos)
    const seventhOffset = (scaleMode === 'M' && idx === 4) ? 10 : SEVENTH_INTERVALS[quality];
    const seventhMidi = noteMidi + seventhOffset;

    const midiOctave = Math.floor(noteMidi / 12) - 1;

    return {
      degreeIndex: idx,
      roman: ROMAN_DEGREES[idx],
      shortcut: DEGREE_SHORTCUTS[idx],
      pitchClass,
      quality,
      noteUpper: NOTE_NAMES_UPPER[pitchClass],
      noteTitle: NOTE_NAMES_TITLE[pitchClass],
      chordLabel: formatChordLabel(pitchClass, quality),
      melodyLabel: `${NOTE_NAMES_TITLE[pitchClass]}${midiOctave}`,
      rootMidi: noteMidi,
      triadMidi,
      seventhMidi
    };
  });
}

/**
 * Devuelve las notas MIDI a disparar según el modo activo ('chord' vs 'melody')
 */
export function getDegreeTriggerNotes(degreeIndex, state) {
  const degrees = getDiatonicDegrees(state.rootSemitone, state.scaleMode, state.octaveOffset);
  const deg = degrees[degreeIndex] || degrees[0];
  if (state.playMode === 'melody') {
    return [deg.rootMidi];
  }
  return deg.triadMidi;
}

/**
 * Calcula la pareja relativa Mayor / menor (ej. Do M / La m)
 */
export function getRelativePair(pitchClass, mode = 'M') {
  const pc = ((pitchClass % 12) + 12) % 12;
  if (mode === 'M') {
    const relMinor = (pc + 9) % 12;
    return {
      majorRoot: pc,
      minorRoot: relMinor,
      majorLabel: `${NOTE_NAMES_TITLE[pc]} M`,
      minorLabel: `${NOTE_NAMES_TITLE[relMinor]} m`,
      combinedLabel: `${NOTE_NAMES_TITLE[pc]} M / ${NOTE_NAMES_TITLE[relMinor]} m`
    };
  } else {
    const relMajor = (pc + 3) % 12;
    return {
      majorRoot: relMajor,
      minorRoot: pc,
      majorLabel: `${NOTE_NAMES_TITLE[relMajor]} M`,
      minorLabel: `${NOTE_NAMES_TITLE[pc]} m`,
      combinedLabel: `${NOTE_NAMES_TITLE[relMajor]} M / ${NOTE_NAMES_TITLE[pc]} m`
    };
  }
}
