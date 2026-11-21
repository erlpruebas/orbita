/**
 * ui-modals.js — Modales de:
 * - Servicio 1: Configuración (Banco 50 → 9 para Sonidos, Acompañamientos y Baterías)
 * - Servicio 2: Detector de Tonalidad por Micrófono (Clave de Sol)
 * - Servicio 3: Estudio de Maqueta Multipista (2 Pistas: Música + Voz, Eco 0-3, Chorus 0-3, Recorte, Exportar .WAV)
 * - Servicio 4: Acceso Móvil / QR
 */

import { ensureAudioUnlocked } from './audio-core.js';
import { getState, setState } from './state.js';
import {
  SYNTH_PRESETS,
  playPresetPreviewOnce,
  stopPresetPreview,
  playTonicReferencePreview
} from './synth-presets.js';
import {
  ACCOMPANIMENT_PATTERNS,
  playAccompanimentPreviewOnce,
  stopAccompanimentPreview
} from './accompaniment.js';
import {
  DRUM_PATTERNS,
  playDrumPreviewOnce,
  stopDrumPreview
} from './drum-engine.js';
import {
  toggleMicrophoneCapture,
  stopMicrophoneCapture,
  clearTonalityBuffer,
  startChromaticReferenceNote,
  stopChromaticReferenceNote,
  simulateSingingScaleDemo,
  registerTonalityUIUpdater,
  computeTonalityAnalysis
} from './tonality-mic.js';
import {
  isDemoRecording,
  startDemoRecording,
  stopDemoRecording,
  getCurrentDemoSession,
  isDemoPreviewPlaying,
  startDemoPreviewPlayback,
  stopDemoPreviewPlayback,
  updateLivePreviewMix,
  renderFinalMixWav,
  getSavedVoiceSyncMs,
  saveVoiceSyncMs,
  formatElapsedTime,
  formatPreciseTime
} from './demo-recorder.js';

let activeConfigTab = 'sounds'; // 'sounds' | 'accomp' | 'drums'
let previewingId = null;
let lastDetectedKeyInfo = null;

// Estado del Estudio de Maqueta (2 pistas)
const studioMix = {
  musicVol: 0.90,
  voiceVol: 1.15,
  voiceEcho: 0,      // 0..3 LEDs cian
  voiceChorus: 0,    // 0..3 LEDs violeta
  voiceOffsetMs: -110, // Compensación de latencia en ms (negativo = adelanta la voz)
  trimStartSec: 0,
  trimEndSec: 0
};

function stopAllPreviews() {
  stopPresetPreview();
  stopAccompanimentPreview();
  stopDrumPreview();
  previewingId = null;
}

function triggerBlobDownload(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 400);
}

/**
 * Renderiza la lista de 50 sonidos, 50 acompañamientos o 50 baterías con sus huecos numerados 1..9
 */
export function renderConfigModalList() {
  const listEl = document.getElementById('config-list-container');
  const countEl = document.getElementById('config-slots-count');
  const tabSounds = document.getElementById('tab-btn-sounds');
  const tabAccomp = document.getElementById('tab-btn-accomp');
  const tabDrums = document.getElementById('tab-btn-drums');
  if (!listEl) return;

  const st = getState();
  let catalog = SYNTH_PRESETS;
  let selectedList = st.selectedSounds;

  if (activeConfigTab === 'accomp') {
    catalog = ACCOMPANIMENT_PATTERNS;
    selectedList = st.selectedAccompaniments;
  } else if (activeConfigTab === 'drums') {
    catalog = DRUM_PATTERNS;
    selectedList = st.selectedDrums;
  }

  if (tabSounds) tabSounds.classList.toggle('is-active', activeConfigTab === 'sounds');
  if (tabAccomp) tabAccomp.classList.toggle('is-active', activeConfigTab === 'accomp');
  if (tabDrums) tabDrums.classList.toggle('is-active', activeConfigTab === 'drums');
  if (countEl) countEl.textContent = `${selectedList.length} / 9`;

  listEl.innerHTML = '';

  catalog.forEach((item) => {
    const slotIdx = selectedList.indexOf(item.id);
    const isSelected = slotIdx !== -1;
    const slotNumber = isSelected ? (slotIdx + 1) : '';
    const isPreviewing = previewingId === `${activeConfigTab}_${item.id}`;

    const row = document.createElement('div');
    row.className = `bank-item${isSelected ? ' is-selected' : ''}`;

    const slotBtn = document.createElement('button');
    slotBtn.type = 'button';
    slotBtn.className = 'bank-slot-btn';
    slotBtn.textContent = isSelected ? String(slotNumber) : '·';
    slotBtn.title = isSelected ? `Hueco #${slotNumber} (pulsa para liberar)` : 'Asignar hueco (máx. 9)';

    const toggleSelection = () => {
      ensureAudioUnlocked();
      const stateNow = getState();
      const sourceArr = activeConfigTab === 'sounds'
        ? stateNow.selectedSounds
        : (activeConfigTab === 'accomp' ? stateNow.selectedAccompaniments : stateNow.selectedDrums);
      const curList = [...sourceArr];
      const existingIdx = curList.indexOf(item.id);

      if (existingIdx !== -1) {
        if (curList.length <= 1) return;
        curList.splice(existingIdx, 1);
      } else {
        if (curList.length >= 9) {
          curList[8] = item.id;
        } else {
          curList.push(item.id);
        }
      }

      if (activeConfigTab === 'sounds') {
        const nextActive = Math.min(stateNow.activeSoundSlot, curList.length - 1);
        setState({ selectedSounds: curList, activeSoundSlot: nextActive });
      } else if (activeConfigTab === 'accomp') {
        const nextAccomp = stateNow.accompaniment > curList.length ? curList.length : stateNow.accompaniment;
        setState({ selectedAccompaniments: curList, accompaniment: nextAccomp });
      } else {
        const nextActive = Math.min(stateNow.activeDrumSlot, curList.length - 1);
        setState({ selectedDrums: curList, activeDrumSlot: nextActive });
      }
      renderConfigModalList();
    };

    slotBtn.addEventListener('click', toggleSelection);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'bank-info';
    infoDiv.innerHTML = `
      <div class="bank-name">${String(item.id + 1).padStart(2, '0')} · ${item.name}</div>
      <div class="bank-meta">${item.category || ''}</div>
    `;
    infoDiv.addEventListener('click', toggleSelection);

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = `bank-preview-btn${isPreviewing ? ' is-previewing' : ''}`;
    prevBtn.title = 'Escuchar muestra (suena una vez)';
    prevBtn.innerHTML = `<svg viewBox="0 0 24 24"><use href="#icon-play"></use></svg>`;

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ensureAudioUnlocked();
      const key = `${activeConfigTab}_${item.id}`;

      stopAllPreviews();

      if (activeConfigTab === 'sounds') {
        playPresetPreviewOnce(item.id, (_id, active) => {
          previewingId = active ? key : null;
          renderConfigModalList();
        });
      } else if (activeConfigTab === 'accomp') {
        playAccompanimentPreviewOnce(item.id, (_id, active) => {
          previewingId = active ? key : null;
          renderConfigModalList();
        });
      } else {
        playDrumPreviewOnce(item.id, (_id, active) => {
          previewingId = active ? key : null;
          renderConfigModalList();
        });
      }
    });

    row.appendChild(slotBtn);
    row.appendChild(infoDiv);
    row.appendChild(prevBtn);
    listEl.appendChild(row);
  });
}

function openConfigModalToTab(tabName) {
  ensureAudioUnlocked();
  stopAllPreviews();
  activeConfigTab = tabName || 'sounds';
  renderConfigModalList();
  const modalConfig = document.getElementById('modal-config');
  if (modalConfig) modalConfig.hidden = false;
}

/**
 * Actualiza el DOM del Detector de Tonalidad (Clave de Sol)
 */
function updateTonalityModalDOM(snapshot) {
  const micBtn = document.getElementById('btn-mic-toggle');
  const micLabel = document.getElementById('mic-btn-label');
  if (micBtn) micBtn.classList.toggle('is-listening', Boolean(snapshot.isListening));
  if (micLabel) micLabel.textContent = snapshot.isListening ? 'ESCUCHANDO (PARAR)' : 'ABRIR MICRÓFONO';

  const liveBadge = document.getElementById('live-pitch-badge');
  if (liveBadge) {
    if (snapshot.livePitch) {
      const sign = snapshot.livePitch.centsOff >= 0 ? `+${snapshot.livePitch.centsOff}` : snapshot.livePitch.centsOff;
      liveBadge.textContent = `${snapshot.livePitch.noteName} · ${snapshot.livePitch.freq} Hz (${sign}c)`;
    } else {
      liveBadge.textContent = snapshot.isListening ? 'Canta o toca una melodía...' : 'Micrófono en pausa';
    }
  }

  const timeBadge = document.getElementById('buffer-time-badge');
  const progFill = document.getElementById('buffer-progress-fill');
  const sec = snapshot.elapsedWindowSec || 0;
  if (timeBadge) timeBadge.textContent = `${sec.toFixed(1)}s / 20s`;
  if (progFill) progFill.style.width = `${Math.min(100, (sec / 20) * 100).toFixed(1)}%`;

  const keys = document.querySelectorAll('.chromatic-keyboard [data-pc]');
  keys.forEach((keyEl) => {
    const pc = Number(keyEl.dataset.pc);
    const heat = snapshot.heatLevels ? (snapshot.heatLevels[pc] || 0) : 0;
    const pct = snapshot.normPercentages ? (snapshot.normPercentages[pc] || 0) : 0;
    keyEl.setAttribute('data-heat', String(heat));
    const bar = keyEl.querySelector('.chrom-heat-bar');
    if (bar) bar.style.height = `${pct}%`;
  });

  const keyValEl = document.getElementById('detected-key-value');
  const btnApplyMaj = document.getElementById('btn-apply-major');
  const btnApplyMin = document.getElementById('btn-apply-minor');

  if (snapshot.detected) {
    lastDetectedKeyInfo = snapshot.detected;
    if (keyValEl) keyValEl.textContent = snapshot.detected.combinedLabel;
    if (btnApplyMaj) {
      btnApplyMaj.disabled = false;
      btnApplyMaj.textContent = `APLICAR ${snapshot.detected.majorLabel.toUpperCase()}`;
    }
    if (btnApplyMin) {
      btnApplyMin.disabled = false;
      btnApplyMin.textContent = `APLICAR ${snapshot.detected.minorLabel.toUpperCase()}`;
    }
  } else {
    lastDetectedKeyInfo = null;
    if (keyValEl) keyValEl.textContent = '— / —';
    if (btnApplyMaj) {
      btnApplyMaj.disabled = true;
      btnApplyMaj.textContent = 'APLICAR MAYOR';
    }
    if (btnApplyMin) {
      btnApplyMin.disabled = true;
      btnApplyMin.textContent = 'APLICAR MENOR';
    }
  }
}

/**
 * =====================================================================
 * SERVICIO 3: ESTUDIO DE MAQUETA (2 PISTAS: MÚSICA + VOZ, FX Y RECORTE)
 * =====================================================================
 */
function drawTwoTrackWaveform(playheadSec = null) {
  const canvas = document.getElementById('demo-waveform-canvas');
  const session = getCurrentDemoSession();
  if (!canvas || !session) return;

  const ctx2d = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);

  // Fondo OLED
  ctx2d.fillStyle = '#07080a';
  ctx2d.fillRect(0, 0, w, h);

  // Línea central sutil
  ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx2d.beginPath();
  ctx2d.moveTo(0, h / 2);
  ctx2d.lineTo(w, h / 2);
  ctx2d.stroke();

  const bins = session.musicPeaks.length;
  const barW = w / bins;

  // Pista 1: Música (mitad superior / esmeralda)
  ctx2d.fillStyle = 'rgba(16, 185, 129, 0.78)';
  for (let i = 0; i < bins; i++) {
    const val = Math.min(1, session.musicPeaks[i] * 1.4);
    const barH = Math.max(1.5, val * (h * 0.44));
    ctx2d.fillRect(i * barW, h / 2 - barH, Math.max(1, barW - 0.6), barH);
  }

  // Pista 2: Voz (mitad inferior / ámbar), desplazada visualmente según `voiceOffsetMs`
  // para poder ver los picos vocales alineándose exactamente bajo los golpes de batería
  if (session.voicePeaks) {
    const shiftSec = (studioMix.voiceOffsetMs || 0) / 1000;
    const shiftBins = Math.round((shiftSec / Math.max(0.01, session.durationSec)) * bins);
    ctx2d.fillStyle = 'rgba(245, 158, 11, 0.85)';
    for (let i = 0; i < bins; i++) {
      // shiftBins negativo = adelantar la voz -> leemos muestras más adelante (i - shiftBins)
      const srcIdx = i - shiftBins;
      if (srcIdx < 0 || srcIdx >= bins) continue;
      const val = Math.min(1, session.voicePeaks[srcIdx] * 1.6);
      const barH = Math.max(1.5, val * (h * 0.44));
      ctx2d.fillRect(i * barW, h / 2, Math.max(1, barW - 0.6), barH);
    }
  }

  // Cortinas oscuras en las zonas recortadas (Inicio y Final)
  const dur = Math.max(0.01, session.durationSec);
  const startX = (studioMix.trimStartSec / dur) * w;
  const endX = (studioMix.trimEndSec / dur) * w;

  ctx2d.fillStyle = 'rgba(5, 6, 8, 0.72)';
  if (startX > 0) ctx2d.fillRect(0, 0, startX, h);
  if (endX < w) ctx2d.fillRect(endX, 0, w - endX, h);

  // Marcadores de recorte Inicio y Final en cian
  ctx2d.strokeStyle = '#22d3ee';
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(startX, 0);
  ctx2d.lineTo(startX, h);
  ctx2d.moveTo(endX, 0);
  ctx2d.lineTo(endX, h);
  ctx2d.stroke();

  // Cabezal de reproducción en vivo
  if (playheadSec !== null) {
    const px = Math.max(0, Math.min(w, (playheadSec / dur) * w));
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(px, 0);
    ctx2d.lineTo(px, h);
    ctx2d.stroke();
  }
}

function updateStudioControlsDOM() {
  const session = getCurrentDemoSession();
  if (!session) return;

  const trimReadout = document.getElementById('studio-trim-readout');
  const startValEl = document.getElementById('trim-start-val');
  const endValEl = document.getElementById('trim-end-val');
  const trimmedDur = Math.max(0.1, studioMix.trimEndSec - studioMix.trimStartSec);

  if (startValEl) startValEl.textContent = formatPreciseTime(studioMix.trimStartSec);
  if (endValEl) endValEl.textContent = formatPreciseTime(studioMix.trimEndSec);
  if (trimReadout) {
    trimReadout.textContent = `${formatPreciseTime(studioMix.trimStartSec)} — ${formatPreciseTime(studioMix.trimEndSec)} (${formatPreciseTime(trimmedDur)})`;
  }

  const mVal = document.getElementById('mix-music-val');
  const vVal = document.getElementById('mix-voice-val');
  const syncVal = document.getElementById('mix-sync-val');
  const syncSlider = document.getElementById('mix-voice-sync');
  if (mVal) mVal.textContent = `${Math.round(studioMix.musicVol * 100)}%`;
  if (vVal) vVal.textContent = `${Math.round(studioMix.voiceVol * 100)}%`;
  if (syncVal) {
    const ms = Math.round(studioMix.voiceOffsetMs || 0);
    syncVal.textContent = `${ms > 0 ? '+' : ''}${ms}ms`;
  }
  if (syncSlider) {
    syncSlider.value = String(Math.round(studioMix.voiceOffsetMs || 0));
  }

  // LEDs de Eco (0..3 cian)
  for (let i = 1; i <= 3; i++) {
    const led = document.getElementById(`echo-led-${i}`);
    if (led) led.classList.toggle('on-cyan', studioMix.voiceEcho >= i);
  }
  // LEDs de Chorus (0..3 violeta)
  for (let i = 1; i <= 3; i++) {
    const led = document.getElementById(`chorus-led-${i}`);
    if (led) led.classList.toggle('on-violet', studioMix.voiceChorus >= i);
  }

  drawTwoTrackWaveform(null);
}

function setPreviewPlayBtnState(playing) {
  const btn = document.getElementById('btn-demo-preview-play');
  const lbl = document.getElementById('demo-preview-label');
  if (btn) {
    btn.classList.toggle('is-playing', playing);
    const useEl = btn.querySelector('use');
    if (useEl) useEl.setAttribute('href', playing ? '#icon-stop' : '#icon-play');
  }
  if (lbl) lbl.textContent = playing ? 'PARAR' : 'ESCUCHAR MEZCLA';
}

function openDemoStudioModal(session) {
  const modal = document.getElementById('modal-demo-result');
  const warnEl = document.getElementById('demo-result-warning');
  const voiceRow = document.getElementById('mix-voice-row');
  const syncRow = document.getElementById('mix-sync-row');
  const btnEcho = document.getElementById('btn-voice-echo');
  const btnChorus = document.getElementById('btn-voice-chorus');
  const startRange = document.getElementById('trim-start-range');
  const endRange = document.getElementById('trim-end-range');
  const musicSlider = document.getElementById('mix-music-vol');
  const voiceSlider = document.getElementById('mix-voice-vol');
  const btnShare = document.getElementById('btn-share-demo');

  if (!modal || !session) return;

  // Inicializar parámetros del estudio usando la compensación de latencia medida o la calibración guardada
  studioMix.musicVol = 0.90;
  studioMix.voiceVol = 1.15;
  studioMix.voiceEcho = 0;
  studioMix.voiceChorus = 0;
  studioMix.voiceOffsetMs = getSavedVoiceSyncMs(session.autoMeasuredOffsetMs ?? -110);
  studioMix.trimStartSec = 0;
  studioMix.trimEndSec = session.durationSec;

  if (startRange) startRange.value = '0';
  if (endRange) endRange.value = '1000';
  if (musicSlider) musicSlider.value = '90';
  if (voiceSlider) voiceSlider.value = '115';

  if (voiceRow) voiceRow.classList.toggle('is-disabled', !session.hasVoiceTrack);
  if (syncRow) syncRow.classList.toggle('is-disabled', !session.hasVoiceTrack);
  if (btnEcho) btnEcho.disabled = !session.hasVoiceTrack;
  if (btnChorus) btnChorus.disabled = !session.hasVoiceTrack;

  if (warnEl) {
    if (!session.hasVoiceTrack && session.micWarning) {
      warnEl.textContent = session.micWarning;
      warnEl.hidden = false;
    } else {
      warnEl.hidden = true;
    }
  }

  if (btnShare) {
    const canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    btnShare.hidden = !canShare;
  }

  setPreviewPlayBtnState(false);
  updateStudioControlsDOM();
  modal.hidden = false;
}

export function initModalsUI() {
  const modalConfig = document.getElementById('modal-config');
  const modalTonality = document.getElementById('modal-tonality');
  const modalDemo = document.getElementById('modal-demo-result');

  // --- ACCESO DIRECTO DESDE LA BARRA OLED ESTÁTICA ---
  document.getElementById('status-pill-sound')?.addEventListener('click', () => openConfigModalToTab('sounds'));
  document.getElementById('status-pill-accomp')?.addEventListener('click', () => openConfigModalToTab('accomp'));
  document.getElementById('status-pill-drum')?.addEventListener('click', () => openConfigModalToTab('drums'));

  // --- SERVICIO 1: CONFIGURACIÓN (50 -> 9) ---
  document.getElementById('btn-open-config')?.addEventListener('click', () => openConfigModalToTab(activeConfigTab));
  document.getElementById('btn-close-config')?.addEventListener('click', () => {
    stopAllPreviews();
    if (modalConfig) modalConfig.hidden = true;
  });

  document.getElementById('tab-btn-sounds')?.addEventListener('click', () => {
    stopAllPreviews();
    activeConfigTab = 'sounds';
    renderConfigModalList();
  });
  document.getElementById('tab-btn-accomp')?.addEventListener('click', () => {
    stopAllPreviews();
    activeConfigTab = 'accomp';
    renderConfigModalList();
  });
  document.getElementById('tab-btn-drums')?.addEventListener('click', () => {
    stopAllPreviews();
    activeConfigTab = 'drums';
    renderConfigModalList();
  });

  // --- SERVICIO 2: DETECTOR DE TONALIDAD (CLAVE DE SOL) ---
  registerTonalityUIUpdater(updateTonalityModalDOM);

  document.getElementById('btn-open-tonality')?.addEventListener('click', () => {
    ensureAudioUnlocked();
    stopAllPreviews();
    updateTonalityModalDOM({ isListening: false, livePitch: null, ...computeTonalityAnalysis() });
    if (modalTonality) modalTonality.hidden = false;
  });

  document.getElementById('btn-close-tonality')?.addEventListener('click', () => {
    stopMicrophoneCapture();
    stopChromaticReferenceNote();
    if (modalTonality) modalTonality.hidden = true;
  });

  document.getElementById('btn-mic-toggle')?.addEventListener('click', async () => {
    ensureAudioUnlocked();
    const res = await toggleMicrophoneCapture(updateTonalityModalDOM);
    if (!res.ok && res.error) {
      const liveBadge = document.getElementById('live-pitch-badge');
      if (liveBadge) liveBadge.textContent = res.error;
    }
  });

  document.getElementById('btn-mic-clear')?.addEventListener('click', () => clearTonalityBuffer());
  document.getElementById('btn-mic-demo')?.addEventListener('click', () => {
    const st = getState();
    simulateSingingScaleDemo(st.rootSemitone, st.scaleMode, updateTonalityModalDOM);
  });

  document.getElementById('btn-apply-major')?.addEventListener('click', () => {
    if (!lastDetectedKeyInfo) return;
    stopMicrophoneCapture();
    setState({ rootSemitone: lastDetectedKeyInfo.majorRoot, scaleMode: 'M' });
    if (modalTonality) modalTonality.hidden = true;
    playTonicReferencePreview();
  });

  document.getElementById('btn-apply-minor')?.addEventListener('click', () => {
    if (!lastDetectedKeyInfo) return;
    stopMicrophoneCapture();
    setState({ rootSemitone: lastDetectedKeyInfo.minorRoot, scaleMode: 'm' });
    if (modalTonality) modalTonality.hidden = true;
    playTonicReferencePreview();
  });

  const chromKeys = document.querySelectorAll('.chromatic-keyboard [data-pc]');
  chromKeys.forEach((keyEl) => {
    const pc = Number(keyEl.dataset.pc);
    keyEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { keyEl.setPointerCapture(e.pointerId); } catch (_) {}
      keyEl.classList.add('is-playing');
      startChromaticReferenceNote(pc);
    });
    const endRef = () => {
      keyEl.classList.remove('is-playing');
      stopChromaticReferenceNote();
    };
    keyEl.addEventListener('pointerup', endRef);
    keyEl.addEventListener('pointercancel', endRef);
  });

  // --- SERVICIO 3: GRABADOR Y ESTUDIO DE MAQUETA (2 PISTAS) ---
  const btnDemoRec = document.getElementById('btn-demo-rec');
  const ledDemoRec = document.getElementById('demo-rec-led');
  const timerDemoRec = document.getElementById('demo-rec-timer');

  const updateDemoRecButtonUI = ({ recording, elapsedSec }) => {
    if (btnDemoRec) btnDemoRec.classList.toggle('is-demo-rec', Boolean(recording));
    if (ledDemoRec) ledDemoRec.classList.toggle('on-ruby', Boolean(recording));
    if (timerDemoRec) {
      timerDemoRec.hidden = !recording;
      if (recording) timerDemoRec.textContent = formatElapsedTime(elapsedSec);
    }
  };

  btnDemoRec?.addEventListener('click', async () => {
    ensureAudioUnlocked();
    if (!isDemoRecording()) {
      stopAllPreviews();
      stopMicrophoneCapture();
      stopDemoPreviewPlayback();
      await startDemoRecording(updateDemoRecButtonUI);
    } else {
      const session = await stopDemoRecording();
      updateDemoRecButtonUI({ recording: false, elapsedSec: 0 });
      if (session) {
        openDemoStudioModal(session);
      }
    }
  });

  // Sliders de Recorte Inicio / Final
  document.getElementById('trim-start-range')?.addEventListener('input', (e) => {
    const session = getCurrentDemoSession();
    if (!session) return;
    const rawSec = (Number(e.target.value) / 1000) * session.durationSec;
    const maxStart = Math.max(0, studioMix.trimEndSec - 0.2);
    studioMix.trimStartSec = Math.min(rawSec, maxStart);
    if (rawSec > maxStart) {
      e.target.value = String(Math.round((maxStart / session.durationSec) * 1000));
    }
    updateStudioControlsDOM();
  });

  document.getElementById('trim-end-range')?.addEventListener('input', (e) => {
    const session = getCurrentDemoSession();
    if (!session) return;
    const rawSec = (Number(e.target.value) / 1000) * session.durationSec;
    const minEnd = Math.min(session.durationSec, studioMix.trimStartSec + 0.2);
    studioMix.trimEndSec = Math.max(rawSec, minEnd);
    if (rawSec < minEnd) {
      e.target.value = String(Math.round((minEnd / session.durationSec) * 1000));
    }
    updateStudioControlsDOM();
  });

  // Sliders de Volumen Música y Volumen Voz (actualización EN VIVO)
  document.getElementById('mix-music-vol')?.addEventListener('input', (e) => {
    studioMix.musicVol = Number(e.target.value) / 100;
    updateStudioControlsDOM();
    updateLivePreviewMix(studioMix);
  });

  document.getElementById('mix-voice-vol')?.addEventListener('input', (e) => {
    studioMix.voiceVol = Number(e.target.value) / 100;
    updateStudioControlsDOM();
    updateLivePreviewMix(studioMix);
  });

  // Controles de Sincronización Voz vs Música (Compensación de latencia hardware en ms)
  const applyVoiceSyncOffset = (newMs, restartIfPlaying = true) => {
    const clamped = Math.max(-400, Math.min(150, Math.round(newMs)));
    studioMix.voiceOffsetMs = clamped;
    saveVoiceSyncMs(clamped);
    updateStudioControlsDOM();
    if (restartIfPlaying && isDemoPreviewPlaying()) {
      startDemoPreviewPlayback(
        studioMix,
        (posSec) => drawTwoTrackWaveform(posSec),
        () => {
          setPreviewPlayBtnState(false);
          drawTwoTrackWaveform(null);
        }
      );
    }
  };

  document.getElementById('mix-voice-sync')?.addEventListener('input', (e) => {
    applyVoiceSyncOffset(Number(e.target.value), false);
  });
  document.getElementById('mix-voice-sync')?.addEventListener('change', (e) => {
    applyVoiceSyncOffset(Number(e.target.value), true);
  });
  document.getElementById('btn-sync-minus')?.addEventListener('click', () => {
    applyVoiceSyncOffset((studioMix.voiceOffsetMs || 0) - 10, true);
  });
  document.getElementById('btn-sync-plus')?.addEventListener('click', () => {
    applyVoiceSyncOffset((studioMix.voiceOffsetMs || 0) + 10, true);
  });
  document.getElementById('btn-sync-auto')?.addEventListener('click', () => {
    const session = getCurrentDemoSession();
    if (!session) return;
    applyVoiceSyncOffset(session.autoMeasuredOffsetMs ?? -110, true);
  });

  // Botones de Eco Voz (0..3) y Chorus Voz (0..3) (actualización EN VIVO)
  document.getElementById('btn-voice-echo')?.addEventListener('click', () => {
    studioMix.voiceEcho = (studioMix.voiceEcho + 1) % 4;
    updateStudioControlsDOM();
    updateLivePreviewMix(studioMix);
  });

  document.getElementById('btn-voice-chorus')?.addEventListener('click', () => {
    studioMix.voiceChorus = (studioMix.voiceChorus + 1) % 4;
    updateStudioControlsDOM();
    updateLivePreviewMix(studioMix);
  });

  // Botón Escuchar Mezcla / Parar
  document.getElementById('btn-demo-preview-play')?.addEventListener('click', () => {
    ensureAudioUnlocked();
    if (isDemoPreviewPlaying()) {
      stopDemoPreviewPlayback();
      setPreviewPlayBtnState(false);
      drawTwoTrackWaveform(null);
      return;
    }
    const ok = startDemoPreviewPlayback(
      studioMix,
      (posSec) => drawTwoTrackWaveform(posSec),
      () => {
        setPreviewPlayBtnState(false);
        drawTwoTrackWaveform(null);
      }
    );
    if (ok) setPreviewPlayBtnState(true);
  });

  // Botón Exportar Mezcla Definitiva (.MP3)
  document.getElementById('btn-download-demo-wav')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'GENERANDO MP3...';
    try {
      const rendered = await renderFinalMixWav(studioMix);
      if (rendered?.blob) {
        triggerBlobDownload(rendered.blob, rendered.filename);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });

  // Botón Compartir Maqueta (.MP3) en móvil
  document.getElementById('btn-share-demo')?.addEventListener('click', async (e) => {
    if (typeof navigator.share !== 'function') return;
    const btn = e.currentTarget;
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'PREPARANDO MP3...';
    try {
      const rendered = await renderFinalMixWav(studioMix);
      if (rendered?.blob) {
        const file = new File([rendered.blob], rendered.filename, { type: rendered.mimeType || 'audio/mpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Maqueta ÓRBITA',
            text: 'Maqueta grabada y mezclada en ÓRBITA',
            files: [file]
          });
        }
      }
    } catch (_) {
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });

  document.getElementById('btn-close-demo-result')?.addEventListener('click', () => {
    stopDemoPreviewPlayback();
    setPreviewPlayBtnState(false);
    if (modalDemo) modalDemo.hidden = true;
  });

  [modalConfig, modalTonality, modalDemo].forEach((backdrop) => {
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        stopAllPreviews();
        stopMicrophoneCapture();
        stopChromaticReferenceNote();
        stopDemoPreviewPlayback();
        setPreviewPlayBtnState(false);
        backdrop.hidden = true;
      }
    });
  });
}
