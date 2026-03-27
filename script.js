// Navigation
const homeScreen = document.getElementById("homeScreen");
const interventionScreen = document.getElementById("interventionScreen");
const historyScreen = document.getElementById("historyScreen");
const tutorialScreen = document.getElementById("tutorialScreen");

function show(screen) {
    homeScreen.classList.remove("active");
    interventionScreen.classList.remove("active");
    historyScreen.classList.remove("active");
    tutorialScreen.classList.remove("active");
    screen.classList.add("active");
}

// HOME BUTTONS
document.getElementById("homeButtonTop").onclick =
document.getElementById("homeButtonBottom").onclick =
document.getElementById("homeButtonTopHistory").onclick =
document.getElementById("homeButtonBottomHistory").onclick =
document.getElementById("homeButtonTutorial").onclick =
document.getElementById("homeButtonBottomTutorial").onclick =
document.getElementById("homeBigButton").onclick = () => {
    resetInterventionForm();
    document.getElementById("historySearch").value = "";
    document.getElementById("historyResults").innerHTML = "";
    document.getElementById("searchActions").style.display = "none";
    show(homeScreen);
};

// OPEN TUTORIAL
document.getElementById("openTutorial").onclick = () => {
    show(tutorialScreen);
};

// SERIAL INPUT RULES (7 to 12 chars)
function enforceSerial(input) {
    input.addEventListener("input", () => {
        let v = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (v.length > 12) v = v.slice(0, 12);
        input.value = v;
    });
}

enforceSerial(document.getElementById("homeSearch"));
enforceSerial(document.getElementById("historySearch"));
enforceSerial(document.getElementById("newSerialInput"));

// SMART DROPDOWN FILTER
document.getElementById("homeSearch").addEventListener("input", () => {
    const query = document.getElementById("homeSearch").value.toUpperCase();
    const options = dropdown.options;

    for (let i = 0; i < options.length; i++) {
        const value = options[i].value.toUpperCase();
        options[i].style.display = value.includes(query) ? "block" : "none";
    }
});

// SEARCH BUTTON LOGIC
document.getElementById("searchSerialButton").onclick = () => {
    const serial = document.getElementById("homeSearch").value.trim();

    if (serial.length < 7 || serial.length > 12) {
        alert("Serial or Machine ID must be between 7 and 12 characters.");
        return;
    }

    document.getElementById("searchActions").style.display = "block";
};

// GO TO HISTORY FROM SEARCH
document.getElementById("goHistory").onclick = () => {
    const serial = document.getElementById("homeSearch").value.trim();
    document.getElementById("historySearch").value = serial;
    show(historyScreen);
};

// DROPDOWN SYNC
const dropdown = document.getElementById("serialDropdown");
dropdown.onchange = () => {
    document.getElementById("homeSearch").value = dropdown.value;
};

// LOCATION STORAGE
const LOCATION_KEY = "orangebook_locations";

// START INTERVENTION
document.getElementById("startIntervention").onclick = () => {
    const serial = document.getElementById("homeSearch").value.trim();
    if (serial.length < 7 || serial.length > 12) {
        alert("Please select a valid Serial or Machine ID.");
        return;
    }

    document.getElementById("interSerial").value = serial;

    // LOAD SAVED LOCATION
    let locations = JSON.parse(localStorage.getItem(LOCATION_KEY) || "{}");
    document.getElementById("interLocation").value = locations[serial] || "";

    resetInterventionForm(false);
    show(interventionScreen);
};

// RESET FORM
function resetInterventionForm(clearSerial = true) {
    if (clearSerial) document.getElementById("interSerial").value = "";
    document.getElementById("interTech").value = "";
    document.getElementById("interDesc").value = "";
    document.getElementById("interParts").value = "";
    document.getElementById("interDate").value = new Date().toISOString().slice(0, 10);
}

// SAVE INTERVENTION
const HISTORY_KEY = "orangebook_history";

document.getElementById("saveIntervention").onclick = () => {
    const entry = {
        location: document.getElementById("interLocation").value,
        serial: document.getElementById("interSerial").value,
        date: document.getElementById("interDate").value,
        tech: document.getElementById("interTech").value,
        desc: document.getElementById("interDesc").value,
        parts: document.getElementById("interParts").value,
        timestamp: Date.now()
    };

    // SAVE LOCATION PERMANENTLY
    let locations = JSON.parse(localStorage.getItem(LOCATION_KEY) || "{}");
    locations[entry.serial] = entry.location;
    localStorage.setItem(LOCATION_KEY, JSON.stringify(locations));

    // SAVE INTERVENTION
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    alert("Intervention saved.");
    show(homeScreen);
};

// SEARCH HISTORY
document.getElementById("searchHistory").onclick = () => {
    const serial = document.getElementById("historySearch").value.trim();
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
        .filter(h => h.serial === serial);

    const container = document.getElementById("historyResults");

    if (history.length === 0) {
        container.innerHTML = "<p>No intervention found.</p>";
        return;
    }

    container.innerHTML = history.map(h => `
        <div class="historyItem">
            <strong>${h.date}</strong> — ${h.tech}<br>
            <strong>Location:</strong> ${h.location || "N/A"}<br>
            ${h.desc}<br>
            <em>${h.parts}</em>
        </div>
    `).join("");
};

// EXPORT PDF
document.getElementById("exportPdf").onclick = () => {
    const serial = document.getElementById("historySearch").value.trim();
    const html = document.getElementById("historyResults").innerHTML;

    if (!serial || !html) {
        alert("Nothing to export.");
        return;
    }

    const today = new Date().toLocaleDateString("en-CA");

    const win = window.open("", "_blank");

    win.document.write(`
        <html>
        <head>
            <title>Machine History - ${serial}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    padding: 30px;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 48px;
                }
                h1 {
                    margin: 10px 0 0 0;
                    font-size: 28px;
                }
                .meta {
                    margin-top: 10px;
                    font-size: 16px;
                    color: #555;
                }
                .historyItem {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 12px;
                }
                strong {
                    font-size: 18px;
                }
            </style>
        </head>

        <body>

            <div class="header">
                <div class="logo">🍊</div>
                <h1>Machine History</h1>
                <div class="meta">
                    <strong>Serial or Machine ID:</strong> ${serial}<br>
                    <strong>Date:</strong> ${today}
                </div>
            </div>

            <h2>Interventions</h2>

            ${html}

        </body>
        </html>
    `);

    win.document.close();
    win.print();
};

// ADD MACHINE BUTTON
const addContainer = document.getElementById("addSerialContainer");
const newSerialInput = document.getElementById("newSerialInput");

document.getElementById("addSerialButton").onclick = () => {
    addContainer.style.display = addContainer.style.display === "none" ? "block" : "none";
    newSerialInput.value = "";
};

// ADD MACHINE WITH DUPLICATE CHECK
document.getElementById("confirmAddSerial").onclick = () => {
    const serial = newSerialInput.value.trim();

    if (serial.length < 7 || serial.length > 12) {
        alert("Serial or Machine ID must be between 7 and 12 characters.");
        return;
    }

    for (let i = 0; i < dropdown.options.length; i++) {
        if (dropdown.options[i].value === serial) {
            alert("This Serial or Machine ID already exists.");
            return;
        }
    }

    const option = document.createElement("option");
    option.value = serial;
    option.textContent = serial;
    dropdown.appendChild(option);

    alert("Machine added!");
    addContainer.style.display = "none";
};
