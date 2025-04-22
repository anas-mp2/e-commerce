const inputs = document.querySelectorAll('.otp');
const timerDisplay = document.getElementById('timer');
const resendButton = document.getElementById('resendButton');
let timeLeft = 180; // 3 minutes
let timerId;

// Function to start or restart the timer
function startTimer() {
    clearInterval(timerId);
    timeLeft = 180;
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerDisplay.textContent = "Code expired";
            resendButton.disabled = false;
            inputs.forEach(input => input.disabled = true);
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
        }
    }, 1000);
}

// Determine if this is forgot password page
const isForgotPassword = window.location.pathname.includes('forgot-password-otp');

document.addEventListener('DOMContentLoaded', () => {
    startTimer();

    resendButton.addEventListener('click', (event) => {
        event.preventDefault();
        resendOTP();
    });
});

function validateOTPForm() {
    const otp = Array.from(inputs).map(input => input.value).join('');

    fetch(isForgotPassword ? '/verify-forgot-password-otp' : '/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: "success",
                title: "OTP Verified successfully",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = data.redirectUrl || '/';
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Invalid OTP"
            });
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text: "Please try again"
        });
    });

    return false;
}

function resendOTP() {
    $.ajax({
        type: "POST",
        url: isForgotPassword ? '/resend-forgot-password-otp' : '/resend-otp',
        success: function(response) {
            console.log("Resend OTP response:", response);
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "OTP Resent",
                    text: response.message || "A new OTP has been sent to your device.",
                    timer: 1500
                });
                inputs.forEach(input => {
                    input.value = '';
                    input.disabled = false;
                });
                resendButton.disabled = true;
                startTimer();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message || "Failed to resend OTP."
                });
            }
        },
        error: function(xhr, status, error) {
            console.log("AJAX error:", status, error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred. Please try again."
            });
        }
    });
}
