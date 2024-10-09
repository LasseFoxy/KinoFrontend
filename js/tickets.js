import { Confirmation } from './confirmation.js';

export class Tickets {
    constructor(bookingDetails) {
        this.bookingDetails = bookingDetails;
        this.selectedSeats = [];
        this.fetchAndDisplaySeats();
    }

    // Fetch and display available and booked seats for a specific theatre and showtime
    fetchAndDisplaySeats() {
        const { theaterId, showingId } = this.bookingDetails;

        fetch(`http://localhost:8080/api/seat/theater/${theaterId}`)
            .then(response => {
                if (!response.ok) {  // Check if the response is not OK (status code 2xx)
                    throw new Error(`Error fetching seats: ${response.status} ${response.statusText}`);
                }
                return response.text();  // Get the raw response as text
            })
            .then(text => {
                console.log('Raw seats response:', text);  // Log the raw text response

                let seats;
                try {
                    seats = JSON.parse(text);  // Attempt to parse the JSON
                } catch (e) {
                    console.error('Invalid JSON from seats API:', text);  // Log the invalid JSON
                    throw new Error('Invalid JSON response');
                }

                fetch(`http://localhost:8080/api/order/showing/${showingId}`)
                    .then(response => {
                        if (!response.ok) {  // Check if the response is not OK
                            throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
                        }
                        return response.text();  // Get the raw response as text
                    })
                    .then(text => {
                        console.log('Raw orders response:', text);  // Log the raw text response

                        let orders;
                        try {
                            orders = JSON.parse(text);  // Attempt to parse the JSON
                        } catch (e) {
                            console.error('Invalid JSON from orders API:', text);  // Log the invalid JSON
                            throw new Error('Invalid JSON response');
                        }

                        this.processSeatData(seats, orders);
                    })
                    .catch(error => console.error('Error fetching orders:', error));
            })
            .catch(error => {
                console.error('Error fetching seats:', error);  // Log the error
                alert('Failed to load seat data. Please try again later.');  // Notify the user
            });

    }




    // Process and display seat data
    processSeatData(seats, orders) {
        console.log("Seats data:", seats);
        if (!Array.isArray(seats)) {
            console.error('Seats is not an array:', seats);
            return;
        }
        const bookedSeatIds = new Set();
        orders.forEach(order => {
            if (order.tickets && Array.isArray(order.tickets)) {
                order.tickets.forEach(ticket => {
                    bookedSeatIds.add(Number(ticket.seat.seatId));
                });
            }
        });

        const seatsContainer = document.getElementById('seats-container');
        if (!seatsContainer) {
            console.error('Seats container not found');
            return;
        }

        seatsContainer.innerHTML = '';  // Clear previous content

        const groupedSeats = seats.reduce((acc, seat) => {
            if (!acc[seat.seatRow]) {
                acc[seat.seatRow] = [];
            }
            acc[seat.seatRow].push(seat);
            return acc;
        }, {});

        for (const row in groupedSeats) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('seat-row');
            groupedSeats[row].forEach(seat => {
                const seatDiv = document.createElement('div');
                seatDiv.classList.add('seat');
                seatDiv.innerText = `${seat.seatRow}${seat.seatNumber}`;
                seatDiv.dataset.seatId = seat.seatId;
                seatDiv.dataset.seatRow = seat.seatRow;
                seatDiv.dataset.seatNumber = seat.seatNumber;

                if (bookedSeatIds.has(Number(seat.seatId))) {
                    seatDiv.classList.add('occupied');
                } else {
                    seatDiv.addEventListener('click', () => this.handleSeatSelection(seatDiv));
                }

                rowDiv.appendChild(seatDiv);
            });
            seatsContainer.appendChild(rowDiv);
        }
    }

    // Handle seat selection logic
    selectedSeats = [];
    handleSeatSelection(seatDiv) {
        const numTickets = parseInt(document.getElementById('num-tickets').value);
        const seatRow = seatDiv.dataset.seatRow;
        const seatNumber = parseInt(seatDiv.dataset.seatNumber);
        const allSeatsInRow = Array.from(document.querySelectorAll(`.seat[data-seat-row="${seatRow}"]`));

        // Clear only previously selected seats in this row
        document.querySelectorAll('.seat.selected').forEach(seat => seat.classList.remove('selected'));
        this.selectedSeats = []; // Reset selected seats only before selecting new ones

        const selectedIndex = allSeatsInRow.findIndex(seat => parseInt(seat.dataset.seatNumber) === seatNumber);
        const availableSeatsInRow = allSeatsInRow.filter(seat => !seat.classList.contains('occupied')).length;

        if (numTickets > availableSeatsInRow) {
            alert(`You cannot select more tickets than available seats in row ${seatRow}. Available seats: ${availableSeatsInRow}`);
            return;
        }

        let rightSeats = allSeatsInRow.slice(selectedIndex, selectedIndex + numTickets).filter(seat => !seat.classList.contains('occupied'));
        if (rightSeats.length < numTickets) {
            const leftNeeded = numTickets - rightSeats.length;
            let leftSeats = allSeatsInRow.slice(Math.max(0, selectedIndex - leftNeeded), selectedIndex).filter(seat => !seat.classList.contains('occupied'));
            rightSeats = [...leftSeats, ...rightSeats];
        }

        if (rightSeats.length === numTickets) {
            rightSeats.forEach(seat => {
                seat.classList.add('selected');
                const seatId = Number(seat.dataset.seatId);  // Ensure seatId is a number
                this.selectedSeats.push(seatId);  // Push seatId as a number
            });
        } else {
            alert('Not enough available seats next to the selected seat.');
        }

        console.log('Selected seats:', this.selectedSeats);
    }

    // Confirm booking
    confirmBooking() {
        const customerName = document.getElementById('customer-name').value;
        const numTickets = parseInt(document.getElementById('num-tickets').value);

        // Check if the correct number of seats is selected
        if (this.selectedSeats.length !== numTickets) {
            alert(`Please select exactly ${numTickets} seats.`);
            return;
        }

        if (!customerName) {
            alert('Please enter your name.');
            return;
        }

        // Ensure seat IDs are numbers
        const seatIds = this.selectedSeats.map(seatId => Number(seatId));  // Convert seatId to number

        // Log seatIds for debugging
        console.log('Selected seats:', this.selectedSeats);
        console.log('Number of selected seats:', this.selectedSeats.length);
        console.log('Seat IDs for booking (after converting to number):', seatIds);

        const orderPayload = {
            customerName: customerName,
            showingId: this.bookingDetails.showingId,
            seatIds: seatIds
        };

        console.log('Payload being sent:', JSON.stringify(orderPayload));

        // Send booking request
        fetch('http://localhost:8080/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Booking successful:', data);


                // Update booking details with seat IDs
                this.bookingDetails.seatIds = seatIds;

                // After confirmation, clear selected seats and reload the seat data
                clearSelectedSeats();

                // Fetch and display updated seat data (to reflect newly booked seats)
                window.tickets.fetchAndDisplaySeats();

                // Switch to the confirmation container
                switchContainer('confirmation-container');  // Now switch to confirmation container
                new Confirmation(this.bookingDetails);  // Show confirmation message
            })
            .catch(error => {
                console.error('Error booking tickets:', error);
            });

    }

    clearSelectedSeats() {
        // Clear the selectedSeats array
        let selectedSeats = [];

        // Find all seats with the 'selected' class and remove the class
        const selectedSeatElements = document.querySelectorAll('.seat.selected');
        selectedSeatElements.forEach(seat => {
            seat.classList.remove('selected');
        });
    }



}


// Ensure that we are calling the confirmBooking() method of the existing Tickets instance
document.getElementById('confirm-booking').addEventListener('click', () => {
    console.log('Trying to confirm booking. Current tickets instance:', window.tickets);
    if (window.tickets) {
        window.tickets.confirmBooking();  // Call confirmBooking on the existing instance
    } else {
        console.error('No tickets instance found');  // Error logging if no instance
    }
});

document.getElementById('back-to-frontpage-tickets').addEventListener('click', () => {
    clearSelectedSeats()
    window.tickets.fetchAndDisplaySeats();
    switchContainer('movies-container');
})



function switchContainer(containerId) {
    const currentVisible = document.querySelector('.container-visible');
    // Hide the current visible container
    if (currentVisible) {
        currentVisible.classList.remove('container-visible');
        currentVisible.classList.add('container');
    }

    // Show the new container
    const newContainer = document.getElementById(containerId);
    newContainer.classList.remove('container');
    newContainer.classList.add('container-visible');
}

function clearSelectedSeats() {
    // Clear the selectedSeats array
    let selectedSeats = [];

    // Find all seats with the 'selected' class and remove the class
    const selectedSeatElements = document.querySelectorAll('.seat.selected');
    selectedSeatElements.forEach(seat => {
        seat.classList.remove('selected');
    });
}