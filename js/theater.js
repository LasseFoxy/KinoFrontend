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
        number_of_rows: parseInt(numberOfRows, 10),
        seats_per_row: parseInt(seatsPerRow, 10)
    };

    // Skelne mellem oprettelse og opdatering
    const method = theaterId ? 'PUT' : 'POST';
    const url = theaterId ? `http://localhost:8080/theaters/${theaterId}` : 'http://localhost:8080/theaters';

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
    fetch(`http://localhost:8080/theaters/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Fejl ved hentning af biografsal');
            }
            return response.json();
        })
        .then(data => {
            // Udfyld formularen med de eksisterende data
            document.getElementById("theaterName").value = data.name;
            document.getElementById("numberOfRows").value = data.number_of_rows;
            document.getElementById("seatsPerRow").value = data.seats_per_row;

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
