// Function to populate the form with existing movie data for editing
function populateMovieDetails(movieId) {
    // Fetch movie details from the API or server using the ID
    const movieData = getMovieById(movieId); // Replace with actual fetching logic

    // Populate the form fields with the movie data
    document.getElementById('movieId').value = movieData.id;
    document.getElementById('title').value = movieData.title;
    document.getElementById('description').value = movieData.description;
    document.getElementById('genre').value = movieData.genre;
    document.getElementById('hours').value = movieData.duration.split(':')[0];
    document.getElementById('minutes').value = movieData.duration.split(':')[1];
    document.getElementById('PGRating').value = movieData.PGRating;
    document.getElementById('imgurl').value = movieData.imgurl;

    // Change button text
    document.querySelector('button').textContent = 'Update Movie';
}

// Simulated movie data fetch function
function getMovieById(id) {
    // Replace this with actual API call to fetch movie details by ID
    return {
        id: id,
        title: "Inception",
        description: "A mind-bending thriller",
        genre: "action",
        duration: "02:28",
        PGRating: "12",
        imgurl: "https://example.com/inception.jpg"
    };
}

// Handle form submission for editing movie
document.getElementById('editMovieForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const movieId = document.getElementById('movieId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const genre = document.getElementById('genre').value;
    const hours = document.getElementById('hours').value;
    const minutes = document.getElementById('minutes').value;
    const duration = `${hours}:${minutes}`;
    const PGRating = document.getElementById('PGRating').value;
    const imgurl = document.getElementById('imgurl').value;

    // Call updateMovie function to update the movie in the backend
    updateMovie(movieId, title, description, genre, duration, PGRating, imgurl);
});

// Simulate an update movie function (replace with actual API call)
function updateMovie(id, title, description, genre, duration, PGRating, movieImage) {
    console.log("Updating movie with ID:", id);
    console.log("New movie data:", { title, description, genre, duration, PGRating, movieImage });
    // Implement your update logic here (e.g., API request)
}

// Handle delete movie button click
document.getElementById('deleteMovieBtn').addEventListener('click', function() {
    const movieId = document.getElementById('movieId').value;

    if (confirm("Are you sure you want to delete this movie?")) {
        deleteMovie(movieId);
    }
});

// Simulate delete movie function (replace with actual API call)
function deleteMovie(id) {
    console.log("Deleting movie with ID:", id);
    // Implement your delete logic here (e.g., API request)
}

// Simulate page load and populate with movie details (example: movie ID is 1)
window.onload = function() {
    populateMovieDetails(1); // Replace with actual logic to get movie ID
};