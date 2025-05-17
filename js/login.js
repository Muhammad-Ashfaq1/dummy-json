$(document).ready(function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'index.html';
    }

    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        
        // Show loading state with SweetAlert2
        Swal.fire({
            title: 'Logging in...',
            text: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Make login request
        $.ajax({
            url: 'https://dummyjson.com/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password,
                expiresInMins: 30
            }),
            success: function(response) {
                // Store token and user info
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response));
                
                // Set token expiration
                const expirationTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes
                localStorage.setItem('tokenExpiration', expirationTime);
                
                // Show success message and redirect
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Login successful',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'index.html';
                });
            },
            error: function(xhr) {
                let errorMessage = 'Login failed. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                // Show error message with SweetAlert2
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: errorMessage,
                    confirmButtonColor: '#3085d6'
                });
            }
        });
    });
}); 