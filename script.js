document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadSection = document.getElementById('uploadSection');
    const successSection = document.getElementById('successSection');
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    const errorMessage = document.getElementById('errorMessage');

    // ✅ New: container for displaying uploaded images
    const uploadedImagesContainer = document.getElementById('uploadedImages');

    // Cloudinary configuration
    const cloudName = 'dkwxhr5pr';
    const uploadPreset = 'talandadir';

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

                // ✅ Create and display the uploaded image
                const img = document.createElement('img');
                img.src = result.info.secure_url;
                img.alt = 'Uploaded Image';
                img.style.maxWidth = '200px';
                img.style.borderRadius = '10px';
                img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                img.style.margin = '5px';

                uploadedImagesContainer.appendChild(img);

                // ✅ Show success section
                uploadSection.style.display = 'none';
                successSection.style.display = 'block';
            }

            if (error) {
                console.error('Upload error:', error);
                errorMessage.textContent = 'There was an error uploading your photos. Please try again.';
            }
        }
    );

    // Open the Cloudinary widget on upload button click
    uploadBtn.addEventListener('click', function () {
        myWidget.open();
    });

    // Re-open upload on "Upload more" button click
    uploadMoreBtn.addEventListener('click', function () {
        successSection.style.display = 'none';
        uploadSection.style.display = 'block';
        myWidget.open();
    });
});
