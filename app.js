// INIT DATA
const today = new Date().toISOString().split('T')[0];
document.getElementById('mfgDate').value = today;

let targetExpDate = new Date();
targetExpDate.setMonth(targetExpDate.getMonth() + 6); // Default 6 months expiry
document.getElementById('expDate').value = targetExpDate.toISOString().split('T')[0];

// ROUTING SYSTEM (Checks if URL has parameters)
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('hash')) {
    // WE ARE IN CUSTOMER VIEW (Someone scanned the code)
    document.getElementById('verify-view').classList.add('active-view');
    document.getElementById('subtitle').innerText = "Consumer Protection verification";

    // Populate data from URL
    document.getElementById('v-batch').innerText = urlParams.get('batch');
    document.getElementById('v-mfg').innerText = urlParams.get('mfg');
    document.getElementById('v-exp').innerText = urlParams.get('exp');
    document.getElementById('v-hash').innerText = urlParams.get('hash');

    const rawData = `SpinachIceCreamOriginal|${urlParams.get('batch')}|${urlParams.get('mfg')}|${urlParams.get('exp')}`;
    const checkHash = "0x" + CryptoJS.SHA256(rawData).toString();

    if (checkHash !== urlParams.get('hash')) {
        document.getElementById('statusBadge').innerText = "WARNING: TAMPERED PRODUCT";
        document.getElementById('statusBadge').style.background = "rgba(239, 68, 68, 0.2)";
        document.getElementById('statusBadge').style.color = "#EF4444";
        document.getElementById('statusBadge').style.borderColor = "#EF4444";
    }
} else {
    // WE ARE IN ADMIN VIEW
    document.getElementById('admin-view').classList.add('active-view');
}

// APP LOGIC
let currentVerificationUrl = "";

function mintToken() {
    const batch = document.getElementById('batchId').value;
    const mfg = document.getElementById('mfgDate').value;
    const exp = document.getElementById('expDate').value;
    const qty = parseInt(document.getElementById('qty').value) || 1;

    if (!batch || !mfg || !exp) {
        alert("Please fill all fields!");
        return;
    }
    if (qty > 500) {
        alert("Please print a maximum of 500 labels at a time to prevent browser lag.");
        return;
    }

    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear old labels

    let firstUrl = "";

    for (let i = 1; i <= qty; i++) {
        // Generate Item-Level Traceability Hash
        // e.g. SIC-B001-001, SIC-B001-002
        let itemId = batch;
        if (qty > 1) {
            itemId = `${batch}-${i.toString().padStart(3, '0')}`;
        }

        const rawString = `SpinachIceCreamOriginal|${itemId}|${mfg}|${exp}`;
        const hash = "0x" + CryptoJS.SHA256(rawString).toString();

        const baseUrl = window.location.href.split('?')[0];
        const verificationUrl = `${baseUrl}?batch=${encodeURIComponent(itemId)}&mfg=${encodeURIComponent(mfg)}&exp=${encodeURIComponent(exp)}&hash=${hash}`;

        if (i === 1) firstUrl = verificationUrl;

        // Create label UI
        const labelDiv = document.createElement("div");
        labelDiv.className = "label-item";

        const title = document.createElement("h4");
        title.innerText = itemId;
        labelDiv.appendChild(title);

        const qrDiv = document.createElement("div");
        labelDiv.appendChild(qrDiv);

        labelContainer.appendChild(labelDiv);

        new QRCode(qrDiv, {
            text: verificationUrl,
            width: 110, // Small QR for labels
            height: 110,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }

    currentVerificationUrl = firstUrl;
    document.getElementById('tokenDisplay').innerText = `Successfully Generated ${qty} unique item tokens.`;

    // Show results buttons in admin view
    document.getElementById('result-section').style.display = 'block';
}

function simulateScan() {
    if (currentVerificationUrl) {
        window.location.href = currentVerificationUrl;
    }
}

function showPrintView() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('print-view').style.display = 'block';

    // Set text alignment to start for the body, helps with grid layout when printing
    document.body.style.alignItems = "flex-start";
}

function hidePrintView() {
    document.getElementById('print-view').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    document.body.style.alignItems = "center";
}

function goBack() {
    window.location.href = window.location.href.split('?')[0];
}
