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
        verifyQRCode(decodedText);
      },
      (errorMessage) => {
        // ignore scanning errors
        console.log("error in scanning the qr code ");
      }
    )
    .catch((err) => {
      resultDiv.textContent = "Camera access denied!";
      resultDiv.style.background = "rgba(255,0,0,0.2)";
      scanNextBtn.style.display = "inline-block";
    });
}

function verifyQRCode(qrData) {
  const parts = qrData.split("_");
  if (parts.length < 3) {
    resultDiv.textContent = "Malformed QR Code!";
    resultDiv.style.background = "rgba(255, 0, 0, 0.2)";
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
          resultDiv.innerHTML = `Already marked as scanned for <b>${data.name}</b>`;
          resultDiv.style.background = "rgba(255, 193, 7, 0.2)";
        } else {
          ref.update({ status: "scanned" });
          resultDiv.innerHTML = `Entry verified for <b>${data.name}</b> (${data.roll})`;
          resultDiv.style.background = "rgba(0, 255, 128, 0.2)";
          resultDiv.classList.add("fade-in");
        }
      } else {
        resultDiv.innerHTML = "Invalid QR Code!";
        resultDiv.style.background = "rgba(255, 0, 0, 0.2)";
      }
      scanNextBtn.style.display = "inline-block";
    })
    .catch((err) => {
      console.error(err);
      resultDiv.textContent = "Error verifying QR Code!";
      resultDiv.style.background = "rgba(255,0,0,0.2)";
      scanNextBtn.style.display = "inline-block";
    });
}

scanNextBtn.addEventListener("click", () => {
  resultDiv.style.background = "rgba(255, 255, 255, 0.1)";
  startScanner();
});

// Start scanner
// startScanner();

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
