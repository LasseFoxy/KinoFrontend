

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

    //---------------------------------------    VIEW HANDLING   -------------------------------------------------------------------

    // Håndter navigation til Add Movie sektionen
    document.getElementById('showAddMovieForm').addEventListener('click', function () {
        window.location.hash = "#add-movie"; // Opdater URL'en med hash
        handleViewChange(); // Kald funktionen til at håndtere view changes
        addBootstrap(); // Tilføj Bootstrap når Add Movie vises
    });

    // Håndter navigation til Edit Movie sektionen
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

    //  -------------------------------  ADD MOVIE -----------------------------

    // Håndter tilføjelse af film
    document.getElementById('addMovieForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Forhindrer form submission

        const movieTitle = document.getElementById('addMovieTitle').value;
        const movieDescription = document.getElementById('addMovieDescription').value;
        const movieGenre = document.getElementById('addMovieGenre').value;
        const movieHours = document.getElementById('addMovieHours').value;
        const movieMinutes = document.getElementById('addMovieMinutes').value;
        const moviePGRating = document.getElementById('addMoviePGRating').value;
        const imageUrl = document.getElementById('addMovieImageUrl').value;

        // Konverter timer og minutter til samlet varighed i minutter
        const movieDuration = parseInt(movieHours) * 60 + parseInt(movieMinutes);

        // Opret et movieData objekt
        const movieData = {
            title: movieTitle,
            description: movieDescription,
            genre: movieGenre,
            duration: movieDuration,
            ageLimit: moviePGRating,
            imageUrl: imageUrl
        };

        // POST-anmodning til at tilføje film
        fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        })

        .then(response => response.json())
        .then(data => {
            alert('Filmen oprettet!');
            fetchMoviesForEdit();  // Opdater dropdown efter filmoprettelse
            window.location.href='#admin';
        })
        .catch(error => console.error('Fejl under oprettelsen af filmen:', error));
    });


        //----------------------------------------   EDIT MOVIE    ----------------------------------------------------------------------

    document.addEventListener('DOMContentLoaded', function() {
        fetchMoviesForEdit(); // Kald denne funktion ved siden af indlæsningen af siden
    });

        // Fetch movies from backend and update dropdown list
        function fetchMoviesForEdit() {
            fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie')
                .then(response => response.json())
                .then(movies => {
                    console.log(movies);  // Tjek om du får filmene her
                    const selectElement = document.getElementById('movieSelectEdit');
                    selectElement.innerHTML = '';  // Rens dropdown før ny indlæsning
                    if (movies.length > 0) {
                        movies.forEach(movie => {
                            const option = document.createElement('option');
                            option.value = movie.movieId;
                            option.textContent = movie.title;
                            selectElement.appendChild(option);
                        });
                    } else {
                        // Hvis ingen film findes, vis en placeholder
                        const option = document.createElement('option');
                        option.textContent = 'Ingen film tilgængelige';
                        selectElement.appendChild(option);
                    }
                })
                .catch(error => {
                    console.error('Error fetching movies:', error);
                });
        }


        // Update form fields when a movie is selected
        document.getElementById('movieSelectEdit').addEventListener('change', function () {
            const movieId = this.value;

            if (movieId) {
                fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie/${movieId}`)
                    .then(response => response.json())
                    .then(movie => {
                        document.getElementById('movieId').value = movie.movieId;
                        document.getElementById('editMovieTitle').value = movie.title;
                        document.getElementById('editMovieDescription').value = movie.description;
                        document.getElementById('editMovieGenre').value = movie.genre;
                        document.getElementById('editMovieHours').value = Math.floor(movie.duration / 60);
                        document.getElementById('editMovieMinutes').value = movie.duration % 60;
                        document.getElementById('editMoviePGRating').value = movie.ageLimit;
                        document.getElementById('editMovieImageUrl').value = movie.imageUrl;
                    })
                    .catch(error => console.error('Error fetching movie details:', error));
            } else {
                // If no movie is selected, clear form
                document.getElementById('movieId').value = '';
                document.getElementById('editMovieTitle').value = '';
                document.getElementById('editMovieDescription').value = '';
                document.getElementById('editMovieGenre').value = '';
                document.getElementById('editMovieHours').value = '';
                document.getElementById('editMovieMinutes').value = '';
                document.getElementById('editMoviePGRating').value = '';
                document.getElementById('editMovieImageUrl').value = '';
            }
        });

        // Handle movie update
        document.getElementById('editMovieForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const movieId = document.getElementById('movieId').value;
            const movieTitle = document.getElementById('editMovieTitle').value;
            const movieDescription = document.getElementById('editMovieDescription').value;
            const movieGenre = document.getElementById('editMovieGenre').value;
            const movieHours = document.getElementById('editMovieHours').value;
            const movieMinutes = document.getElementById('editMovieMinutes').value;
            const moviePGRating = document.getElementById('editMoviePGRating').value;
            const imageUrl = document.getElementById('editMovieImageUrl').value;

            const movieDuration = parseInt(movieHours) * 60 + parseInt(movieMinutes);

            const movieData = {
                title: movieTitle,
                description: movieDescription,
                genre: movieGenre,
                duration: movieDuration,
                ageLimit: moviePGRating,
                imageUrl: imageUrl
            };

            fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie/${movieId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            })
                .then(response => response.json())
                .then(data => {
                    alert('Filmen opdateret!');
                })
                .catch(error => console.error('Error updating movie:', error));
        });


        //------------------------------------- DELETE --------------------------------------------------

// Variabel til at holde film-ID (hvis vi opdaterer)
        let movieId = null;

// Eventlistener til at åbne modal for sletning af film
        document.getElementById("deleteMovieButton").addEventListener("click", function () {
            openDeleteMovieModal(); // Åbn modal for sletning af film
        });

// Eventlistener til at lukke modal ved annullering
        document.getElementById("cancelDeleteMovieButton").addEventListener("click", function () {
            closeDeleteMovieModal(); // Luk modal
        });

// Eventlistener til at lukke modal på baggrundsklik (overlay)
        document.getElementById("deleteMovieModalOverlay").addEventListener("click", function () {
            closeDeleteMovieModal(); // Luk modal ved klik på overlay
        });

// Eventlistener til at slette film når "Bekræft" trykkes
        document.getElementById("confirmDeleteMovieButton").addEventListener("click", function () {
            const selectedMovieId = document.getElementById("movieSelectDelete").value;
            if (selectedMovieId) {
                deleteMovie(selectedMovieId);  // Kald deleteMovie med valgt film-ID
            }
        });

// Funktion til at åbne modal og indlæse film i dropdown
        function openDeleteMovieModal() {
            fetch("https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie")
                .then(response => response.json())
                .then(movies => {
                    const movieSelect = document.getElementById("movieSelectDelete");
                    movieSelect.innerHTML = '';  // Rens dropdown før ny indlæsning

                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.text = "- Vælg en film -";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    movieSelect.appendChild(defaultOption);

                    // Tilføj film til dropdown
                    movies.forEach(movie => {
                        const option = document.createElement("option");
                        option.value = movie.movieId;
                        option.text = movie.title;
                        movieSelect.appendChild(option);
                    });

                    document.getElementById("deleteMovieModal").style.display = "block";
                    document.getElementById("deleteMovieModalOverlay").style.display = "block"; // Vis modal og overlay
                })
                .catch(error => console.error("Fejl ved hentning af film:", error));
        }

// Funktion til at lukke modal og skjule overlay
        function closeDeleteMovieModal() {
            document.getElementById("deleteMovieModal").style.display = "none";
            document.getElementById("deleteMovieModalOverlay").style.display = "none";
        }

// Funktion til at slette film
        async function deleteMovie(movieId) {
            try {
                const response = await fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie/${movieId}`, {method: 'DELETE'});
                if (!response.ok) throw new Error('Fejl ved sletning af film');

                alert('Filmen blev slettet succesfuldt!');
                closeDeleteMovieModal();  // Luk modal
                updateMovieDropdown();  // Opdater dropdown efter sletning
            } catch (error) {
                console.error('Fejl ved sletning af film:', error);
                alert('Der opstod en fejl ved sletning af filmen.');
            }
        }

// Funktion til at opdatere dropdown efter sletning
        function updateMovieDropdown() {
            fetch("https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie")
                .then(response => response.json())
                .then(movies => {
                    const movieSelect = document.getElementById("movieSelectDelete");
                    movieSelect.innerHTML = '';  // Rens dropdown før ny indlæsning

                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.text = "- Vælg en film -";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    movieSelect.appendChild(defaultOption);

                    // Tilføj film til dropdown
                    movies.forEach(movie => {
                        const option = document.createElement("option");
                        option.value = movie.movieId;
                        option.text = movie.title;
                        movieSelect.appendChild(option);
                    });
                })
                .catch(error => console.error("Fejl ved opdatering af film:", error));

    }

    document.getElementById("removeMoviesWithoutOrdersButton").addEventListener("click", function() {
        openRemoveMoviesModal();
    });

    document.getElementById("cancelRemoveMovieButton").addEventListener("click", function() {
        closeRemoveMoviesModal();
    });

    document.getElementById("removeMoviesModalOverlay").addEventListener("click", function() {
        closeRemoveMoviesModal();
    });

    document.getElementById("confirmRemoveMovieButton").addEventListener("click", function() {
        const selectedMovieId = document.getElementById("movieSelectRemove").value;
        if (selectedMovieId) {
            removeMovieWithoutOrders(selectedMovieId);
        }
    });

    function openRemoveMoviesModal() {
        fetch("https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/movie")
            .then(response => response.json())
            .then(movies => {
                const movieSelect = document.getElementById("movieSelectRemove");
                movieSelect.innerHTML = '';  // Clear dropdown before new loading

                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.text = "- Vælg en film -";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                movieSelect.appendChild(defaultOption);

                // Add movies to dropdown
                movies.forEach(movie => {
                    const option = document.createElement("option");
                    option.value = movie.movieId;
                    option.text = movie.title;
                    movieSelect.appendChild(option);
                });

                document.getElementById("removeMoviesModal").style.display = "block";
                document.getElementById("removeMoviesModalOverlay").style.display = "block"; // Show modal and overlay
            })
            .catch(error => console.error("Fejl ved hentning af film:", error));
    }

    function closeRemoveMoviesModal() {
        document.getElementById("removeMoviesModal").style.display = "none";
        document.getElementById("removeMoviesModalOverlay").style.display = "none";
    }

    async function removeMovieWithoutOrders(movieId) {
        try {
            const response = await fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/showings/delete-by-movie/${movieId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Fejl ved sletning af film uden ordrer');
            alert('Filmvisninger uden billetter fjernet!');
            closeRemoveMoviesModal();
        } catch (error) {
            console.error('Fejl ved sletning af film uden ordrer:', error);
            alert('Der opstod en fejl ved sletning af filmen.');
        }
    }