document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verifyEmailOtpForm');
    const resendBtn = document.getElementById('resendOtp');
    const errorEl = document.getElementById('error');
    const successEl = document.getElementById('success');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        successEl.textContent = '';

        const otp = document.getElementById('otp').value;

        try {
            const response = await fetch('/verify-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp })
            });
            const data = await response.json();
            if (data.success) {
                successEl.textContent = 'Email verified successfully';
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 2000);
            } else {
                errorEl.textContent = data.message || 'Invalid OTP';
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            errorEl.textContent = 'An error occurred';
        }
    });

    resendBtn.addEventListener('click', async () => {
        errorEl.textContent = '';
        successEl.textContent = '';

        try {
            const response = await fetch('/resend-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                successEl.textContent = 'OTP resent successfully';
            } else {
                errorEl.textContent = data.message || 'Failed to resend OTP';
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            errorEl.textContent = 'An error occurred';
        }
    });
});