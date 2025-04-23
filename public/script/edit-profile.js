document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editProfileForm');
    const addAddressBtn = document.getElementById('addAddress');
    const addressesDiv = document.getElementById('addresses');
    let addressIndex = addressesDiv.children.length;

    // Add new address form
    addAddressBtn.addEventListener('click', () => {
        const addressForm = document.createElement('div');
        addressForm.className = 'address-form';
        addressForm.dataset.index = addressIndex;
        addressForm.innerHTML = `
            <div class="form-group">
                <label>Street:</label>
                <input type="text" name="addresses[${addressIndex}][street]" required>
            </div>
            <div class="form-group">
                <label>City:</label>
                <input type="text" name="addresses[${addressIndex}][city]" required>
            </div>
            <div class="form-group">
                <label>State:</label>
                <input type="text" name="addresses[${addressIndex}][state]" required>
            </div>
            <div class="form-group">
                <label>Zip:</label>
                <input type="text" name="addresses[${addressIndex}][zip]" required>
            </div>
            <div class="form-group">
                <label>Country:</label>
                <input type="text" name="addresses[${addressIndex}][country]" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="addresses[${addressIndex}][isDefault]">
                    Default Address
                </label>
            </div>
            <button type="button" class="remove-address btn">Remove</button>
        `;
        addressesDiv.appendChild(addressForm);
        addressIndex++;
    });

    // Remove address form
    addressesDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-address')) {
            e.target.parentElement.remove();
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('error');
        const successEl = document.getElementById('success');
        errorEl.textContent = '';
        successEl.textContent = '';

        const formData = new FormData(form);

        try {
            const response = await fetch('/edit-profile', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                if (data.emailChanged) {
                    successEl.textContent = 'Please verify your new email. OTP sent.';
                    // Redirect to OTP verification
                    setTimeout(() => {
                        window.location.href = '/verify-email-otp';
                    }, 2000);
                } else {
                    successEl.textContent = 'Profile updated successfully';
                    setTimeout(() => {
                        window.location.href = '/profile';
                    }, 2000);
                }
            } else {
                errorEl.textContent = data.message || 'Failed to update profile';
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            errorEl.textContent = 'An error occurred';
        }
    });
});