// Function to fetch and display all movies
async function fetchAndDisplayMovies() {
    try {
        const response = await fetch('http://localhost:8080/api/movie/movieDTOs');
        const movies = await response.json();

        const movieContainer = document.getElementById('movies-container2');
        movieContainer.innerHTML = '';  // Clear any previous content

        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieContainer.appendChild(movieCard);
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Function to create a movie card for each movie
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    // Movie image
    const poster = document.createElement('img');
    poster.src = movie.imageUrl;
    poster.alt = `${movie.title} poster`;
    poster.classList.add('movie-poster');
    card.appendChild(poster);

    // Movie title
    const title = document.createElement('h3');
    title.innerText = movie.title;
    card.appendChild(title);

    // Movie genre
    const genre = document.createElement('p');
    genre.innerText = `Genre: ${movie.genre}`;
    card.appendChild(genre);

    return card;
}

// Call function on page load or event trigger
document.addEventListener('DOMContentLoaded', fetchAndDisplayMovies);
