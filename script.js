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

  // Display a photo in the gallery
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

  // Load all existing photos on page load
  try {
    const snapshot = await getDocs(collectionRef);
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.url) {
        displayImage(data.url);
      }
    });
  } catch (err) {
    console.error("Error loading images:", err);
  }

  // Cloudinary widget
  const cloudName = 'dkwxhr5pr';
  const uploadPreset = 'talandadir';

  const myWidget = cloudinary.createUploadWidget(
    {
      cloudName,
      uploadPreset,
      sources: ['local', 'camera'],
      multiple: true,
      maxFiles: 10,
      maxFileSize: 10000000
    },
    async (error, result) => {
      if (!error && result) {
        if (result.event === "success") {
          const imageUrl = result.info.secure_url;
          displayImage(imageUrl);

          try {
            await addDoc(collectionRef, { url: imageUrl });
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
        console.error("Upload error:", error);
        errorMessage.textContent = "שגיאה בהעלאה. נסו שוב.";
      }
    }
  );

  uploadBtn.addEventListener('click', () => myWidget.open());

  uploadMoreBtn.addEventListener('click', () => {
    successSection.style.display = 'none';
    uploadSection.style.display = 'block';
    myWidget.open();
  });
});
