document.addEventListener('DOMContentLoaded', function () {
    const error1 = document.getElementById('error1');
    const error2 = document.getElementById('error2');
    const forgotpasswordform = document.getElementById('forgotpasswordform');

    function showToast(message, isSuccess = true) {
        const toast = document.createElement('div');
        toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
                document.body.removeChild(toast);
            }, 3000);
        }, 10);
    }

    function passValidateChecking() {
        const password = document.getElementById('password').value.trim();
        const cpassword = document.getElementById('cpassword').value.trim();
        const alpha = /[A-Za-z]/;
        const digit = /\d/;
        let isValid = true;

        error1.style.display = "none";
        error1.innerHTML = "";
        error2.style.display = "none";
        error2.innerHTML = "";

        if (password.length < 8) {
            error1.style.display = "block";
            error1.innerHTML = "Password should contain at least 8 characters";
            isValid = false;
        } else if (!alpha.test(password) || !digit.test(password)) {
            error1.style.display = "block";
            error1.innerHTML = "Password should contain both letters and numbers";
            isValid = false;
        }

        if (cpassword.length < 8) {
            error2.style.display = "block";
            error2.innerHTML = "Confirm Password should contain at least 8 characters";
            isValid = false;
        } else if (!alpha.test(cpassword) || !digit.test(cpassword)) {
            error2.style.display = "block";
            error2.innerHTML = "Confirm Password should contain both letters and numbers";
            isValid = false;
        }

        if (password !== cpassword) {
            error2.style.display = "block";
            error2.innerHTML = "Passwords do not match";
            isValid = false;
        }

        return isValid;
    }

    forgotpasswordform.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!passValidateChecking()) {
            return;
        }

        try {
            const response = await fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: document.getElementById('password').value.trim(),
                    cpassword: document.getElementById('cpassword').value.trim(),
                }),
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                error1.style.display = 'none';
                error2.style.display = 'none';
                error1.innerHTML = '';
                error2.innerHTML = '';

                if (result.message) {
                    if (result.message.includes('User not found')) {
                        error1.style.display = 'block';
                        error1.innerHTML = result.message;
                    } else if (result.message.includes('Passwords do not match')) {
                        error2.style.display = 'block';
                        error2.innerHTML = result.message;
                    } else {
                        error1.style.display = 'block';
                        error1.innerHTML = result.message;
                    }
                } else {
                    error1.style.display = 'block';
                    error1.innerHTML = `Server error: ${response.status} ${response.statusText}`;
                }
                return;
            }

            const result = await response.json();
            if (result.success) {
                showToast('Password changed successfully!', true);
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                error1.style.display = 'block';
                error1.innerHTML = result.message || 'Unexpected error';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            error1.style.display = 'block';
            error1.innerHTML = 'Unable to connect to server. Please try again.';
            error2.style.display = 'none';
            error2.innerHTML = '';
        }
    });
});