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
        
        // Show loading state
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalBtnText = $submitBtn.text();
        $submitBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...')
            .prop('disabled', true);
        
        // Hide any previous error
        $('#errorMessage').hide();
        
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
                
                // Redirect to products page
                window.location.href = 'index.html';
            },
            error: function(xhr) {
                let errorMessage = 'Login failed. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                // Show error message
                $('#errorMessage')
                    .text(errorMessage)
                    .show();
                
                // Reset button
                $submitBtn.html(originalBtnText)
                    .prop('disabled', false);
            }
        });
    });
}); 