document.addEventListener("DOMContentLoaded", function () {
    const movieForm = document.getElementById('movieForm');
    const submitMovieBtn = document.getElementById('submitMovieBtn');
    const fileInput = document.getElementById('image');

    movieForm.addEventListener('submit', function (e) {
        e.preventDefault();  // Prevent form submission

        const newMovie = {
            title: document.getElementById('title').value,  // Movie title
            description: document.getElementById('description').value,  // Movie description
            genre: document.getElementById('genre').value,  // Movie genre
            duration: {
                hours: document.getElementById('hours').value,
                minutes: document.getElementById('minutes').value
            },
            PGRating: document.getElementById('PGRating').value  // Age rating
        };

        const movieUrl = '/api/v1/movie';

        // Create FormData to include the image file
        const formData = new FormData();
        formData.append('movie', JSON.stringify(newMovie));  // Add movie data
        formData.append('image', fileInput.files[0]);  // Add the selected image

        // Send the movie data along with the image
        fetch(movieUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add movie');
                }
                return response.json();
            })
            .then(movieData => {
                console.log('Movie added:', movieData);
                alert('Movie added successfully!');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error adding movie!');
            });
    });

    // Handle file input changes
    fileInput.addEventListener('change', function () {
        const fileCount = this.files.length;
        const fileCountText = fileCount === 0 ? "No files chosen" : `${fileCount} file(s) chosen`;
        document.getElementById('fileCount').textContent = fileCountText;
    });
});
