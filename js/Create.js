const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phoneNumber = document.getElementById('phone-number');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

form.addEventListener('submit', e => {
    e.preventDefault();

    if (checkInputs()) {
        // Call the API to create the user
        createUser();
    }
});

function checkInputs() {
    // trim to remove the whitespaces
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneNumberValue = phoneNumber.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();
    let isValid = true;

    if (usernameValue === '') {
        setErrorFor(username, 'Username cannot be blank');
        isValid = false;
    } else {
        setSuccessFor(username);
    }

    if (emailValue === '') {
        setErrorFor(email, 'Email cannot be blank');
        isValid = false;
    } else if (!isEmail(emailValue)) {
        setErrorFor(email, 'Not a valid email');
        isValid = false;
    } else {
        setSuccessFor(email);
    }

    if (phoneNumberValue === '') {
        setErrorFor(phoneNumber, 'Phone number cannot be blank');
        isValid = false;
    } else {
        setSuccessFor(phoneNumber);
    }

    if (passwordValue === '') {
        setErrorFor(password, 'Password cannot be blank');
        isValid = false;
    } else {
        setSuccessFor(password);
    }

    if (password2Value === '') {
        setErrorFor(password2, 'Password2 cannot be blank');
        isValid = false;
    } else if (passwordValue !== password2Value) {
        setErrorFor(password2, 'Passwords do not match');
        isValid = false;
    } else {
        setSuccessFor(password2);
    }

    return isValid;
}

function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

// Function to create a new user
function createUser() {
    const userData = {
        username: username.value.trim(),
        email: email.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
        password: password.value.trim(),
    };

    // Show loading indicator or disable the form
    form.classList.add('loading');

    fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net/api/users/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            // Check if response is JSON or plain text
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(data => {
            form.classList.remove('loading'); // Remove loading state

            if (typeof data === 'object') {
                console.log('User created successfully:', data);
                displaySuccessMessage('User created successfully!');
            } else {
                console.log('Response:', data);
                displayErrorMessage(data); // Display error from server
            }
            form.reset(); // Clear the form after successful submission
        })
        .catch(error => {
            console.error('Error:', error);
            form.classList.remove('loading'); // Remove loading state
            displayErrorMessage('An error occurred while creating the user.');
        });
}

function displaySuccessMessage(message) {
    const successElement = document.createElement('p');
    successElement.classList.add('success-message');
    successElement.textContent = message;
    form.appendChild(successElement);
    setTimeout(() => {
        successElement.remove();
    }, 3000); // Remove the message after 3 seconds
}

function displayErrorMessage(message) {
    const errorElement = document.createElement('p');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    form.appendChild(errorElement);
    setTimeout(() => {
        errorElement.remove();
    }, 3000); // Remove the message after 3 seconds
}

const floating_btn = document.querySelector('.floating-btn');
const close_btn = document.querySelector('.close-btn');
const social_panel_container = document.querySelector('.social-panel-container');

floating_btn.addEventListener('click', () => {
    social_panel_container.classList.toggle('visible');
});

close_btn.addEventListener('click', () => {
    social_panel_container.classList.remove('visible');
});