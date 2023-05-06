// Create a variable to keep track of the currently playing sound
let currentSourceNode = null;

// Create a variable to keep track of the sound queue
let soundQueue = [];

let audioCtx = null;

// Function to load a sound file and add it to the sound queue
function playSound(sound_name) {
  debug(`Playing sound ${sound_name}`)
  if(audioCtx == null) {
    debug('Creating new audio context')
    audioCtx = new AudioContext()
  }

  // Load the sound file into an AudioBuffer object
  const request = new XMLHttpRequest();
  // if soundname contains a . in then name then its not a .wav
  let soundLocation = sound_name;
  if (sound_name.indexOf('.') === -1) {
    soundLocation = `lib/${sound_name}.wav`
  } else {
    soundLocation = `lib/${sound_name}`
  }
  

  request.open('GET', chrome.runtime.getURL(soundLocation), true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
      // Add the sound buffer to the sound queue
      soundQueue.push(buffer);
      // If there's no currently playing sound, start playing the first sound in the queue
      if (!currentSourceNode) {
        debug('Playing next sound')
        playNextSound();
      }
    });
  };
  request.send();
}

// Function to play the next sound in the sound queue
function playNextSound() {
  debug('Playing next sound')
  // If there's no sound in the queue, stop playback and return
  if (soundQueue.length === 0) {
    debug('No sounds in queue')
    currentSourceNode = null;
    return;
  }
  // Get the first sound buffer in the queue and remove it from the queue
  const buffer = soundQueue.shift();
  // Create an AudioBufferSourceNode and connect it to the AudioContext's destination node
  const sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(audioCtx.destination);
  // Start playback of the sound buffer
  sourceNode.start(0);
  // Update the currently playing sound variable
  currentSourceNode = sourceNode;
  // When the sound finishes playing, play the next sound in the queue
  sourceNode.onended = function() {
    debug('playing next sound')
    currentSourceNode = null;
    playNextSound();
  };
}

let currentRepeatSongLocation = '';
let currentSourceSongNode = null;
let audioCtx2 = null;
// play sound in loop at 10% volume
const playSoundOnRepeat = (sound_name, volume) => {
  debug(`Playing sound ${sound_name} on repeat`)
  if (audioCtx2 == null) {
    debug('Creating new audio context')
    audioCtx2 = new AudioContext()
  }
  // play currentRepeatSongLocation at 10% volume, after that repeat currentReapeatSongLocation at 10% volume
  // when someone changes the song or volume by running playSoundOnRepeat again, it will change the repeat song
  // if the current song is the same as the one we want to play, then just change the volume
  currentRepeatSongLocation = sound_name;
  // Load the sound file into an AudioBuffer object
  const request = new XMLHttpRequest();
  // if soundname contains a . in then name then its not a .wav
  let soundLocation = sound_name;
  if (sound_name.indexOf('.') === -1) {
    soundLocation = `lib/${sound_name}.wav`
  } else {
    soundLocation = `lib/${sound_name}`
  }

  request.open('GET', chrome.runtime.getURL(soundLocation), true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx2.decodeAudioData(request.response, function(buffer) {
      // Create an AudioBufferSourceNode and connect it to the AudioContext's destination node
      const sourceNode = audioCtx2.createBufferSource();
      sourceNode.buffer = buffer;
      const gainNode = audioCtx2.createGain();
      gainNode.gain.value = volume;
      sourceNode.connect(gainNode);
      gainNode.connect(audioCtx2.destination);
      // Start playback of the sound buffer
      sourceNode.start(0);
      // Update the currently playing sound variable
      currentSourceSongNode = gainNode;
      // When the sound finishes playing, play the next sound in the queue
      sourceNode.onended = function() {
        currentSourceSongNode = null;
        debug('playing next sound')
        return playSoundOnRepeat(currentRepeatSongLocation, volume);
      };
    });
  }

  request.send();
};

let currentRepeatSongLocation2 = '';
const currentSongs = [
  'song1.mp3',
  'song2.mp3',
  'song3.mp3',
  'song4.mp3',
  'song5.mp3',
  'song6.mp3',
  'song7.mp3'
];
let currentSongIndex = 0;
let currentSourceSongNode2 = null;
let audioCtx3 = null;
// play sound in loop at 10% volume
const playSongOnRepeat = (sound_name, volume) => {
  debug(`Playing sound ${sound_name} on repeat`)
  if (audioCtx3 == null) {
    debug('Creating new audio context')
    audioCtx3 = new AudioContext()
  }
  // play currentRepeatSongLocation at 10% volume, after that repeat currentReapeatSongLocation at 10% volume
  // when someone changes the song or volume by running playSoundOnRepeat again, it will change the repeat song
  // if the current song is the same as the one we want to play, then just change the volume
  currentRepeatSongLocation2 = sound_name;
  // Load the sound file into an AudioBuffer object
  const request = new XMLHttpRequest();
  // if soundname contains a . in then name then its not a .wav
  let soundLocation = sound_name;
  if (sound_name.indexOf('.') === -1) {
    soundLocation = `lib/${sound_name}.wav`
  } else {
    soundLocation = `lib/${sound_name}`
  }

  request.open('GET', chrome.runtime.getURL(soundLocation), true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx3.decodeAudioData(request.response, function(buffer) {
      // Create an AudioBufferSourceNode and connect it to the AudioContext's destination node
      const sourceNode = audioCtx3.createBufferSource();
      sourceNode.buffer = buffer;
      const gainNode = audioCtx3.createGain();
      gainNode.gain.value = volume;
      sourceNode.connect(gainNode);
      gainNode.connect(audioCtx3.destination);
      // Start playback of the sound buffer
      sourceNode.start(0);
      // Update the currently playing sound variable
      currentSourceSongNode2 = gainNode;

      sourceNode.onended = function() {
        currentSourceSongNode2 = null;

        currentSongIndex += 1;

        if (currentSongIndex === currentSongs.length) {
          currentSongIndex = 0;
        }
        debug('playing next sound')
        return playSongOnRepeat(currentSongs[currentSongIndex], volume);
      };
    });
  }

  request.send();
};