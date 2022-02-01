// SpeechRecognition is not supported on certain browsers, ask the user to switch to supported browser
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  //webkit for safari and other browsers using webkit on macOS/iOS
let recognition;

// constants
const UNSUPPORTED_BROWSER_MESSAGE = "Sorry, your browser does not support speech recognition. Please switch to a supported browser.";

const unsupported_err = new Error(UNSUPPORTED_BROWSER_MESSAGE);
// get UI elements
const preview_video = document.getElementById('preview_video'); //get video element
const download_btn = document.getElementById('download_btn');
const record_btn = document.getElementById('record_btn');
const recording_video = document.getElementById('recording_video');
const downloadLink = document.getElementById('downloadLink');

// other variables deceleration
let last_finished;
let recorder;
let startTime= new window.Date();
let result_log ='WEBVTT \n';
let count = 1;
let filename;

if (!speechRecognition) {
    //create an alert to show that the user should be using other browser
    alert(UNSUPPORTED_BROWSER_MESSAGE);
    throw unsupported_err;
}
else{
    recognition = new speechRecognition();
}

if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
    alert(`${unsupported_err.message}`);
    throw unsupported_err;
}
recording_video.onloadedmetadata = function() {
  download_btn.disabled = false;
};

function voiceRecognition() {
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  var startTimeDifference;
  recognition.onsoundstart = function() {
    startTimeDifference = getTimeStampDifference();
    document.getElementById('status').innerHTML = "Processing...";
    document.getElementById('status').className = "processing";
  };
  recognition.onnomatch = function() {
    document.getElementById('status').innerHTML = "The voice could not be recognized";
    document.getElementById('status').className = "error";
  };
  recognition.onerror = function() {
    document.getElementById('status').innerHTML = "Error";
    document.getElementById('status').className = "error";
    if (flag_speech == 0)
      voiceRecognition();
  };
  recognition.onsoundend = function() {
    document.getElementById('status').innerHTML = "Stopped";
    document.getElementById('status').className = "error";
    voiceRecognition();
  };

  recognition.onresult = function(event) {
    var results = event.results;
    var current_transcripts = ''; 
    var need_reset = false;
    for (var i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {
        last_finished = results[i][0].transcript;
        result_log += '\n'+count+'\n'+startTimeDifference +' --> '+ getTimeStampDifference() +' \n' + last_finished + '\n';
        document.getElementById('result_log').innerHTML = "";
        document.getElementById('result_log').insertAdjacentHTML('beforeend', result_log + '\n');
        count++;
        need_reset = true;
        flag_speech = 0;
      } else {
        current_transcripts += results[i][0].transcript;
        flag_speech = 1;
      }
    }

    document.getElementById('result_text').innerHTML = [last_finished, current_transcripts].join('<br>');

    if (need_reset) { voiceRecognition(); }
  }

  flag_speech = 0;
  document.getElementById('status').innerHTML = "ready";
  document.getElementById('status').className = "ready";
  recognition.start();
}

function initCamera() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        preview_video.srcObject = stream;
    })
    .catch(function (err) {
        console.log(err);
    });
  }
}

window.onload = () => {
    initCamera();
}
function stop_Click() {
  let stream = preview_video.srcObject;
  let tracks = stream.getTracks();

  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    track.stop();
  }
  preview_video.srcObject = null;
}

function startRecord_Click() {

  voiceRecognition();
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    preview_video.srcObject = stream;
    preview_video.captureStream = preview_video.captureStream || preview_video.mozCaptureStream;
    return new Promise(resolve => preview_video.onplaying = resolve);
  }).then(() => startRecording(preview_video.captureStream()))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
    recording_video.src = URL.createObjectURL(recordedBlob);
    download_btn.href = recording_video.src;
    filename = getTimeStamp();
    download_btn.download = getTimeStamp()+'.mp4';
  })
  .catch();
}

function startRecording(stream) {
  if (recorder) {
      stop_Click();
      record_btn.innerHTML = "START RECORD";
      recorder.state == "recording" && recorder.stop();
      return;
  }
  download_btn.disabled = true;

  startTime = new window.Date();
  record_btn.innerHTML = "STOP RECORD";
  
  recorder=  new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  return Promise.all([
    stopped
  ])
  .then(() => data);
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function getTimeStampDifference() {
  var now = new window.Date();

  // get total seconds between the times
  var diff = Math.abs(now - startTime) / 1000;

  // calculate (and subtract) whole days
  var days = Math.floor(diff / 86400);
  diff -= days * 86400;

  // calculate (and subtract) whole hours
  var hours = Math.floor(diff / 3600) % 24;
  diff -= hours * 3600;

  // calculate (and subtract) whole minutes
  var minutes = Math.floor(diff / 60) % 60;
  diff -= minutes * 60;

  // what's left is seconds
  var seconds = Math.floor(diff % 60);  

  var timestamp =  (minutes.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  })) + ':' + (seconds.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  }))+'.000';
  return timestamp;
}

function getTimeStamp() {
  var now = new window.Date();
  var Year = now.getFullYear();
  var Month = (("0" + (now.getMonth() + 1)).slice(-2));
  var Date = ("0" + now.getDate()).slice(-2);
  var Hour = ("0" + now.getHours()).slice(-2);
  var Min = ("0" + now.getMinutes()).slice(-2);
  var Sec = ("0" + now.getSeconds()).slice(-2);

  var timestamp = Year + '-' + Month + '-' + Date + ' ' + Hour + ':' + Min + ':' + Sec;
  return timestamp;
}

function download_Click() {
   // It works on all HTML5 Ready browsers as it uses the download attribute of the <a> element:
   const element = document.createElement('a');
   element.style.display = 'none';

   //A blob is a data type that can store binary data
   // "type" is a MIME type
   // It can have a different value, based on a file you want to save
   const blob = new Blob([result_log], { type: 'text/vtt' });

   //createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
   const fileUrl = URL.createObjectURL(blob);
   const videoUrl = recording_video.src;
   //setAttribute() Sets the value of an attribute on the specified element.
   element.setAttribute('href', fileUrl); //file location
   element.setAttribute('download', filename+'.vtt'); // file name
 
   //use appendChild() method to move an element from one element to another
   document.body.appendChild(element);
   element.click();
   
   element.setAttribute('href', videoUrl); 
   element.setAttribute('download', filename+'.mp4'); // file name
 
   //use appendChild() method to move an element from one element to another
   element.click();

   //The removeChild() method of the Node interface removes a child node from the DOM and returns the removed node
   document.body.removeChild(element);
}