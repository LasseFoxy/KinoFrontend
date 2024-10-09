document.addEventListener('DOMContentLoaded', function () {
    // Funktion til at tilføje Bootstrap CSS dynamisk
    function addBootstrap() {
        if (!document.getElementById('bootstrap-css')) {
            const link = document.createElement('link');
            link.id = 'bootstrap-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css';
            document.head.appendChild(link);
        }
    }

    // Funktion til at fjerne Bootstrap CSS
    function removeBootstrap() {
        const bootstrapLink = document.getElementById('bootstrap-css');
        if (bootstrapLink) {
            document.head.removeChild(bootstrapLink);
        }
    }

    // Håndter navigation til Add Movie sektionen
    document.getElementById('showAddMovieForm').addEventListener('click', function () {
        window.location.hash = "#add-movie"; // Opdater URL'en med hash
        handleViewChange(); // Kald funktionen til at håndtere view changes
        addBootstrap(); // Tilføj Bootstrap når Add Movie vises
    });

    // Håndter navigation til Edit Movie sektionen
    document.getElementById('showEditMovieForm').addEventListener('click', function () {
        window.location.hash = "#edit-movie"; // Opdater URL'en med hash
        handleViewChange(); // Kald funktionen til at håndtere view changes
        addBootstrap(); // Tilføj Bootstrap når Edit Movie vises
    });

    // Funktion til at håndtere visning af den korrekte sektion
    function handleViewChange() {
        let defaultView = "#home"; // Default view

        // Hvis der er en hash i URL'en, brug den til at vise den rigtige sektion
        if (location.hash) {
            defaultView = location.hash;
        }

        // Skjul alle views
        document.querySelectorAll('.view-content').forEach(section => {
            section.style.display = 'none';
        });

        // Vis den valgte sektion
        const activeSection = document.querySelector(defaultView);
        if (activeSection) {
            activeSection.style.display = 'block';
        }

        // Fjern Bootstrap hvis man forlader Add/Edit Movie sektionerne
        if (defaultView !== '#add-movie' && defaultView !== '#edit-movie') {
            removeBootstrap(); // Fjern Bootstrap når du navigerer væk
        }
    }

    // Håndter hash ændringer i URL'en (når man navigerer frem og tilbage)
    window.addEventListener('hashchange', handleViewChange);
    handleViewChange(); // Kald funktionen ved siden indlæsning for at vise korrekt sektion

    // Håndter tilføjelse af film
    document.getElementById('addMovieForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Forhindrer form submission

        const movieTitle = document.getElementById('addMovieTitle').value;
        const movieDescription = document.getElementById('addMovieDescription').value;
        const movieGenre = document.getElementById('addMovieGenre').value;
        const movieHours = document.getElementById('addMovieHours').value;
        const movieMinutes = document.getElementById('addMovieMinutes').value;
        const moviePGRating = document.getElementById('addMoviePGRating').value;
        const imageUrl = document.getElementById('addMovieImageUrl').value; // URL til billedet

        // Konverter timer og minutter til samlet varighed i minutter
        const movieDuration = parseInt(movieHours) * 60 + parseInt(movieMinutes);

        // Opret et movieData objekt
        const movieData = {
            title: movieTitle,
            description: movieDescription,
            genre: movieGenre,
            duration: movieDuration, // Varighed i minutter
            ageLimit: moviePGRating,
            imageUrl: imageUrl // Billedets URL
        };

        // POST-anmodning til at tilføje film
        console.log("Starting the POST request to add a movie...");

        fetch('http://localhost:8080/api/movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData) // Send movie data som JSON
        })
            .then(response => {
                console.log("Received response from server.");

                // Log status og headers
                console.log("Status Code:", response.status);
                console.log("Response Headers:", JSON.stringify([...response.headers]));

                // Tjek om response er OK (statuskode 200-299)
                if (!response.ok) {
                    // Log hvis statuskode er en fejl
                    console.error("Response not OK. Status:", response.status);
                    throw new Error('HTTP error! status: ' + response.status);
                }

                console.log("Attempting to parse JSON response...");
                return response.json(); // Forsøg at parse JSON-svaret
            })
            .then(data => {
                // Log hele svaret som en string til debugging
                console.log('Parsed Server Response:', JSON.stringify(data));

                // Vis succesbesked til brugeren
                const alertBox = document.getElementById('addMovieResponseAlert');
                alertBox.style.display = 'block'; // Vis alert-boksen
                alertBox.innerText = 'Film oprettet!'; // Sæt teksten til 'Film oprettet!'

                // Du kan tilføje logik til at nulstille formularen efter film er oprettet
                document.getElementById('addMovieForm').reset();
            })
            .catch(error => {
                // Log detaljeret fejlbesked ved fejl i fetch eller JSON-parsing
                console.error("An error occurred during the fetch operation:", error.message);
            });

        console.log("POST request to add a movie has been sent.");
    });

    // Håndter redigering af film
    document.getElementById('editMovieForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Forhindrer form submission

        const movieId = document.getElementById('movieId').value;
        const movieTitle = document.getElementById('editMovieTitle').value;
        const movieDescription = document.getElementById('editMovieDescription').value;
        const movieGenre = document.getElementById('editMovieGenre').value;
        const movieHours = document.getElementById('editMovieHours').value;
        const movieMinutes = document.getElementById('editMovieMinutes').value;
        const moviePGRating = document.getElementById('editMoviePGRating').value;
        const imageUrl = document.getElementById('editMovieImageUrl').value; // URL til billedet

        // Konverter timer og minutter til samlet varighed i minutter
        const movieDuration = parseInt(movieHours) * 60 + parseInt(movieMinutes);

        // Opret et movieData objekt
        const movieData = {
            title: movieTitle,
            description: movieDescription,
            genre: movieGenre,
            duration: movieDuration,
            ageLimit: moviePGRating,
            imageUrl: imageUrl // Billedets URL
        };

        // PUT-anmodning til at opdatere film
        fetch(`http://localhost:8080/api/movie/${movieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Movie updated successfully');
            })
            .catch(error => {
                console.error('Error updating movie:', error);
            });
    });

    // Håndter sletning af film
    document.getElementById('deleteMovieBtn').addEventListener('click', function () {
        const movieId = document.getElementById('movieId').value;

        fetch(`http://localhost:8080/api/movie/${movieId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Movie deleted successfully');
                // Tilføj eventuelt logik til at fjerne filmen fra UI eller navigere tilbage til filmoversigten
            })
            .catch(error => {
                console.error('Error deleting movie:', error);
            });
    });
});
