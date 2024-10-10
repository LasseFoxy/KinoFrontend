import { Movies } from './movies.js';

export class Confirmation {
    constructor(bookingDetails) {
        this.bookingDetails = bookingDetails;
        this.showBookingConfirmation();
    }

    showBookingConfirmation() {
        const { movieTitle, time, seatIds } = this.bookingDetails;
        this.fetchSeatDetails(seatIds).then(seats => {
            const numTickets = seats.length;
            const seatNumbers = seats.map(seat => `${seat.seatRow}${this.getSeatLetter(seat.seatNumber)}`).join(', ');
            const formattedTime = time.slice(0, 5).replace(":", " ");
            document.getElementById('confirmation-message').innerText =
                `Du har booket ${numTickets} billetter til at se "${movieTitle}" klokken ${formattedTime}. Din(e) sæder er: ${seatNumbers}.`;
            switchContainer('confirmation-container');
        });
    }

    fetchSeatDetails(seatIds) {
        if (!Array.isArray(seatIds) || seatIds.length === 0) {
            throw new Error('Invalid seat IDs');
        }
        const seatIdsParam = seatIds.join(',');
        return fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/seat/byIds?seatIds=${seatIdsParam}`)
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                return [];
            });
    }

    getSeatLetter(seatNumber) {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[(seatNumber - 1) % 26];
    }

    // Fetch seat details based on seat IDs
    fetchSeatDetails(seatIds) {
        if (!Array.isArray(seatIds) || seatIds.length === 0) {
            throw new Error('Invalid seat IDs');
        }
        const seatIdsParam = seatIds.join(',');
        return fetch(`https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net//api/seat/byIds?seatIds=${seatIdsParam}`)
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.error('Error fetching seat details:', error);
                return [];
            });
    }
}

document.getElementById('return-movie-chooser').addEventListener('click', () => {
    switchContainer('display-movies-seat-selector');
});



function switchContainer(containerId) {
    const currentVisible = document.querySelector('.container-visible');
    if (currentVisible) {
        currentVisible.classList.remove('container-visible');
        currentVisible.classList.add('container');
    }
    const newContainer = document.getElementById(containerId);
    newContainer.classList.remove('container');
    newContainer.classList.add('container-visible');
}
