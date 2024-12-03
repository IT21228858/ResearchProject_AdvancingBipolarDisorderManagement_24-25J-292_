chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'start-recording':
        startRecording(message.data);
        break;
      case 'stop-recording':
        stopRecording();
        break;
      case 'user-gesture':{
        alert("To ensure optimal performance, we first need to access this tab. Please click the extension icon to grant permission.");
        }
      default:
        console.log('Unrecognized message:', message.type);
    }
  }
});

let recorder;
let data = [];

async function startRecording(streamId) {
  if (recorder?.state === 'recording') {
    throw new Error('Called startRecording while recording is in progress.');
  }

  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    }
    // Removed video constraints to only capture audio
  });
  
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);
  // Start recording.
  recorder = new MediaRecorder(media, { mimeType: 'audio/webm' }); // Use 'audio/webm' mime type
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.onstop = async() => {
    const blob = new Blob(data, { type: 'audio/webm' });
    await appendToAPISearch(blob);

    // Clear state ready for next recording
    recorder = undefined;
    data = [];
  };
  recorder.start();

  // Record the current state in the URL
  window.location.hash = 'recording';
}

async function stopRecording() {
  if (recorder && recorder.state === "recording") {
    recorder.stop();

    // Stop the tracks to remove the recording icon in the tab
    recorder.stream.getTracks().forEach((t) => t.stop());

    // Update the current state in the URL
    window.location.hash = '';
  } else {
    console.log("Recorder is not initialized or already stopped.");
  }
}

async function appendToAPISearch(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  try {
    const response = await fetch('http://127.0.0.1:5000/api/audio', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('Audio successfully sent to server:', await response.json());
  } catch (error) {
    console.log('Error sending audio to server:', error);
  }
}