const pin = "partyonrock";
const pinContainer = document.getElementById("pin-container");
const passInput = document.getElementById("pass-input");
const pinSubmit = document.getElementById("pin-submit");
const pinError = document.getElementById("pinError");
const panelContainer = document.querySelector("#panel");



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

const totalEl = document.getElementById("total");
const enteredEl = document.getElementById("entered");
const notEnteredEl = document.getElementById("notEntered");
const tableBody = document.querySelector("#studentTable tbody");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadExcel");

function loadDataFromFirebase() {
  db.ref("entries").on("value", (snapshot) => {
    const data = snapshot.val();

    // no data found them return
    if (!data) {
      const tr = document.createElement("tr");
      tr.style = ` 
                    position:relative;
                    color: red;
                    `;
      tr.innerText = `No any data in Database`;
      tableBody.appendChild(tr);
      return;
    }

    let total = 0,
      entered = 0,
      notEntered = 0;

    tableBody.innerHTML = "";

    for (let code in data) {
      total++;
      const student = data[code]; // student all data comes heree
      console.log("data comes from the db : ", data[code]);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.roll}</td>
        <td>${student.name}</td>
        <td style= "color: ${student.status === "scanned" ? "green" : "red"}">${
        student.status
      }</td>  
        `;
      tableBody.appendChild(row);

      if (student.status === "scanned") {
        entered++;
      } else {
        notEntered++;
      }
    }
    totalEl.textContent = total;
    enteredEl.textContent = entered;
    notEnteredEl.textContent = notEntered;
  });
}
loadDataFromFirebase();

function asking()
{
    if(confirm("Are you sure you want to reset all entries to 'not scanned' ?")){
        if(confirm("Again confirm  ,  Are you sure you want to reset it ?")){
            return true;
        }
    }
}
// reset to not scanned logic 
resetBtn.addEventListener("click", () => {

    // asking before resset the entries
    if(!asking())
    {
        return ;
    }
  db.ref("entries")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) return alert("No data found!");

      const updates = {};
      Object.keys(data).forEach((code) => {
        updates[`entries/${code}/status`] = "not scanned";
      });
    //   console.log(updates);
    db.ref().update(updates)
      .then( () => {
        alert("All entries have been reset to 'not scanned'. ");
        return;
      })
      .catch(err => alert("Error resseting the entries ." + err.message));

    });

});

// download excel sheet
downloadBtn.addEventListener("click", () => {
  db.ref("entries").once("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return alert("No data found!");

    const headingInTable  = "Fresher Party Entries Detail";
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const rows = [
        [headingInTable],
        [`Date: ${currentDate}` , `Time: ${currentTime}`],
        [],
        ["Roll", "Name", "Status"]
    ];

    // fil table rows 
    for (let key in data) {
      const s = data[key];
      rows.push([s.roll, s.name, s.status]);
    }
    // create excel sheets 
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entries");
    // saving the filess
    XLSX.writeFile(wb, "FresherParty_Entries.xlsx");
  });
});
