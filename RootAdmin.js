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

// 🔍 Check Student Status
function checkStudentStatus() {
  const roll = document.getElementById("checkRoll").value.trim().toUpperCase();
  const resultDiv = document.getElementById("checkResult");

  if (roll === "") {
    alert("Please enter a Roll Number!");
    return;
  }

  resultDiv.innerHTML = "Checking...";

  // Step 1: Check if student exists in master list
  db.ref("students/" + roll)
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Step 2: Check if QR entry already exists
        db.ref("entries")
          .orderByChild("roll")
          .equalTo(roll)
          .once("value", (entrySnap) => {
            if (entrySnap.exists()) {
              const entry = Object.values(entrySnap.val())[0];
              resultDiv.innerHTML = `
                <div style="background:#f0f0f0;padding:10px;border-radius:10px;margin-top:10px; color:black;">
                  <h3 style="color: black;">🎓 ${data.name}</h3>
                  <p><b>Roll:</b> ${data.roll}</p>
                  <p style="color:green;">✅ QR Generated</p>
                  <button onclick="deleteStudentEntry('${entry.code}')"
                          style="background:red;color:white;border:none;padding:6px 10px;border-radius:5px;cursor:pointer;">
                    Delete QR Entry
                  </button>
                </div>`;
            } else {
              resultDiv.innerHTML = `
                <div style="background:#f0f0f0;padding:10px;border-radius:10px;margin-top:10px;">
                  <h3>🎓 ${data.name}</h3>
                  <p><b>Roll:</b> ${data.roll}</p>
                  <p style="color:orange;">⚠️ QR Not Generated</p>
                </div>`;
            }
          });
      } else {
        resultDiv.innerHTML = `<p style="color:red;">❌ Student not found in database.</p>`;
      }
    })
    .catch((error) => {
      console.error(error);
      resultDiv.innerHTML = `<p style="color:red;">Error checking student: ${error}</p>`;
    });
}

// 🗑️ Delete QR Entry
function deleteStudentEntry(uniqueCode) {
  if (!confirm("Are you sure you want to delete this QR entry?")) return;

  db.ref("entries/" + uniqueCode)
    .remove()
    .then(() => {
      alert("QR entry deleted successfully!");
      document.getElementById("checkResult").innerHTML = "";
    })
    .catch((error) => {
      console.error(error);
      alert("Error deleting entry: " + error);
    });
}
