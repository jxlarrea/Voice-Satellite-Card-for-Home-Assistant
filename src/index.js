/**
 * Voice Satellite Card v2.5.0
 * Transform your browser into a voice satellite for Home Assistant Assist
 *
 * A custom Lovelace card that enables wake word detection, speech-to-text,
 * intent processing, and text-to-speech playback directly in the browser.
 */

import { VERSION } from './constants.js';
import { VoiceSatelliteCard } from './card.js';
import { VoiceSatelliteCardEditor } from './editor.js';

// Register custom elements
customElements.define('voice-satellite-card', VoiceSatelliteCard);
customElements.define('voice-satellite-card-editor', VoiceSatelliteCardEditor);

// Register with HA custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'voice-satellite-card',
  name: 'Voice Satellite Card',
  description: 'Transform your browser into a voice satellite for Home Assistant.',
  preview: false,
  documentationURL: 'https://github.com/jxlarrea/Voice-Satellite-Card-for-Home-Assistant',
});

console.info(
  '%c VOICE-SATELLITE-CARD %c v' + VERSION + ' ',
  'color: white; background: #03a9f4; font-weight: bold;',
  'color: #03a9f4; background: white; font-weight: bold;'
);
