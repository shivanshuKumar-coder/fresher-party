// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyDkTqUIYz6o2WMiEr_e0qQUS5UgizO0UMg",
  authDomain: "fresherpartyentry.firebaseapp.com",
  databaseURL: "https://fresherpartyentry-default-rtdb.firebaseio.com",
  projectId: "fresherpartyentry",
  storageBucket: "fresherpartyentry.firebasestorage.app",
  messagingSenderId: "230589525215",
  appId: "1:230589525215:web:a03be1397c59b0ebe1cd6a",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const resultDiv = document.getElementById("result");
const scanNextBtn = document.getElementById("scanNextBtn");
const html5QrCode = new Html5Qrcode("reader");
console.log("hii i am working");

// audio play features if the scanned as successfully or error 
function playScannerBeep() {
  const audio = new Audio('Audio/scanner-beep.mp3'); // ✅ You can use any short mp3 file
  audio.play().catch(err => console.error('Sound play error:', err));
}

function playSound(type) {
  let sound;
  if (type === "success") {
    sound = new Audio("/Audio/SucessDing.mp3");
  } else if (type === "error") {
    sound = new Audio("/Audio/Error.mp3");
  }

  if (sound) {
    sound.play().catch(err => console.warn("Audio play blocked:", err));    
  } 
}

const s = document.getElementById("speakBtn");
s.addEventListener("click" , () => {
  s.style.display = "none";
})


// ✅ Unlock audio + speech after user click
document.body.addEventListener("click", function unlockAudio() {
  // Unlock audio contexts (for mobile)
  new Audio().play().catch(() => {});
  const unlockSpeech = new SpeechSynthesisUtterance("");
  window.speechSynthesis.speak(unlockSpeech);
  document.body.removeEventListener("click", unlockAudio);
  console.log("🔓 Audio + speech unlocked for mobile.");
});

// speak name of the students
function speakName(name) {
  if (!("speechSynthesis" in window)) return;

  const speech = new SpeechSynthesisUtterance();
  
  // Try to pronounce better with "Entry verified for" context
  speech.text = `${name}.`;
  
  // Set rate and pitch for clarity
  speech.rate = 0.9;
  speech.pitch = 0.9;
  speech.volume = 1;
  
  // Detect and assign a good voice dynamically
  const voices = window.speechSynthesis.getVoices();
  
  // Try for Indian or Hindi accent
  const indianVoice =  
    voices.find(v => v.name.includes("India")) ||
    voices.find(v => v.lang === "uk-IN") ||
    voices.find(v => v.name.includes("Google हिन्दी")) ||
    voices.find(v => v.name.includes("Heera")) ||
    voices.find(v => v.name.includes("Ravi"));

  if (indianVoice) {
    speech.voice = indianVoice;
    speech.lang = indianVoice.lang;
  } else {
    // Fallback to English India or normal English
    speech.lang = "en-IN";
  }

  // Wait until voices are loaded before speaking
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => speakName(name);
  } else {
    window.speechSynthesis.speak(speech);
  }
}

function startScanner() {
  resultDiv.innerHTML = "Scanning... Please hold QR steady.";
  resultDiv.style.background = "rgba(255, 255, 255, 0.1)";
  scanNextBtn.style.display = "none";

  // const qrBoxSize = Math.min(window.innerWidth * 0.8, 350);
  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 270, height: 270 } },
      (decodedText) => {
        html5QrCode.stop();
        playScannerBeep(); // this will play the scanner beep 
        verifyQRCode(decodedText);
      },
      (errorMessage) => {
        // ignore scanning errors
        console.log("error in scanning the qr code ");
      }
    )
    .catch((err) => {
      resultDiv.textContent = "Camera access denied!";
      playSound("error");
      resultDiv.style.background = "rgba(255,0,0,0.2)";
      scanNextBtn.style.display = "inline-block";
    });
}

function verifyQRCode(qrData) {
  const parts = qrData.split("_");
  if (parts.length < 3) {
    resultDiv.textContent = "Malformed QR Code!";
    resultDiv.style.background = "rgba(255, 0, 0, 0.2)";
    playSound("error");
    scanNextBtn.style.display = "inline-block";
    return;
  }

  const [roll, name, code] = parts;

  const ref = db.ref("entries/" + code);

  ref
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        if (data.status === "scanned") {
          playSound("error");
          speakName(`Already marked as scanned for ${data.name}`);
          resultDiv.innerHTML = `Already marked as scanned for <b>${data.name}</b>`;
          resultDiv.style.background = "rgba(255, 193, 7, 0.2)";
        } else {
          ref.update({ status: "scanned" });
          playSound("success");
          speakName(`Access granted to ${data.name}`);
          resultDiv.innerHTML = `Entry verified for <b>${data.name}</b> (${data.roll})`;
          resultDiv.style.background = "rgba(0, 255, 128, 0.2)";
          resultDiv.classList.add("fade-in");
        }
      } else {
        resultDiv.innerHTML = "Invalid QR Code!";
        playSound("error");
        resultDiv.style.background = "rgba(255, 0, 0, 0.2)";
      }
      scanNextBtn.style.display = "inline-block";
    })
    .catch((err) => {
      console.error(err);
      resultDiv.textContent = "Error verifying QR Code!";
      resultDiv.style.background = "rgba(255,0,0,0.2)";
      playSound("error");
      scanNextBtn.style.display = "inline-block";
    });
}

scanNextBtn.addEventListener("click", () => {
  resultDiv.style.background = "rgba(255, 255, 255, 0.1)";
  playScannerBeep();
  startScanner();
});


const pin = "8102767360";
const pinContainer = document.getElementById("pin-container");
const passInput = document.getElementById("pass-input");
const pinSubmit = document.getElementById("pin-submit");
const pinError = document.getElementById("pinError");
const qrContainer = document.querySelector(".wrap-reader");
console.log("console kaam kar raha ");

pinSubmit.addEventListener("click", () => {
  const enteredPin = passInput.value.trim();
  if (enteredPin === pin) {
    pinContainer.style.display = "none"; // hide the pin container
    qrContainer.style.display = "flex"; //shhow scanner
    startScanner(); // scannner start after the pin is coreect
  } else {
    pinError.textContent = "Incorrect PIN! Try Again.";
    passInput.value = "";
    passInput.focus();
  }
});
