/**
 * Voice Satellite Card — Editor Preview
 *
 * Renders a self-contained preview inside the shadow DOM when the card
 * is displayed in the HA card editor. Shows the activity bar, blur overlay,
 * and sample transcription/response bubbles with current config styling.
 */

import { seamlessGradient } from './constants.js';

/**
 * Walk up the DOM/shadow DOM tree to detect if the card is inside
 * the HA card editor preview pane.
 */
export function isEditorPreview(element) {
  var el = element;
  var depth = 0;
  while (el && depth < 30) {
    var tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'hui-card-preview' ||
        tag === 'hui-card-edit-mode' ||
        tag === 'hui-dialog-edit-card' ||
        tag === 'dialog-edit-card') {
      return true;
    }
    if (el.parentElement) {
      el = el.parentElement;
    } else if (el.getRootNode && el.getRootNode() !== el) {
      el = el.getRootNode().host;
    } else {
      break;
    }
    depth++;
  }
  return false;
}

/**
 * Render a live preview into the given shadow root using current config.
 */
export function renderPreview(shadowRoot, config) {
  var cfg = config;

  var barGradient = seamlessGradient(cfg.bar_gradient);
  var barPos = cfg.bar_position === 'top' ? 'top: 0;' : 'bottom: 0;';
  var blurStyle = cfg.background_blur
    ? 'backdrop-filter: blur(' + cfg.background_blur_intensity + 'px); -webkit-backdrop-filter: blur(' + cfg.background_blur_intensity + 'px); background: rgba(0,0,0,0.3);'
    : '';

  var transcriptionHtml = '';
  if (cfg.show_transcription) {
    transcriptionHtml =
      '<div class="preview-bubble transcription" style="' +
      'font-size:' + cfg.transcription_font_size + 'px;' +
      'font-family:' + cfg.transcription_font_family + ';' +
      'color:' + cfg.transcription_font_color + ';' +
      'font-weight:' + (cfg.transcription_font_bold ? 'bold' : 'normal') + ';' +
      'font-style:' + (cfg.transcription_font_italic ? 'italic' : 'normal') + ';' +
      'background:' + cfg.transcription_background + ';' +
      'border: 2px solid ' + cfg.transcription_border_color + ';' +
      'padding:' + cfg.transcription_padding + 'px;' +
      (cfg.transcription_rounded ? 'border-radius: 12px;' : '') +
      '">What\'s the weather like?</div>';
  }

  var responseHtml = '';
  if (cfg.show_response) {
    responseHtml =
      '<div class="preview-bubble response" style="' +
      'font-size:' + cfg.response_font_size + 'px;' +
      'font-family:' + cfg.response_font_family + ';' +
      'color:' + cfg.response_font_color + ';' +
      'font-weight:' + (cfg.response_font_bold ? 'bold' : 'normal') + ';' +
      'font-style:' + (cfg.response_font_italic ? 'italic' : 'normal') + ';' +
      'background:' + cfg.response_background + ';' +
      'border: 2px solid ' + cfg.response_border_color + ';' +
      'padding:' + cfg.response_padding + 'px;' +
      (cfg.response_rounded ? 'border-radius: 12px;' : '') +
      '">It\'s 72°F and sunny.</div>';
  }

  var timerHtml = '';
  if (cfg.satellite_entity) {
    var timerPosition = cfg.timer_position || 'top-right';
    var timerPosStyle = '';
    var barH = cfg.bar_height || 16;
    var gap = 12;
    if (timerPosition.indexOf('top') >= 0) {
      var topOffset = (cfg.bar_position === 'top') ? (barH + gap) : gap;
      timerPosStyle += 'top:' + topOffset + 'px;bottom:auto;';
    } else {
      var bottomOffset = (cfg.bar_position === 'bottom') ? (barH + gap) : gap;
      timerPosStyle += 'bottom:' + bottomOffset + 'px;top:auto;';
    }
    if (timerPosition.indexOf('left') >= 0) {
      timerPosStyle += 'left:' + gap + 'px;right:auto;';
    } else {
      timerPosStyle += 'right:' + gap + 'px;left:auto;';
    }

    timerHtml =
      '<div class="preview-timer" style="' +
      'position:absolute;' + timerPosStyle +
      'font-size:' + cfg.timer_font_size + 'px;' +
      'font-family:' + cfg.timer_font_family + ';' +
      'color:' + cfg.timer_font_color + ';' +
      'font-weight:' + (cfg.timer_font_bold ? 'bold' : 'normal') + ';' +
      'font-style:' + (cfg.timer_font_italic ? 'italic' : 'normal') + ';' +
      'background:' + cfg.timer_background + ';' +
      'border: 3px solid ' + cfg.timer_border_color + ';' +
      'padding:' + cfg.timer_padding + 'px;' +
      (cfg.timer_rounded ? 'border-radius: 12px;' : '') +
      'overflow:hidden;z-index:2;' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
      '">' +
      '<div style="position:absolute;top:0;left:0;bottom:0;width:65%;background:' +
      (cfg.timer_border_color || 'rgba(100,200,150,0.5)') + ';opacity:0.3;"></div>' +
      '<div style="position:relative;display:flex;align-items:center;gap:6px;">' +
      '<span>⏱</span>' +
      '<span>04:32</span>' +
      '</div>' +
      '</div>';
  }

  shadowRoot.innerHTML =
    '<style>' +
    ':host { display: block; }' +
    '.preview-container {' +
    '  position: relative;' +
    '  width: 100%;' +
    '  height: 300px;' +
    '  overflow: hidden;' +
    '  border-radius: var(--ha-card-border-radius, 12px);' +
    '  background: var(--card-background-color, #1c1c1c);' +
    '}' +
    '.preview-bg {' +
    '  position: absolute;' +
    '  top: 0; left: 0; right: 0; bottom: 0;' +
    '  background-image:' +
    '    linear-gradient(45deg, #808080 25%, transparent 25%),' +
    '    linear-gradient(-45deg, #808080 25%, transparent 25%),' +
    '    linear-gradient(45deg, transparent 75%, #808080 75%),' +
    '    linear-gradient(-45deg, transparent 75%, #808080 75%);' +
    '  background-size: 40px 40px;' +
    '  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;' +
    '  background-color: #a0a0a0;' +
    '  opacity: 0.4;' +
    '}' +
    '.preview-blur {' +
    '  position: absolute;' +
    '  top: 0; left: 0; right: 0; bottom: 0;' +
    '  ' + blurStyle +
    '}' +
    '.preview-bar {' +
    '  position: absolute;' +
    '  left: 0; right: 0;' +
    '  ' + barPos +
    '  height: ' + cfg.bar_height + 'px;' +
    '  background: ' + barGradient + ';' +
    '  background-size: 200% 100%;' +
    '  animation: preview-flow 3s linear infinite;' +
    '}' +
    '.preview-bubbles {' +
    '  position: absolute;' +
    '  left: 50%; top: 50%;' +
    '  transform: translate(-50%, -50%);' +
    '  display: flex;' +
    '  flex-direction: column;' +
    '  align-items: center;' +
    '  gap: 8px;' +
    '  width: 90%;' +
    '}' +
    '.preview-bubble {' +
    '  max-width: 100%;' +
    '  text-align: center;' +
    '  line-height: 1.2;' +
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
    '}' +
    '@keyframes preview-flow {' +
    '  0% { background-position: 0% 50%; }' +
    '  100% { background-position: 200% 50%; }' +
    '}' +
    '</style>' +
    '<div class="preview-container">' +
    '<div class="preview-bg"></div>' +
    '<div class="preview-blur"></div>' +
    '<div class="preview-bubbles">' +
    transcriptionHtml +
    responseHtml +
    '</div>' +
    '<div class="preview-bar"></div>' +
    timerHtml +
    '</div>';
}