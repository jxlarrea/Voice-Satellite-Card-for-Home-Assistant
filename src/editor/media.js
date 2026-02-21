/**
 * Voice Satellite Card — Editor: Volume, Chimes & Announcements
 */

export const mediaSchema = [
  {
    type: 'expandable', name: '', title: 'TTS Output', flatten: true,
    schema: [
      { name: 'tts_target', selector: { entity: { filter: { domain: 'media_player' } } } },
    ],
  },

  // Announcements
  {
    type: 'expandable', name: '', title: 'Announcements', flatten: true,
    schema: [
      { name: 'announcement_display_duration', selector: { number: { min: 1, max: 60, step: 1, unit_of_measurement: 's', mode: 'slider' } } },
    ],
  },
];

export const mediaLabels = {
  tts_target: 'TTS output device',
  announcement_display_duration: 'Announcement display duration',
};

export const mediaHelpers = {
  tts_target: 'Leave empty for browser audio, or select a media player entity',
  announcement_display_duration: 'Seconds to show announcement bubble after playback',
};
