// firebase connectivity
const firebaseConfig = {
  apiKey: "AIzaSyDkTqUIYz6o2WMiEr_e0qQUS5UgizO0UMg",
  authDomain: "fresherpartyentry.firebaseapp.com",
  databaseURL: "https://fresherpartyentry-default-rtdb.firebaseio.com",
  projectId: "fresherpartyentry",
  storageBucket: "fresherpartyentry.firebasestorage.app",
  messagingSenderId: "230589525215",
  appId: "1:230589525215:web:a03be1397c59b0ebe1cd6a",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// ✅ Toast Message
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.bottom = "80px";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%)";
  t.style.background = "rgba(0,0,0,0.8)";
  t.style.color = "#fff";
  t.style.padding = "10px 18px";
  t.style.borderRadius = "8px";
  t.style.zIndex = "10000";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ✅ Confetti celebration
function celebrateQR() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  const audio = new Audio("/Audio/celebration.wav");
  audio.play();
}

// ✅ Verify student and generate QR
function verifyStudent(event) {
  event.preventDefault();

  const rollInput = document.getElementById("studentRoll");
  const nameInput = document.getElementById("studentName");
  const roll = rollInput.value.trim().toUpperCase();
  const name = nameInput.value.trim();

  const result = document.getElementById("result");
  const qrDiv = document.getElementById("qrcode");
  const loader = document.getElementById("loader");
  const loaderText = document.getElementById("loaderText");
  const downloadBtn = document.getElementById("downloadQR");

  qrDiv.innerHTML = "";
  loader.style.display = "block";
  loaderText.style.display = "block";
  result.style.display = "block";

  if (roll === "" || name === "") {
    loader.style.display = "none";
    loaderText.style.display = "none";
    result.innerHTML = "Please enter both Enrollment and Name.";
    return;
  }

  const ref = db.ref("students/" + roll);
  ref
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        if (data.name.toLowerCase() === name.toLowerCase()) {
          const entriesFolder = db.ref("entries/");
          entriesFolder
            .orderByChild("roll")
            .equalTo(roll)
            .once("value", (snapshot) => {
              loader.style.display = "none";
              loaderText.style.display = "none";

              if (snapshot.exists()) {
                const alreadyExist = Object.values(snapshot.val())[0];
                const audio = new Audio("Audio/error.mp3");
                audio.play();
                result.innerHTML =
                  "QR already generated for: " + alreadyExist.name;
              } else {
                const uniqueCode = Math.random()
                  .toString(36)
                  .substring(2, 8)
                  .toUpperCase();
                const QRData = `${roll}_${data.name}_${uniqueCode}`;

                db.ref("entries/" + uniqueCode)
                  .set({
                    name: data.name,
                    roll: roll,
                    code: uniqueCode,
                    status: "not scanned",
                  })
                  .then(() => {
                    loader.style.display = "none";
                    loaderText.style.display = "none";
                    result.style.display = "none";

                    qrDiv.style.display = "block";
                    new QRCode(qrDiv, {
                      text: QRData,
                      width: 150,
                      height: 150,
                    });

                    celebrateQR();
                    downloadBtn.style.display = "inline-block";
                    qrDiv.scrollIntoView({ behavior: "smooth" });
                  })
                  .catch((error) => {
                    loader.style.display = "none";
                    loaderText.style.display = "none";
                    const audio = new Audio("Audio/error.mp3");
                    audio.play();
                    result.innerHTML =
                      "Error saving the QR to Firebase: " + error;
                  });
              }
            });
        } else {
          loader.style.display = "none";
          loaderText.style.display = "none";
          const audio = new Audio("Audio/error.mp3");
          audio.play();
          result.innerHTML = "Name not matched with our database.";
        }
      } else {
        loader.style.display = "none";
        loaderText.style.display = "none";
        const audio = new Audio("Audio/error.mp3");
        audio.play();
        result.innerHTML = "Enrollment not matched with our database.";
      }
    })
    .catch((error) => {
      loader.style.display = "none";
      loaderText.style.display = "none";
      const audio = new Audio("Audio/error.mp3");
      audio.play();
      result.innerHTML = "Error verifying student.";
      console.error(error);
    });

  // reset inputs
  // nameInput.value = "";
  // rollInput.value = "";

  // ✅ FIXED Download Logic (mobile-compatible)
  downloadBtn.addEventListener("click", () => {
    const qrContainer = document.getElementById("qrcode");
    const canvas = qrContainer.querySelector("canvas");
    const img = qrContainer.querySelector("img");

    if (canvas) {
      // Works on mobile + desktop
      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "fresherparty_qr.png";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("✅ QR Code Downloaded!");
        const msg = new SpeechSynthesisUtterance("QR Code downloaded successfully!");
        window.speechSynthesis.speak(msg);
      });
    } else if (img) {
      const link = document.createElement("a");
      link.href = img.src;
      link.download = "fresherparty_qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("✅ QR Code Downloaded!");
      const msg = new SpeechSynthesisUtterance("QR Code downloaded successfully!");
      window.speechSynthesis.speak(msg);
    } else {
      alert("QR Code not found!");
    }
  });
}
