/**
 * Voice Satellite Card — ChatManager
 *
 * Manages chat message bubbles (user transcriptions and assistant responses),
 * streaming text fade effect, and legacy API wrappers.
 */

var FADE_LEN = 24;

export class ChatManager {
  constructor(card) {
    this._card = card;
    this._log = card.logger;

    this._streamEl = null;
    this._streamedResponse = '';
  }

  get streamEl() {
    return this._streamEl;
  }

  set streamEl(el) {
    this._streamEl = el;
  }

  get streamedResponse() {
    return this._streamedResponse;
  }

  set streamedResponse(val) {
    this._streamedResponse = val;
  }

  // --- Legacy API wrappers ---

  showTranscription(text) {
    if (!this._card.config.show_transcription) return;
    this.addUser(text);
  }

  hideTranscription() {
    // No-op: messages persist until clear()
  }

  showResponse(text) {
    if (!this._card.config.show_response) return;
    if (this._streamEl) {
      this._streamEl.textContent = text;
    } else {
      this.addAssistant(text);
    }
  }

  updateResponse(text) {
    if (!this._card.config.show_response) return;
    if (!this._streamEl) {
      this.addAssistant(text);
    } else {
      this._updateAssistant(text);
    }
  }

  hideResponse() {
    // No-op: messages persist until clear()
  }

  // --- Core Methods ---

  addUser(text) {
    var ui = this._card.ui.element;
    if (!ui) return;
    var cfg = this._card.config;
    var container = ui.querySelector('.vs-chat-container');
    container.classList.add('visible');

    var msg = document.createElement('div');
    msg.className = 'vs-chat-msg user';
    msg.textContent = text;
    msg.style.fontSize = cfg.transcription_font_size + 'px';
    msg.style.fontFamily = cfg.transcription_font_family;
    msg.style.color = cfg.transcription_font_color;
    msg.style.fontWeight = cfg.transcription_font_bold ? 'bold' : 'normal';
    msg.style.fontStyle = cfg.transcription_font_italic ? 'italic' : 'normal';
    msg.style.background = cfg.transcription_background;
    msg.style.border = '3px solid ' + cfg.transcription_border_color;
    msg.style.padding = cfg.transcription_padding + 'px';
    msg.style.borderRadius = cfg.transcription_rounded ? '12px' : '0';
    container.appendChild(msg);
  }

  addAssistant(text) {
    var ui = this._card.ui.element;
    if (!ui) return;
    var cfg = this._card.config;
    var container = ui.querySelector('.vs-chat-container');
    container.classList.add('visible');

    var msg = document.createElement('div');
    msg.className = 'vs-chat-msg assistant';
    msg.textContent = text;
    msg.style.fontSize = cfg.response_font_size + 'px';
    msg.style.fontFamily = cfg.response_font_family;
    msg.style.color = cfg.response_font_color;
    msg.style.fontWeight = cfg.response_font_bold ? 'bold' : 'normal';
    msg.style.fontStyle = cfg.response_font_italic ? 'italic' : 'normal';
    msg.style.background = cfg.response_background;
    msg.style.border = '3px solid ' + cfg.response_border_color;
    msg.style.padding = cfg.response_padding + 'px';
    msg.style.borderRadius = cfg.response_rounded ? '12px' : '0';
    container.appendChild(msg);

    this._streamEl = msg;
  }

  clear() {
    var ui = this._card.ui.element;
    if (!ui) return;
    var container = ui.querySelector('.vs-chat-container');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.classList.remove('visible');
    this._streamEl = null;
    this._streamedResponse = '';
  }

  // --- Private ---

  _updateAssistant(text) {
    if (!this._streamEl) return;

    if (text.length <= FADE_LEN) {
      this._streamEl.textContent = text;
      return;
    }

    var solid = text.slice(0, text.length - FADE_LEN);
    var tail = text.slice(text.length - FADE_LEN);

    var html = this._escapeHtml(solid);
    for (var i = 0; i < tail.length; i++) {
      var opacity = ((FADE_LEN - i) / FADE_LEN).toFixed(2);
      html += '<span style="opacity:' + opacity + '">' + this._escapeHtml(tail[i]) + '</span>';
    }
    this._streamEl.innerHTML = html;
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
