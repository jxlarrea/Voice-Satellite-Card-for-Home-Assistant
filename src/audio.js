/**
 * Voice Satellite Card — AudioManager
 *
 * Handles microphone acquisition, AudioWorklet/ScriptProcessor capture,
 * resampling to 16 kHz, and binary audio transmission via WebSocket.
 */

export class AudioManager {
  constructor(card) {
    this._card = card;
    this._log = card.logger;

    this._audioContext = null;
    this._mediaStream = null;
    this._sourceNode = null;
    this._workletNode = null;
    this._scriptProcessor = null;
    this._audioBuffer = [];
    this._sendInterval = null;
    this._actualSampleRate = 16000;
  }

  get audioContext() {
    return this._audioContext;
  }

  get isStreaming() {
    return !!this._sendInterval;
  }

  // --- Public API ---

  async startMicrophone() {
    await this._ensureAudioContextRunning();

    var config = this._card.config;
    this._log.log('mic', 'AudioContext state=' + this._audioContext.state +
      ' sampleRate=' + this._audioContext.sampleRate);

    var audioConstraints = {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: config.echo_cancellation,
      noiseSuppression: config.noise_suppression,
      autoGainControl: config.auto_gain_control,
    };

    if (config.voice_isolation) {
      audioConstraints.advanced = [{ voiceIsolation: true }];
    }

    this._mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
    });

    if (config.debug) {
      var tracks = this._mediaStream.getAudioTracks();
      this._log.log('mic', 'Got media stream with ' + tracks.length + ' audio track(s)');
      if (tracks.length > 0) {
        var settings = tracks[0].getSettings();
        this._log.log('mic', 'Track settings: ' + JSON.stringify(settings));
      }
    }

    this._sourceNode = this._audioContext.createMediaStreamSource(this._mediaStream);
    this._actualSampleRate = this._audioContext.sampleRate;

    this._log.log('mic', 'Actual sample rate: ' + this._actualSampleRate);

    try {
      await this._setupAudioWorklet(this._sourceNode);
      this._log.log('mic', 'Audio capture via AudioWorklet');
    } catch (e) {
      this._log.log('mic', 'AudioWorklet unavailable (' + e.message + '), using ScriptProcessor');
      this._setupScriptProcessor(this._sourceNode);
      this._log.log('mic', 'Audio capture via ScriptProcessor');
    }
  }

  stopMicrophone() {
    this.stopSending();
    if (this._workletNode) {
      this._workletNode.disconnect();
      this._workletNode = null;
    }
    if (this._scriptProcessor) {
      this._scriptProcessor.disconnect();
      this._scriptProcessor = null;
    }
    if (this._sourceNode) {
      this._sourceNode.disconnect();
      this._sourceNode = null;
    }
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach(function (track) { track.stop(); });
      this._mediaStream = null;
    }
    this._audioBuffer = [];
  }

  startSending(binaryHandlerIdGetter) {
    var self = this;
    this.stopSending();
    this._sendInterval = setInterval(function () {
      self._sendAudioBuffer(binaryHandlerIdGetter());
    }, 100);
  }

  stopSending() {
    if (this._sendInterval) {
      clearInterval(this._sendInterval);
      this._sendInterval = null;
    }
  }

  pause() {
    this.stopSending();
    if (this._mediaStream) {
      this._mediaStream.getAudioTracks().forEach(function (track) {
        track.enabled = false;
      });
    }
  }

  resume() {
    if (this._mediaStream) {
      this._mediaStream.getAudioTracks().forEach(function (track) {
        track.enabled = true;
      });
    }
  }

  async ensureAudioContextForGesture() {
    try {
      if (!this._audioContext) {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000,
        });
      }
      if (this._audioContext.state === 'suspended') {
        await this._audioContext.resume();
      }
    } catch (e) {
      this._log.error('mic', 'Failed to resume AudioContext on click: ' + e);
    }
  }

  // --- Private ---

  async _ensureAudioContextRunning() {
    if (!this._audioContext) {
      this._audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
    }
    if (this._audioContext.state === 'suspended') {
      this._log.log('mic', 'Resuming suspended AudioContext');
      await this._audioContext.resume();
    }
    if (this._audioContext.state !== 'running') {
      throw new Error('AudioContext failed to start: ' + this._audioContext.state);
    }
  }

  async _setupAudioWorklet(sourceNode) {
    var workletCode =
      'class VoiceSatelliteProcessor extends AudioWorkletProcessor {' +
      'constructor() { super(); this.buffer = []; }' +
      'process(inputs, outputs, parameters) {' +
      'var input = inputs[0];' +
      'if (input && input[0]) {' +
      'var channelData = new Float32Array(input[0]);' +
      'this.port.postMessage(channelData);' +
      '}' +
      'return true;' +
      '}' +
      '}' +
      'registerProcessor("voice-satellite-processor", VoiceSatelliteProcessor);';

    var blob = new Blob([workletCode], { type: 'application/javascript' });
    var workletUrl = URL.createObjectURL(blob);
    await this._audioContext.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    this._workletNode = new AudioWorkletNode(this._audioContext, 'voice-satellite-processor');
    var self = this;
    this._workletNode.port.onmessage = function (e) {
      self._audioBuffer.push(new Float32Array(e.data));
    };
    sourceNode.connect(this._workletNode);
    this._workletNode.connect(this._audioContext.destination);
  }

  _setupScriptProcessor(sourceNode) {
    this._scriptProcessor = this._audioContext.createScriptProcessor(2048, 1, 1);
    var self = this;
    this._scriptProcessor.onaudioprocess = function (e) {
      var inputData = e.inputBuffer.getChannelData(0);
      self._audioBuffer.push(new Float32Array(inputData));
    };
    sourceNode.connect(this._scriptProcessor);
    this._scriptProcessor.connect(this._audioContext.destination);
  }

  _sendAudioBuffer(binaryHandlerId) {
    if (binaryHandlerId === null || binaryHandlerId === undefined) return;
    if (this._audioBuffer.length === 0) return;

    var totalLength = 0;
    for (var i = 0; i < this._audioBuffer.length; i++) {
      totalLength += this._audioBuffer[i].length;
    }
    var combined = new Float32Array(totalLength);
    var offset = 0;
    for (var i = 0; i < this._audioBuffer.length; i++) {
      combined.set(this._audioBuffer[i], offset);
      offset += this._audioBuffer[i].length;
    }
    this._audioBuffer = [];

    if (this._actualSampleRate !== 16000) {
      combined = this._resample(combined, this._actualSampleRate, 16000);
    }

    var pcmData = this._floatTo16BitPCM(combined);
    this._sendBinaryAudio(pcmData, binaryHandlerId);
  }

  _resample(inputSamples, fromSampleRate, toSampleRate) {
    if (fromSampleRate === toSampleRate) return inputSamples;
    var ratio = fromSampleRate / toSampleRate;
    var outputLength = Math.round(inputSamples.length / ratio);
    var output = new Float32Array(outputLength);
    for (var i = 0; i < outputLength; i++) {
      var srcIndex = i * ratio;
      var low = Math.floor(srcIndex);
      var high = Math.min(low + 1, inputSamples.length - 1);
      var frac = srcIndex - low;
      output[i] = inputSamples[low] * (1 - frac) + inputSamples[high] * frac;
    }
    return output;
  }

  _floatTo16BitPCM(float32Array) {
    var pcmData = new Int16Array(float32Array.length);
    for (var i = 0; i < float32Array.length; i++) {
      var s = Math.max(-1, Math.min(1, float32Array[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcmData;
  }

  _sendBinaryAudio(pcmData, binaryHandlerId) {
    var connection = this._card.connection;
    if (!connection || !connection.socket) return;
    if (connection.socket.readyState !== WebSocket.OPEN) return;

    var message = new Uint8Array(1 + pcmData.byteLength);
    message[0] = binaryHandlerId;
    message.set(new Uint8Array(pcmData.buffer), 1);
    connection.socket.send(message.buffer);
  }
}
