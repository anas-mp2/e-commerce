const emailid = document.getElementById('email');
const passwordid = document.getElementById('password');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const loginform = document.getElementById('loginform');

function emailValidateChecking() {
    const emailval = emailid.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailval)) {
        error1.style.display = "block";
        error1.innerHTML = "Invalid email format";
        return false;
    } else {
        error1.style.display = "none";
        error1.innerHTML = "";
        return true;
    }
}

function passValidateChecking() {
    const passval = passwordid.value.trim();
    if (passval.length < 8) {
        error2.style.display = "block";
        error2.innerHTML = "Password should contain at least 8 characters";
        return false;
    } else {
        error2.style.display = "none";
        error2.innerHTML = "";
        return true;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    // Check session status on page load
    try {
        const response = await fetch('/check-session', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        if (result.isAuthenticated) {
            console.log('User is authenticated, redirecting to /products');
            window.location.href = '/products';
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }

    loginform.addEventListener("submit", async function (e) {
        e.preventDefault();
        const isEmailValid = emailValidateChecking();
        const isPasswordValid = passValidateChecking();
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailid.value.trim(),
                    password: passwordid.value.trim(),
                }),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                error1.style.display = "none";
                error2.style.display = "none";
                error1.innerHTML = "";
                error2.innerHTML = "";
                if (result.message) {
                    if (result.message.includes('User not found') || result.message.includes('blocked')) {
                        error1.style.display = "block";
                        error1.innerHTML = result.message;
                    } else if (result.message.includes('Password')) {
                        error2.style.display = "block";
                        error2.innerHTML = result.message;
                    } else {
                        error1.style.display = "block";
                        error1.innerHTML = result.message;
                    }
                } else {
                    error1.style.display = "block";
                    error1.innerHTML = `Server error: ${response.status} ${response.statusText}`;
                }
                return;
            }
            const result = await response.json();
            if (result.success) {
                window.location.href = '/products';
            } else {
                error1.style.display = "block";
                error1.innerHTML = result.message || 'Unexpected error';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            error1.style.display = "block";
            error1.innerHTML = 'Unable to connect to server. Please try again.';
            error2.style.display = "none";
            error2.innerHTML = "";
        }
    });
});

// Preserve Google Auth handler
document.getElementById("googleAuthBtn")?.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/auth/google";
});