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
  const name = nameInput.value.trim().replace(/\s+/g, " ").toUpperCase();

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
    result.innerHTML = "⚠️ Please enter both Enrollment and Name.";
    return;
  }

  const studentRef = db.ref("students/" + roll);
  studentRef
    .get()
    .then((snapshot) => {
      loader.style.display = "none";
      loaderText.style.display = "none";

      if (!snapshot.exists()) {
        playError();
        result.innerHTML = "❌ Enrollment not matched with our database.";
        return;
      }

      const data = snapshot.val();
      const dbName = data.name.trim().replace(/\s+/g, " ").toUpperCase();

      if (dbName !== name) {
        playError();
        result.innerHTML = "❌ Name not matched with our database.";
        return;
      }

      const entriesFolder = db.ref("entries/");
      entriesFolder
        .orderByChild("roll")
        .equalTo(roll)
        .once("value", (snap) => {
          if (snap.exists()) {
            playError();
            const alreadyExist = Object.values(snap.val())[0];
            result.innerHTML = "⚠️ QR already generated for: " + alreadyExist.name;
            return;
          }

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
              result.style.display = "none";
              qrDiv.style.display = "block";
              qrDiv.innerHTML = "";

              new QRCode(qrDiv, {
                text: QRData,
                width: 200, // higher quality
                height: 200,
              });

              celebrateQR();
              downloadBtn.style.display = "inline-block";
              qrDiv.scrollIntoView({ behavior: "smooth" });

              // ✅ JPG download setup
              setupQRDownload(downloadBtn, name);
            })
            .catch((error) => {
              playError();
              result.innerHTML = "Error saving the QR to Firebase: " + error;
            });
        });
    })
    .catch((error) => {
      loader.style.display = "none";
      loaderText.style.display = "none";
      playError();
      result.innerHTML = "⚠️ Error verifying student.";
      console.error(error);
    });
}

// 🔊 Error sound function for cleaner code
function playError() {
  const audio = new Audio("Audio/error.mp3");
  audio.play();
}


// ✅ Mobile + Desktop Compatible JPG QR Download with Banner & Student Name
function setupQRDownload(downloadBtn, studentName) {
  downloadBtn.onclick = async () => {
    const qrContainer = document.getElementById("qrcode");
    const canvas =
      qrContainer.querySelector("canvas") || qrContainer.querySelector("img");

    if (!canvas) {
      alert("QR code not found!");
      return;
    }

    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");
    const qrSize = 400; // higher resolution for better clarity
    const padding = 50;
    const bannerHeight = 80;
    const nameGap = 80;

    finalCanvas.width = qrSize + padding * 2;
    finalCanvas.height = bannerHeight + qrSize + nameGap + padding;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Banner with gradient
    const gradient = ctx.createLinearGradient(0, 0, finalCanvas.width, 0);
    gradient.addColorStop(0, "#FF5733");
    gradient.addColorStop(1, "#C70039");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, finalCanvas.width, bannerHeight);

    // Banner text
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Fresher Party 2025", finalCanvas.width / 2, bannerHeight / 2);

    // Draw QR
    function drawQR(imgSrc) {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        ctx.drawImage(img, padding, bannerHeight + 10, qrSize, qrSize);
        drawName();
      };
    }

    if (canvas.tagName.toLowerCase() === "canvas") {
      drawQR(canvas.toDataURL("image/png"));
    } else {
      drawQR(canvas.src);
    }

    function drawName() {
      ctx.fillStyle = "#000";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        studentName,
        finalCanvas.width / 2,
        bannerHeight + qrSize + 55
      );

      finalCanvas.toBlob((blob) => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          showToast("📱 Tap and hold image to save your QR code");
        } else {
          const a = document.createElement("a");
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = `${studentName}_QR.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("✅ QR Code Downloaded!");
        }

        const msg = new SpeechSynthesisUtterance(
          "QR code downloaded successfully"
        );
        window.speechSynthesis.speak(msg);
      }, "image/jpeg", 1.0);
    }
  };
}