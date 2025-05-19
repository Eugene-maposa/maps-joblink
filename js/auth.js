// Store logged in user data
let currentUser = null;

// Handle user login
async function handleUserLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    try {
        // Here you would typically make an API call to your backend
        // For now, we'll simulate authentication
        const user = await loginUser(email, password);
        
        if (user) {
            currentUser = user;
            document.getElementById('userLoginModal').style.display = 'none';
            
            // Show appropriate dashboard based on user type
            if (user.type === 'employer') {
                document.getElementById('employerDashboard').style.display = 'block';
                updateEmployerDashboard(user);
            } else {
                document.getElementById('jobSeekerDashboard').style.display = 'block';
                updateJobSeekerDashboard(user);
            }

            // Update UI with user info
            updateUserInterface(user);
        } else {
            showError('Invalid email or password');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
        console.error('Login error:', error);
    }
}

// Simulate user login (replace with actual API call)
async function loginUser(email, password) {
    // This is a mock implementation. Replace with actual API call
    const mockUsers = {
        'employer@example.com': {
            id: '1',
            name: 'John Doe',
            email: 'employer@example.com',
            type: 'employer',
            company: 'Tech Corp'
        },
        'jobseeker@example.com': {
            id: '2',
            name: 'Jane Smith',
            email: 'jobseeker@example.com',
            type: 'jobseeker',
            skills: ['JavaScript', 'React', 'Node.js']
        }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockUsers[email] || null;
}

// Handle user logout
function logoutUser() {
    currentUser = null;
    
    // Hide dashboards
    document.getElementById('employerDashboard').style.display = 'none';
    document.getElementById('jobSeekerDashboard').style.display = 'none';
    
    // Show home section
    document.getElementById('home').style.display = 'block';
    
    // Clear any stored data
    localStorage.removeItem('currentUser');
}

// Show/hide login modal
function showUserLogin() {
    document.getElementById('userLoginModal').style.display = 'block';
}

function closeUserLogin() {
    document.getElementById('userLoginModal').style.display = 'none';
}

// Update UI after login
function updateUserInterface(user) {
    // Update user name display
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = `Welcome, ${user.name}`;
    });

    // Store user data
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('userLoginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Check if user is already logged in
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.type === 'employer') {
            document.getElementById('employerDashboard').style.display = 'block';
            updateEmployerDashboard(currentUser);
        } else {
            document.getElementById('jobSeekerDashboard').style.display = 'block';
            updateJobSeekerDashboard(currentUser);
        }
        updateUserInterface(currentUser);
    }
}

// Update employer dashboard
function updateEmployerDashboard(user) {
    // Load employer's job posts
    loadEmployerJobs(user.id);
    // Load pending applications
    loadPendingApplications(user.id);
}

// Update job seeker dashboard
function updateJobSeekerDashboard(user) {
    // Load job seeker's applications
    loadUserApplications(user.id);
    // Load saved jobs
    loadSavedJobs(user.id);
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == document.getElementById('userLoginModal')) {
            closeUserLogin();
        }
    };
}); 