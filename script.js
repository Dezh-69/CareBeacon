document.addEventListener('DOMContentLoaded', () => {
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const loginForm = document.getElementById('login-form');
    const submitBtn = loginForm.querySelector('.submit-btn');

    tabSignin.addEventListener('click', () => {
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
        submitBtn.textContent = 'Access Dashboard';
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
        submitBtn.textContent = 'Create Account';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In demo mode, just show an alert
        alert('Demo Mode: Logging in...');
    });
});
