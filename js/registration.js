// File preview functionality
function previewFile(input) {
    const preview = input.id === 'idDocument' ? 
        document.getElementById('filePreview') : 
        document.getElementById('businessDocPreview');
    const file = input.files[0];
    preview.innerHTML = '';

    if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            input.value = '';
            return;
        }

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            const reader = new FileReader();
            
            reader.onload = function(e) {
                img.src = e.target.result;
            }
            
            reader.readAsDataURL(file);
            preview.appendChild(img);
        } else if (file.type === 'application/pdf') {
            const pdfPreview = document.createElement('div');
            pdfPreview.className = 'pdf-preview';
            pdfPreview.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>${file.name}</span>
            `;
            preview.appendChild(pdfPreview);
        }
    }
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(password)) strength += 1;
    
    // Contains lowercase letter
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase letter
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return {
        score: strength,
        feedback: getStrengthFeedback(strength)
    };
}

function getStrengthFeedback(strength) {
    switch (strength) {
        case 0:
        case 1:
            return {
                message: 'Very weak - Please use a stronger password',
                class: 'strength-weak'
            };
        case 2:
        case 3:
            return {
                message: 'Medium - Add more variety for a stronger password',
                class: 'strength-medium'
            };
        case 4:
        case 5:
            return {
                message: 'Strong password!',
                class: 'strength-strong'
            };
        default:
            return {
                message: 'Please enter a password',
                class: ''
            };
    }
}

// Add password strength indicator
document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    
    // Remove any existing strength indicator
    const existingIndicator = e.target.parentElement.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add new strength indicator
    if (password) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = `password-strength ${strength.feedback.class}`;
        strengthIndicator.textContent = strength.feedback.message;
        e.target.parentElement.appendChild(strengthIndicator);
    }
});

// Check password match
document.getElementById('confirmPassword').addEventListener('input', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = e.target.value;
    
    // Remove any existing match indicator
    const existingIndicator = e.target.parentElement.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add match indicator
    if (confirmPassword) {
        const matchIndicator = document.createElement('div');
        matchIndicator.className = 'password-strength';
        
        if (password === confirmPassword) {
            matchIndicator.textContent = 'Passwords match!';
            matchIndicator.classList.add('strength-strong');
        } else {
            matchIndicator.textContent = 'Passwords do not match';
            matchIndicator.classList.add('strength-weak');
        }
        
        e.target.parentElement.appendChild(matchIndicator);
    }
});

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registrationType = formData.get('type');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Password validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const strength = checkPasswordStrength(password);
    if (strength.score < 3) {
        if (!confirm('Your password is weak. Are you sure you want to continue?')) {
            return;
        }
    }
    
    // Basic validation
    const idDocument = formData.get('idDocument');
    if (!idDocument) {
        alert('Please upload your ID document');
        return;
    }

    if (registrationType === 'employer') {
        const businessDoc = formData.get('businessDoc');
        if (!businessDoc) {
            alert('Please upload your business registration document');
            return;
        }
    }

    try {
        // Convert files to base64 for storage
        const idDocBase64 = await fileToBase64(idDocument);
        let businessDocBase64 = null;
        if (registrationType === 'employer') {
            businessDocBase64 = await fileToBase64(formData.get('businessDoc'));
        }

        const registrationData = {
            id: Date.now(),
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            type: registrationType,
            status: 'pending',
            timestamp: new Date().toISOString(),
            idDocument: {
                name: idDocument.name,
                type: idDocument.type,
                data: idDocBase64
            }
        };

        if (businessDocBase64) {
            registrationData.businessDocument = {
                name: formData.get('businessDoc').name,
                type: formData.get('businessDoc').type,
                data: businessDocBase64
            };
        }

        // Store registration data
        pendingRegistrations.push(registrationData);
        
        // Send notification to admin
        await notifyAdmin(registrationData);
        
        // Send confirmation email to user
        await sendUserConfirmationEmail(registrationData);
        
        // Clear form and show success message
        event.target.reset();
        document.getElementById('filePreview').innerHTML = '';
        if (document.getElementById('businessDocPreview')) {
            document.getElementById('businessDocPreview').innerHTML = '';
        }
        
        alert('Registration submitted successfully! Please check your email for confirmation.');
        
        // Close registration modal
        document.getElementById('registrationModal').style.display = 'none';
        
        // Update admin dashboard if open
        updatePendingRegistrationsTable();
    } catch (error) {
        console.error('Registration error:', error);
        alert('There was an error processing your registration. Please try again.');
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Update pending registrations table in admin dashboard
function updatePendingRegistrationsTable() {
    const tableBody = document.getElementById('pendingRegistrations');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    pendingRegistrations.forEach(registration => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${registration.fullName}</td>
            <td>${registration.email}</td>
            <td>${registration.type}</td>
            <td>
                <button class="document-preview-btn" onclick="previewDocument('${registration.id}', 'id')">
                    View ID
                </button>
                ${registration.businessDocument ? `
                    <button class="document-preview-btn" onclick="previewDocument('${registration.id}', 'business')">
                        View Business Doc
                    </button>
                ` : ''}
            </td>
            <td>${new Date(registration.timestamp).toLocaleDateString()}</td>
            <td>
                <button onclick="handleRegistrationDecision(${registration.id}, true)" class="approve-btn">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button onclick="handleRegistrationDecision(${registration.id}, false)" class="reject-btn">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Preview document in modal
function previewDocument(registrationId, docType) {
    const registration = pendingRegistrations.find(reg => reg.id === parseInt(registrationId));
    if (!registration) return;

    const document = docType === 'id' ? registration.idDocument : registration.businessDocument;
    const modal = document.getElementById('documentPreviewModal');
    const container = document.getElementById('documentPreviewContainer');

    container.innerHTML = '';
    if (document.type.startsWith('image/')) {
        container.innerHTML = `<img src="${document.data}" alt="Document Preview">`;
    } else if (document.type === 'application/pdf') {
        container.innerHTML = `<embed src="${document.data}" type="application/pdf" width="100%" height="100%">`;
    }

    modal.style.display = 'block';
}

// Close document preview modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('documentPreviewModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
} 