document.addEventListener('DOMContentLoaded', async function () {
    // Elements
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadSection = document.getElementById('uploadSection');
    const successSection = document.getElementById('successSection');
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    const errorMessage = document.getElementById('errorMessage');
    const uploadedImagesContainer = document.getElementById('uploadedImages');

    // Firebase references
    const db = window.firebaseDB;
    const collectionRef = window.firebaseCollection(db, "photos");
    const addDoc = window.firebaseAddDoc;
    const getDocs = window.firebaseGetDocs;

    // Function to display an image
    function displayImage(url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Uploaded Image';
        img.style.maxWidth = '200px';
        img.style.borderRadius = '10px';
        img.style.margin = '5px';
        img.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
        uploadedImagesContainer.appendChild(img);
    }

    // 🔁 Load saved images on page load
    try {
        const snapshot = await getDocs(collectionRef);
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.url) {
                displayImage(data.url);
            }
        });
    } catch (err) {
        console.error("Error loading images from Firebase:", err);
    }

    // Cloudinary widget setup
    const cloudName = 'dkwxhr5pr';
    const uploadPreset = 'talandadir';

    const myWidget = cloudinary.createUploadWidget(
        {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            sources: ['local', 'camera'],
            multiple: true,
            maxFiles: 10,
            maxFileSize: 10000000 // 10MB
        },
        async (error, result) => {
            if (!error && result) {
                if (result.event === "success") {
                    const imageUrl = result.info.secure_url;
                    console.log("Uploaded to Cloudinary:", imageUrl);

                    // Display the image
                    displayImage(imageUrl);

                    // Save to Firebase
                    try {
                        await addDoc(collectionRef, { url: imageUrl });
                        console.log("Saved to Firebase");
                    } catch (err) {
                        console.error("Failed to save to Firebase:", err);
                    }
                }

                if (result.event === "queues-end") {
                    uploadSection.style.display = 'none';
                    successSection.style.display = 'block';
                }
            }

            if (error) {
                console.error('Upload error:', error);
                errorMessage.textContent = 'שגיאה בהעלאת תמונה. נסו שוב.';
            }
        }
    );

    // Button events
    uploadBtn.addEventListener('click', function () {
        myWidget.open();
    });

    uploadMoreBtn.addEventListener('click', function () {
        successSection.style.display = 'none';
        uploadSection.style.display = 'block';
        myWidget.open();
    });
});
