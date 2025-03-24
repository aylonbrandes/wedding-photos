document.addEventListener('DOMContentLoaded', async function () {
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadSection = document.getElementById('uploadSection');
  const successSection = document.getElementById('successSection');
  const uploadMoreBtn = document.getElementById('uploadMoreBtn');
  const errorMessage = document.getElementById('errorMessage');
  const gallery = document.getElementById('gallery');

  // Firebase references
  const db = window.firebaseDB;
  const collectionRef = window.firebaseCollection(db, "photos");
  const addDoc = window.firebaseAddDoc;
  const getDocs = window.firebaseGetDocs;

  // Function to display an image in the gallery
  function displayImage(url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Gallery Image';
    img.style.maxWidth = '200px';
    img.style.borderRadius = '10px';
    img.style.margin = '5px';
    img.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    gallery.appendChild(img);
  }

  // 🔁 Load all saved images on page load
  try {
    const snapshot = await getDocs(collectionRef);
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.url && typeof data.url === "string") {
        displayImage(data.url);
      }
    });
  } catch (err) {
    console.error("❌ Error loading images from Firebase:", err);
  }

  // ☁️ Cloudinary Upload Widget
  const cloudName = 'dkwxhr5pr';
  const uploadPreset = 'talandadir';

  const myWidget = cloudinary.createUploadWidget(
    {
      cloudName,
      uploadPreset,
      sources: ['local', 'camera'],
      multiple: true,
      maxFiles: 10,
      maxFileSize: 10000000 // 10MB
    },
    async (error, result) => {
      if (!error && result) {
        if (result.event === "success" && result.info && result.info.secure_url) {
          const imageUrl = result.info.secure_url;
          console.log("✅ Upload success, URL:", imageUrl);

          // Validate the URL
          if (imageUrl.startsWith("https://res.cloudinary.com/")) {
            displayImage(imageUrl);

            try {
              await addDoc(collectionRef, { url: imageUrl });
              console.log("✅ Saved to Firebase");
            } catch (err) {
              console.error("❌ Failed to save to Firebase:", err);
            }
          } else {
            console.warn("⚠️ Invalid image URL:", imageUrl);
          }
        }

        if (result.event === "queues-end") {
          uploadSection.style.display = 'none';
          successSection.style.display = 'block';
        }
      }

      if (error) {
        console.error("❌ Upload error:", error);
        errorMessage.textContent = "שגיאה בהעלאה. נסו שוב.";
      }
    }
  );

  // Upload button opens the widget
  uploadBtn.addEventListener('click', () => myWidget.open());

  // Upload more button
  uploadMoreBtn.addEventListener('click', () => {
    successSection.style.display = 'none';
    uploadSection.style.display = 'block';
    myWidget.open();
  });
});

