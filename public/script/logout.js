document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    // Create toast dynamically if not present
                    let toast = document.getElementById('toast');
                    if (!toast) {
                        toast = document.createElement('div');
                        toast.id = 'toast';
                        toast.className = 'toast';
                        document.body.appendChild(toast);
                    }
                    toast.textContent = 'Logged out successfully!';
                    toast.className = 'toast success';
                    toast.style.display = 'block';
                    setTimeout(() => {
                        toast.style.display = 'none';
                        window.location.href = '/';
                    }, 2000); // Redirect after 2 seconds
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Unable to connect to server. Please try again.');
            }
        });
    }
});