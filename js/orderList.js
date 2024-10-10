class OrdersManager {

    constructor() {
        this.orders = [];
        this.isExtended = false;  // A flag to track if we are showing extended orders or not
        console.log("OrdersManager constructor called"); // Log when constructor is called
        this.initSearch();
    }

    // Set whether to load 7-day or extended orders based on the button clicked
    setExtended(isExtended) {
        this.isExtended = isExtended;  // true for extended orders, false for 7-day upcoming orders
        this.displayOrders();  // Re-display the orders based on this flag
        this.fetchAllOrders();
    }

    // Fetch all orders from the API
    fetchAllOrders() {
        console.log("Fetching all orders from API..."); // Log API fetch start
        fetch('https://kind-river-087a56c03.5.azurestaticapps.net/api/order')
            .then(response => {
                console.log(`API response received. Status: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    console.log("Raw API response text:", text);  // Log the raw response for debugging

                    const parsedData = JSON.parse(text);  // Try to parse the JSON
                    console.log("Parsed JSON data:", parsedData);  // Log parsed data for debugging

                    // Check if the parsed data is an array
                    if (!Array.isArray(parsedData)) {
                        throw new Error('Parsed data is not an array');
                    }

                    this.orders = parsedData;
                    console.log("Orders fetched successfully:", this.orders);  // Log orders data
                    this.displayOrders();  // Display orders after fetching
                } catch (e) {
                    console.error('Error parsing JSON:', e.message);  // Log parsing error
                    throw new Error('Invalid JSON response');
                }
            })
            .catch(error => {
                console.error('Error fetching orders:', error.message);  // Log fetch error
            });
    }

    // Initialize search functionality
    initSearch() {
        const searchInput = document.getElementById("search-name");
        // Use input event for real-time search filtering
        searchInput.addEventListener("input", (e) => {
            const query = searchInput.value.trim().toLowerCase();
            this.displayOrders(query);  // Pass the search query to displayOrders function
        });
    }

    // Display orders based on whether it's 7-day or extended
    displayOrders(searchQuery = '') {
        console.log("Displaying orders...");

        const ordersDiv = document.getElementById("order-list-div");
        const paragraph = ordersDiv.querySelector('p');
        paragraph.innerHTML = '';  // Clear any existing content

        // Helper function to format date as 'dd/mm'
        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are 0-based
            return `${day}/${month}`;
        }

        // Helper function to format time as 'HH:MM'
        function formatTime(timeString) {
            return timeString ? timeString.slice(0, 5) : 'Unknown';  // Provide fallback for null
        }

        // Helper function to clear time component from a date
        function stripTime(date) {
            const stripped = new Date(date);
            stripped.setHours(0, 0, 0, 0);  // Reset hours, minutes, seconds, and milliseconds
            return stripped;
        }

        // Get current date, startDate, and endDate based on the type of orders we want
        const today = stripTime(new Date());
        let startDate, endDate;

        if (this.isExtended) {
            // Extended orders: 14 days back to 3 months ahead
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 14);  // 14 days back
            endDate = new Date(today);
            endDate.setMonth(today.getMonth() + 3);  // 3 months ahead
        } else {
            // 7-day upcoming orders
            startDate = today;
            endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);  // 7 days ahead
        }

        // Check if there are any orders
        if (this.orders.length > 0) {
            console.log("Orders found. Populating the list...");

            const list = document.createElement('ul');  // Create a <ul> element

            // Filter orders based on the date range (7-day or extended)
            let filteredOrders = this.orders.filter(order => {
                const showingDate = stripTime(new Date(order.showing?.date));  // Strip time from showing date
                return showingDate >= startDate && showingDate <= endDate;
            });

            // Filter by customer name (if search query is provided)
            if (searchQuery) {
                filteredOrders = filteredOrders.filter(order => {
                    return order.customerName.toLowerCase().includes(searchQuery);  // Case-insensitive search
                });
            }

            // Sort filtered orders by showing date and then by showing time
            filteredOrders = filteredOrders.sort((a, b) => {
                const dateA = new Date(a.showing?.date);
                const dateB = new Date(b.showing?.date);

                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;

                // If dates are the same, compare times
                const timeA = a.showing?.startTime || '00:00:00';  // Default to midnight if no time is present
                const timeB = b.showing?.startTime || '00:00:00';

                return timeA.localeCompare(timeB);  // Compare times lexicographically
            });

            // After populating the orders
            if (filteredOrders.length > 0) {
                console.log("Orders found. Populating the list...");

                const list = document.createElement('ul');  // Create a <ul> element

                // Filter orders based on the date range (7-day or extended)
                let filteredOrders = this.orders.filter(order => {
                    const showingDate = stripTime(new Date(order.showing?.date));  // Strip time from showing date
                    return showingDate >= startDate && showingDate <= endDate;
                });

                // Filter by customer name (if search query is provided)
                if (searchQuery) {
                    filteredOrders = filteredOrders.filter(order => {
                        return order.customerName.toLowerCase().includes(searchQuery);  // Case-insensitive search
                    });
                }

                // Sort filtered orders by showing date and then by showing time
                filteredOrders = filteredOrders.sort((a, b) => {
                    const dateA = new Date(a.showing?.date);
                    const dateB = new Date(b.showing?.date);

                    if (dateA < dateB) return -1;
                    if (dateA > dateB) return 1;

                    // If dates are the same, compare times
                    const timeA = a.showing?.startTime || '00:00:00';  // Default to midnight if no time is present
                    const timeB = b.showing?.startTime || '00:00:00';

                    return timeA.localeCompare(timeB);  // Compare times lexicographically
                });

                if (filteredOrders.length === 0) {
                    paragraph.innerHTML = 'No orders found for the given date range or search query.';
                    return;
                }

                // Display the orders
                filteredOrders.forEach(order => {
                    const listItem = document.createElement('li');
                    listItem.style.color = 'black';

                    const formattedSeats = order.tickets.map(ticket => {
                        return this.formatSeatName(ticket.seat);
                    }).join(', ');

                    const showing = order.showing;
                    const showingTime = showing ? formatTime(showing.startTime) : 'Unknown';
                    const showingDate = showing ? formatDate(showing.date) : 'Unknown';
                    const theaterName = showing?.theater?.name || 'Unknown';

                    const bookingDate = formatDate(order.orderTime);

                    // Use innerHTML to add line breaks
                    listItem.innerHTML = `Navn på Ordren: ${order.customerName}<br>
                              Sæder: ${formattedSeats}<br>
                              Klokken: ${showingTime} den ${showingDate}<br>
                              i sal: ${theaterName}<br>
                              Booket den: ${bookingDate}`;

                    list.appendChild(listItem);
                });

                paragraph.appendChild(list);
                console.log("Orders displayed successfully.");

                // Scroll the order list container to the top after populating content
                const scrollableContent = document.getElementById("order-list-div");
                scrollableContent.scrollTop = 0;  // Reset scrollbar to the top
            } else {
                console.log("No orders found.");
                paragraph.textContent = 'No orders found.';
            }
        }
    }

    // Format seat name (e.g., A1, B3)
    formatSeatName(seat) {
        const seatLetter = this.getSeatLetter(seat.seatNumber);
        return `${seat.seatRow}${seatLetter}`;
    }

    // Get seat letter from seat number
    getSeatLetter(seatNumber) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return alphabet[(seatNumber - 1) % 26];
    }
}

// Open the modal
function openOrderList() {
    document.getElementById("order-list-overlay-modal").style.display = "block";
    document.getElementById("order-list-modal").style.display = "block";
}

// Close the modal
// Function to close the modal and reset the search input field
function closeOrdersListModal() {
    // Close the modal
    document.getElementById("order-list-overlay-modal").style.display = "none";
    document.getElementById("order-list-modal").style.display = "none";

    // Clear the search field
    const searchInput = document.getElementById("search-name");
    searchInput.value = '';  // Clear the input field
    searchInput.placeholder = 'Indtast Kundenavn';  // Reset placeholder if needed
}


// Initialize the OrdersManager when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded. Initializing OrdersManager...");
    const ordersManager = new OrdersManager();

    // Event listener for 7-day upcoming orders button
    document.getElementById("show-orders-button").addEventListener("click", function() {
        console.log("Show orders button clicked.");
        ordersManager.setExtended(false);  // Set to 7-day orders
        openOrderList();  // Open modal
    });

    // Event listener for extended orders button
    document.getElementById("show-extended-orders-button").addEventListener("click", function() {
        console.log("Show extended orders button clicked.");
        ordersManager.setExtended(true);  // Set to extended orders
        openOrderList();  // Open modal
    });

    // Add event listener to close button
    // Add event listener to both close buttons by targeting the class
    document.querySelectorAll(".close-orders-list-button").forEach(button => {
        button.addEventListener("click", function() {
            closeOrdersListModal();  // Close modal and reset search field
        });
    });

});
