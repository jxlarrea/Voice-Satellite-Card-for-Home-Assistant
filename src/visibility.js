/**
 * Voice Satellite Card — VisibilityManager
 *
 * Handles tab visibility changes: pauses mic and blocks events on hide,
 * resumes and restarts pipeline on show.
 */

import { State } from './constants.js';

export class VisibilityManager {
  constructor(card) {
    this._card = card;
    this._log = card.logger;

    this._isPaused = false;
    this._debounceTimer = null;
    this._handler = null;
  }

  get isPaused() {
    return this._isPaused;
  }

  setup() {
    var self = this;
    this._handler = function () {
      self._handleChange();
    };
    document.addEventListener('visibilitychange', this._handler);
  }

  // --- Private ---

  _handleChange() {
    var self = this;

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    if (document.hidden) {
      this._isPaused = true;

      var interactingStates = [State.WAKE_WORD_DETECTED, State.STT, State.INTENT, State.TTS];
      if (interactingStates.indexOf(this._card.currentState) !== -1) {
        this._log.log('visibility', 'Tab hidden during interaction — cleaning up UI');
        this._card.chat.clear();
        this._card.ui.hideBlurOverlay();
        this._card.pipeline.clearContinueState();
        if (this._card.tts.isPlaying) {
          this._card.tts.stop();
        }
      }

      this._debounceTimer = setTimeout(function () {
        self._log.log('visibility', 'Tab hidden — pausing mic');
        self._pause();
      }, 500);
    } else {
      this._log.log('visibility', 'Tab visible — resuming');
      this._resume();
    }
  }

  _pause() {
    this._isPaused = true;
    this._card.setState(State.PAUSED);
    this._card.audio.pause();
  }

  _resume() {
    if (!this._isPaused) return;
    this._isPaused = false;

    this._card.audio.resume();

    var audio = this._card.audio;
    var pipeline = this._card.pipeline;

    if (!audio.isStreaming && pipeline.isStreaming) {
      audio.startSending(function () { return pipeline.binaryHandlerId; });
    }

    pipeline.resetForResume();
    this._log.log('visibility', 'Resuming — restarting pipeline');
    pipeline.restart(0);
  }
}
