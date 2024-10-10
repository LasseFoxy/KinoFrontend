// Variabel til at holde biografsals-ID (hvis vi opdaterer)
let theaterId = null;

document.getElementById("theaterForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Indsamling af data fra formularen
    const theaterName = document.getElementById("theaterName").value;
    const numberOfRows = document.getElementById("numberOfRows").value;
    const seatsPerRow = document.getElementById("seatsPerRow").value;

    // Opret JSON objekt med biografsalens information
    const theaterData = {
        name: theaterName,
        numberOfRows: parseInt(numberOfRows, 10),
        seatsPerRow: parseInt(seatsPerRow, 10)
    };

    // Skelne mellem oprettelse og opdatering
    const method = theaterId ? 'PUT' : 'POST';
    const url = theaterId ? `https://kind-river-087a56c03.5.azurestaticapps.net/api/theater/${theaterId}` : 'https://kind-river-087a56c03.5.azurestaticapps.net/api/theater';

    // Send request til backend API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(theaterData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fejl i oprettelse/opdatering af biografsal');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("message").textContent = `Biografsal ${theaterId ? 'opdateret' : 'oprettet'} succesfuldt!`;
            document.getElementById("message").classList.add("alert", "alert-success");

            // Nulstil formularen
            document.getElementById("theaterForm").reset();

            // Nulstil theaterId for at tillade oprettelse af ny biografsal efter opdatering
            theaterId = null;

            // Opdater titel og knaptekst tilbage til standard for oprettelse
            document.getElementById("formTitle").textContent = "Opret Biografsal";
            document.getElementById("submitButton").textContent = "Gem biografsal";
        })
        .catch(error => {
            document.getElementById("message").textContent = "Der opstod en fejl: " + error.message;
            document.getElementById("message").classList.add("alert", "alert-danger");
        });
});

// Funktion til at indlæse data for en biografsal, når den skal opdateres
function loadTheaterData(id) {
    // Hent data for en biografsal ved ID
    fetch(`https://kind-river-087a56c03.5.azurestaticapps.net/api/theater/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Fejl ved hentning af biografsal');
            }
            return response.json();
        })
        .then(data => {
            // Udfyld formularen med de eksisterende data
            document.getElementById("theaterName").value = data.name;
            document.getElementById("numberOfRows").value = data.numberOfRows;
            document.getElementById("seatsPerRow").value = data.seatsPerRow;

            // Sæt theaterId til det opdaterede ID
            theaterId = id;

            // Opdater titel og knaptekst til opdateringsmodus
            document.getElementById("formTitle").textContent = "Opdater Biografsal";
            document.getElementById("submitButton").textContent = "Opdater biografsal";
        })
        .catch(error => {
            document.getElementById("message").textContent = "Der opstod en fejl: " + error.message;
            document.getElementById("message").classList.add("alert", "alert-danger");
        });
}

// --- MODAL TIL SLETNING AF BIOGRAFSAL ---
document.getElementById("deleteTheaterButton").addEventListener("click", function() {
    openDeleteTheaterModal();
});

// Eventlistener til at lukke modal på annullering
document.getElementById("cancelDeleteTheaterButton").addEventListener("click", function() {
    closeDeleteTheaterModal();
});

// Eventlistener til at lukke modal på baggrundsklik (luk ved klik på overlay)
document.getElementById("deleteTheaterModalOverlay").addEventListener("click", function() {
    closeDeleteTheaterModal();
});

// Eventlistener til at slette biografsalen når "Bekræft" trykkes
document.getElementById("confirmDeleteTheaterButton").addEventListener("click", function() {
    const selectedTheaterId = document.getElementById("theaterSelectDelete").value;
    if (selectedTheaterId) {
        deleteTheater(selectedTheaterId);
    }
});

// Funktion til at åbne modal og indlæse biografsale i dropdown
function openDeleteTheaterModal() {
    fetch("https://kind-river-087a56c03.5.azurestaticapps.net/api/theater")
        .then(response => response.json())
        .then(theaters => {
            const theaterSelect = document.getElementById("theaterSelectDelete");
            theaterSelect.innerHTML = ''; // Rens dropdown før ny indlæsning

            // Tilføj en standard ikke-valgbar option som første valg
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.text = "- Vælg en biografsal -";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            theaterSelect.appendChild(defaultOption);

            // Tilføj biografsale til dropdown
            theaters.forEach(theater => {
                const option = document.createElement("option");
                option.value = theater.theaterId;
                option.text = theater.name;
                theaterSelect.appendChild(option);
            });

            document.getElementById("deleteTheaterModal").style.display = "block";
            document.getElementById("deleteTheaterModalOverlay").style.display = "block"; // Vis modal og overlay
        })
        .catch(error => console.error("Fejl ved hentning af biografsale:", error));
}

// Funktion til at lukke modal og skjule overlay
function closeDeleteTheaterModal() {
    document.getElementById("deleteTheaterModal").style.display = "none";
    document.getElementById("deleteTheaterModalOverlay").style.display = "none";
}

// Funktion til at slette biografsal
async function deleteTheater(theaterId) {
    try {
        const response = await fetch(`https://kind-river-087a56c03.5.azurestaticapps.net/api/theater/${theaterId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Fejl ved sletning af biografsal');
        alert('Biografsal slettet succesfuldt!');
        closeDeleteTheaterModal();
    } catch (error) {
        console.error('Fejl ved sletning af biografsal:', error);
        alert('Der opstod en fejl ved sletning af biografsalen.');
    }
}

