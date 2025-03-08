document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadSection = document.getElementById('uploadSection');
    const successSection = document.getElementById('successSection');
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Cloudinary configuration
    const cloudName = 'dx1x5vao3';
    const uploadPreset = 'weddingphotos';

    // Initialize Cloudinary Upload Widget
    const myWidget = cloudinary.createUploadWidget(
        {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            sources: ['local', 'camera'],
            multiple: true,
            maxFiles: 10,
            maxFileSize: 10000000, // 10MB
            styles: {
                palette: {
                    window: "#FFFFFF",
                    windowBorder: "#90A0B3",
                    tabIcon: "#ec4899",
                    menuIcons: "#5A616A",
                    textDark: "#1f2937",
                    textLight: "#FFFFFF",
                    link: "#ec4899",
                    action: "#ec4899",
                    inactiveTabIcon: "#6b7280",
                    error: "#ef4444",
                    inProgress: "#0096C7",
                    complete: "#10b981",
                    sourceBg: "#F4F6F8"
                }
            }
        },
        (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Upload successful:', result.info);
                
                // Show success message
                uploadSection.style.display = 'none';
                successSection.style.display = 'block';
            }
            
            if (error) {
                console.error('Upload error:', error);
                errorMessage.textContent = 'There was an error uploading your photos. Please try again.';
            }
        }
    );

    // Upload button click
    uploadBtn.addEventListener('click', function() {
        // Open the Cloudinary Upload Widget
        myWidget.open();
    });

    // Upload more button
    uploadMoreBtn.addEventListener('click', function() {
        successSection.style.display = 'none';
        uploadSection.style.display = 'block';
        // Open the widget again
        myWidget.open();
    });
});