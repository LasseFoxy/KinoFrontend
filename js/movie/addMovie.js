$(document).ready(function() {
    // Når dokumentet er klar
    $('#uploadImageBtn').on('click', function(e) {
        e.preventDefault();  // Forhindrer standard formular-indsending

        var formData = new FormData();  // Opretter et FormData-objekt til fil-upload
        var fileInput = $('#image')[0];  // Henter file input-elementet
        var file = fileInput.files[0];  // Henter den første valgte fil

        if (file) {
            formData.append("image", file);  // Tilføjer filen til FormData-objektet

            // Send filen via AJAX
            $.ajax({
                url: '/api/v1/movie/upload-image',  // API-endpoint for upload
                type: 'POST',
                data: formData,
                processData: false,  // Forhindrer jQuery i at bearbejde dataene
                contentType: false,  // Forhindrer jQuery i at sætte contentType
                success: function(response) {
                    console.log('Image uploaded successfully!', response);
                    alert('Image uploaded!');
                },
                error: function(xhr, status, error) {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image!');
                }
            });
        } else {
            alert('Please select an image before submitting!');
        }
    });

    // Lytter efter ændringer i fil-input og opdaterer fil-tælleren
    $('#image').on('change', function() {
        var fileCount = this.files.length;  // Får antallet af valgte filer

        // Opdaterer fil-tælleren tekst
        if (fileCount === 0) {
            $('#fileCount').text("No files chosen");
        } else {
            $('#fileCount').text(fileCount + " file(s) chosen");
        }
    });
});
