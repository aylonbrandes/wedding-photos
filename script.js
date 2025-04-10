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

  // Function to create and show image + share button
  function displayImage(url) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Uploaded Photo';
    img.style.width = '100%';
    img.style.borderRadius = '12px';
    img.style.objectFit = 'cover';

    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '📤';
    shareBtn.title = 'שתף את התמונה';
    shareBtn.style.marginTop = '5px';
    shareBtn.style.fontSize = '1.2rem';
    shareBtn.style.border = 'none';
    shareBtn.style.background = 'none';
    shareBtn.style.cursor = 'pointer';

    shareBtn.onclick = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'תמונה מהאירוע של טל ואדיר 💍',
            text: 'תראו איזו תמונה יפה!',
            url: url
          });
        } catch (err) {
          console.error('Sharing failed:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          alert("📋 הקישור לתמונה הועתק");
        } catch (err) {
          alert("לא ניתן להעתיק את הקישור");
        }
      }
    };

    container.appendChild(img);
    container.appendChild(shareBtn);
    gallery.appendChild(container);
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
      maxFileSize: 15000000
    },
    async (error, result) => {
      if (!error && result && result.event === "success") {
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

