// firebase conecetivity
const firebaseConfig = {
  apiKey: "AIzaSyDkTqUIYz6o2WMiEr_e0qQUS5UgizO0UMg",
  authDomain: "fresherpartyentry.firebaseapp.com",
  databaseURL: "https://fresherpartyentry-default-rtdb.firebaseio.com",
  projectId: "fresherpartyentry",
  storageBucket: "fresherpartyentry.firebasestorage.app",
  messagingSenderId: "230589525215",
  appId: "1:230589525215:web:a03be1397c59b0ebe1cd6a",
};

// intialise the connection form database therefore we can only use the features of data base...
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app); // use for read the data and write the data itself and also allowed the js to peform the action ...


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

// for cracking effect 
  function celebrateQR() {
  // Fire a beautiful confetti burst
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Optional sound effect
  const audio = new Audio("/Audio/celebration.wav");
  audio.play();
}

function verifyStudent(event) {
  event.preventDefault(); // stop to refresh the form

  const roll = document
    .getElementById("studentRoll")
    .value.trim()
    .toUpperCase();
  const name = document.getElementById("studentName").value.trim();
  const result = document.getElementById("result");
  const qrDiv = document.getElementById("qrcode");
  const loader = document.getElementById("loader");
  const loaderText = document.getElementById("loaderText");
  const downloadBtn = document.getElementById("downloadQR");

  qrDiv.innerHTML = ""; // clear previous QR
  loader.style.display = "block"; // loader showing
  loaderText.style.display = "block"; // loader showing
  result.style.display = "block";

  console.log(qrDiv + "kaam kar raha hai");

  if (roll === "" || name === "") {
    loader.style.display = "none"; // hide loader
    loaderText.style.display = "none"; // hide loadertext
    result.innerHTML = "Please enter both Enrollment and Name.";
    return;
  }

  // fetch the roll form the students database
  const ref = db.ref("students/" + roll);
  ref
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        // rolll hai to enter in if
        const data = snapshot.val(); // data mil gaye and stor it ondata variable
        console.log(data);

        if (data.name.toLowerCase() === name.toLowerCase()) {
          // name matching
          // result.innerHTML = "Verified " + data.name;

          // checks for already student have the qr code or not
          const entriesFolder = db.ref("entries/");
          entriesFolder
            .orderByChild("roll")
            .equalTo(roll)
            .once("value", (snapshot) => {
              loader.style.display = "none"; // stop loader
              loaderText.style.display = "none"; // hide loadertext

              if (snapshot.exists()) {
                // agar already qr generated hai to give the msg
                const alreadyExist = Object.values(snapshot.val())[0];
                
                const audio = new Audio('Audio/error.mp3')
                audio.play();
                let j = (result.innerHTML =
                  "QR already generated for : " + alreadyExist.name);
                  
              } else {
                // all data matched then we go for the Qr Genertation
                const uniqueCode = Math.random()
                  .toString(36)
                  .substring(2, 8)
                  .toUpperCase();
                const QRData = `${roll}_${data.name}_${uniqueCode}`;
                // now we store the qr into database
                db.ref("entries/" + uniqueCode)
                  .set({
                    name: data.name,
                    roll: roll,
                    code: uniqueCode,
                    status: "not scanned",
                  })
                  .then(() => {
                    loader.style.display = "none"; // stop loader
                    loaderText.style.display = "none"; // hide loadertext
                    result.style.display = "none";

                    qrDiv.style.display = "block";
                    // display the qrcode
                    new QRCode(qrDiv, {
                      text: QRData,
                      width: 150,
                      height: 150,
                    });

                    celebrateQR();

                    // Show the download button
                    downloadBtn.style.display = "inline-block";
                    qrDiv.scrollIntoView({ behavior: "smooth" });
                  })
                  .catch((error) => {
                    loader.style.display = "none"; // stop loader
                    loaderText.style.display = "none"; // hide loadertext
                    console.error("Error saving the QR :" + error);
                    const audio = new Audio('Audio/error.mp3')
                    audio.play();
                    result.innerHTML = "Error , saving QR to firebase. ";
                  });
              }
            });
        } else {
          loader.style.display = "none"; // hide loader
          loaderText.style.display = "none"; // hide loadertext
          const audio = new Audio('Audio/error.mp3')
                audio.play();
          result.innerHTML = "Name Not matched with our database. ";
        }
      } else {
        loader.style.display = "none"; // hide loader
        loaderText.style.display = "none"; // hide loadertext
        qrDiv.style.display = "none";
        const audio = new Audio('Audio/error.mp3')
                audio.play();
        result.innerHTML = "Enrollment Not matched with our database. ";
      }
    })
    .catch((error) => {
      loader.style.display = "none"; // hide loader
      loaderText.style.display = "none"; // hide loadertext
      console.error(error);
      console.log("student is not listed in our database ... ");
      const audio = new Audio('Audio/error.mp3')
                audio.play();
      result.innerHTML = "Error verifying Student   ";
    });
    name.value="";
    roll.value = "";

    // Download logic
  downloadBtn.addEventListener("click", () => {
  const qrContainer = document.getElementById("qrcode");
  const img = qrContainer.querySelector("img");
  const canvas = qrContainer.querySelector("canvas");
  let imageURL;

  if (img) {
    // QR code is rendered as <img>
    imageURL = img.src;
  } else if (canvas) {
    // QR code rendered as <canvas>
    imageURL = canvas.toDataURL("image/png");
  } else {
    alert("QR code not found!");
    return;
  }

  // Trigger download
  const a = document.createElement("a");
  a.href = imageURL;
  a.download = "fresherparty_qr.png";
  a.click();

  showToast("✅ QR Code Downloaded!");
});

    
}




