/**
 * Voice Satellite Card
 * Transform your browser into a voice satellite for Home Assistant Assist
 */

import { VERSION } from './constants.js';
import { VoiceSatelliteCard } from './card.js';

// Register custom elements
customElements.define('voice-satellite-card', VoiceSatelliteCard);

// Register with HA custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'voice-satellite-card',
  name: 'Voice Satellite Card',
  description: 'Transform your browser into a voice satellite for Home Assistant Assist',
  preview: false,
  documentationURL: 'https://github.com/owner/voice-satellite-card',
});

console.info(
  '%c VOICE-SATELLITE-CARD %c v' + VERSION + ' ',
  'color: white; background: #03a9f4; font-weight: bold;',
  'color: #03a9f4; background: white; font-weight: bold;'
);