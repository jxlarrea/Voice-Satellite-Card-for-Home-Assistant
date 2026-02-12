/**
 * Voice Satellite Card — CSS Styles
 */

export const STYLES =
  '#voice-satellite-ui .vs-blur-overlay {' +
  'position: fixed; top: 0; left: 0; right: 0; bottom: 0;' +
  'backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);' +
  'background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s ease;' +
  'z-index: 9999; pointer-events: none;' +
  '}' +
  '#voice-satellite-ui .vs-blur-overlay.visible { opacity: 1; }' +

  '#voice-satellite-ui .vs-start-btn {' +
  'position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;' +
  'border-radius: 50%; background: var(--primary-color, #03a9f4);' +
  'border: none; cursor: pointer; display: none; align-items: center;' +
  'justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);' +
  'z-index: 10001; transition: transform 0.2s, box-shadow 0.2s;' +
  '}' +
  '#voice-satellite-ui .vs-start-btn.visible { display: flex; animation: vs-btn-pulse 2s ease-in-out infinite; }' +
  '#voice-satellite-ui .vs-start-btn:hover {' +
  'transform: scale(1.1); box-shadow: 0 6px 16px rgba(0,0,0,0.4); animation: none;' +
  '}' +
  '#voice-satellite-ui .vs-start-btn svg { width: 28px; height: 28px; fill: white; }' +
  '@keyframes vs-btn-pulse {' +
  '0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }' +
  '50% { transform: scale(1.08); box-shadow: 0 6px 20px rgba(3,169,244,0.5); }' +
  '}' +

  '#voice-satellite-ui .vs-rainbow-bar {' +
  'position: fixed; left: 0; right: 0;' +
  'background-size: 200% 100%; opacity: 0; transition: opacity 0.3s ease;' +
  'z-index: 10000; pointer-events: none;' +
  '}' +

  '#voice-satellite-ui .vs-chat-container {' +
  'position: fixed; left: 50%; transform: translateX(-50%);' +
  'display: none; flex-direction: column; align-items: center; gap: 8px;' +
  'max-width: 80%; width: 80%; z-index: 10001;' +
  'pointer-events: none; overflow: visible;' +
  '}' +
  '#voice-satellite-ui .vs-chat-container.visible { display: flex; pointer-events: auto; }' +
  '#voice-satellite-ui .vs-chat-msg {' +
  'max-width: 85%; padding: 12px; opacity: 0; text-align: center;' +
  'box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
  'animation: vs-chat-fade-in 0.3s ease forwards;' +
  'word-wrap: break-word;' +
  '}' +
  '@keyframes vs-chat-fade-in {' +
  '0% { opacity: 0; transform: translateY(8px); }' +
  '100% { opacity: 1; transform: translateY(0); }' +
  '}' +
  '#voice-satellite-ui .vs-rainbow-bar.visible { opacity: 1; }' +
  '#voice-satellite-ui .vs-rainbow-bar.connecting {' +
  'animation: vs-bar-breathe 1.5s ease-in-out infinite;' +
  '}' +
  '#voice-satellite-ui .vs-rainbow-bar.listening {' +
  'animation: vs-gradient-flow 3s linear infinite;' +
  '}' +
  '#voice-satellite-ui .vs-rainbow-bar.processing {' +
  'animation: vs-gradient-flow 0.5s linear infinite;' +
  '}' +
  '#voice-satellite-ui .vs-rainbow-bar.speaking {' +
  'animation: vs-gradient-flow 2s linear infinite;' +
  '}' +
  '#voice-satellite-ui .vs-rainbow-bar.error-mode {' +
  'animation: vs-gradient-flow 2s linear infinite; opacity: 1;' +
  '}' +
  '@keyframes vs-gradient-flow {' +
  '0% { background-position: 0% 50%; }' +
  '100% { background-position: 200% 50%; }' +
  '}' +
  '@keyframes vs-bar-breathe {' +
  '0%, 100% { opacity: 0.3; }' +
  '50% { opacity: 0.7; }' +
  '}';
