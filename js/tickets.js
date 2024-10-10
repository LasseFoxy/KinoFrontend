import { Confirmation } from './confirmation.js';

export class Tickets {
    constructor(bookingDetails) {
        this.bookingDetails = bookingDetails;
        this.selectedSeats = [];
        this.fetchAndDisplaySeats();
    }

    fetchAndDisplaySeats() {
        const { theaterId, showingId } = this.bookingDetails;

        fetch(`https://kind-river-087a56c03.5.azurestaticapps.net/api/seat/theater/${theaterId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching seats: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                let seats;
                try {
                    seats = JSON.parse(text);
                } catch (e) {
                    throw new Error('Invalid JSON response');
                }

                fetch(`https://kind-river-087a56c03.5.azurestaticapps.net/api/order/showing/${showingId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        let orders;
                        try {
                            orders = JSON.parse(text);
                        } catch (e) {
                            throw new Error('Invalid JSON response');
                        }

                        this.processSeatData(seats, orders);
                    })
                    .catch(error => {});
            })
            .catch(error => {
                alert('Failed to load seat data. Please try again later.');
            });
    }

    processSeatData(seats, orders) {
        if (!Array.isArray(seats)) {
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
            return;
        }

        seatsContainer.innerHTML = '';

        function getSeatLetter(seatNumber) {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return alphabet[(seatNumber - 1) % 26];
        }

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

                const seatLetter = getSeatLetter(seat.seatNumber);
                seatDiv.innerText = `${seat.seatRow}${seatLetter}`;
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

    selectedSeats = [];
    handleSeatSelection(seatDiv) {
        const numTickets = parseInt(document.getElementById('num-tickets').value);
        const seatRow = seatDiv.dataset.seatRow;
        const seatNumber = parseInt(seatDiv.dataset.seatNumber);
        const allSeatsInRow = Array.from(document.querySelectorAll(`.seat[data-seat-row="${seatRow}"]`));

        document.querySelectorAll('.seat.selected').forEach(seat => seat.classList.remove('selected'));
        this.selectedSeats = [];

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
                const seatId = Number(seat.dataset.seatId);
                this.selectedSeats.push(seatId);
            });
        } else {
            alert('Not enough available seats next to the selected seat.');
        }
    }

    confirmBooking() {
        const customerName = document.getElementById('customer-name').value;
        const numTickets = parseInt(document.getElementById('num-tickets').value);

        if (this.selectedSeats.length !== numTickets) {
            alert(`Please select exactly ${numTickets} seats.`);
            return;
        }

        if (!customerName) {
            alert('Please enter your name.');
            return;
        }

        const seatIds = this.selectedSeats.map(seatId => Number(seatId));

        const orderPayload = {
            customerName: customerName,
            showingId: this.bookingDetails.showingId,
            seatIds: seatIds
        };

        fetch('https://kind-river-087a56c03.5.azurestaticapps.net/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        })
            .then(response => response.json())
            .then(data => {
                this.bookingDetails.seatIds = seatIds;
                clearSelectedSeats();
                window.tickets.fetchAndDisplaySeats();
                switchContainer('confirmation-container');
                new Confirmation(this.bookingDetails);
            })
            .catch(error => {});
    }

    clearSelectedSeats() {
        let selectedSeats = [];
        const selectedSeatElements = document.querySelectorAll('.seat.selected');
        selectedSeatElements.forEach(seat => {
            seat.classList.remove('selected');
        });
    }
}

document.getElementById('confirm-booking').addEventListener('click', () => {
    if (window.tickets) {
        window.tickets.confirmBooking();
    }
});

document.getElementById('back-to-frontpage-tickets').addEventListener('click', () => {
    clearSelectedSeats();
    window.tickets.fetchAndDisplaySeats();
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

function clearSelectedSeats() {
    let selectedSeats = [];
    const selectedSeatElements = document.querySelectorAll('.seat.selected');
    selectedSeatElements.forEach(seat => {
        seat.classList.remove('selected');
    });
}
