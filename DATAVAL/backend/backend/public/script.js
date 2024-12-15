document.getElementById('profileImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileSize = file.size / 1024; // size in KB
    const allowedExtensions = ['jpeg', 'jpg'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        alert('Only JPEG format is allowed.');
        event.target.value = ''; // Clear the file input
    } else if (fileSize < 5 || fileSize > 50) {
        alert('File size must be between 5KB and 50KB.');
        event.target.value = ''; // Clear the file input
    }
});

document.getElementById('studentForm').addEventListener('submit', function(event) {
    alert('Form Submitted Successfully!');
});
