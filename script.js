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
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop();
    
      const file = new File([blob], fileName, { type: blob.type });
    
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'תמונה מהאירוע של טל ואדיר 💍',
            text: 'תראו איזו תמונה יפה!',
            files: [file]
          });
        } catch (err) {
          console.error('Sharing failed:', err);
        }
      } else {
        // Fallback: force download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
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



/// gallery view section
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const closeBtn = document.querySelector('.close-btn');
const downloadBtn = document.getElementById('download-btn');

let galleryItems = [];
let currentIndex = 0;

gallery.addEventListener('click', (e) => {
  const clicked = e.target;
  if (clicked.tagName !== 'IMG' && clicked.tagName !== 'VIDEO') return;

  galleryItems = Array.from(document.querySelectorAll('#gallery img, #gallery video'));
  const index = galleryItems.indexOf(clicked);
  if (index !== -1) showMedia(index);
});

function showMedia(index) {
  const item = galleryItems[index];
  if (!item) return;

  const src = item.src || item.querySelector('source')?.src;
  const isVideo = item.tagName.toLowerCase() === 'video';

  lightboxImg.style.display = isVideo ? 'none' : 'block';
  lightboxVideo.style.display = isVideo ? 'block' : 'none';

  if (isVideo) {
    lightboxVideo.src = src;
    lightboxVideo.load();
  } else {
    lightboxImg.src = src;
  }

  downloadBtn.href = src;
  downloadBtn.setAttribute('download', src.split('/').pop());
  currentIndex = index;
  lightbox.classList.remove('hidden');
}

prevBtn.addEventListener('click', () => {
  const newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  showMedia(newIndex);
});

nextBtn.addEventListener('click', () => {
  const newIndex = (currentIndex + 1) % galleryItems.length;
  showMedia(newIndex);
});

closeBtn.addEventListener('click', () => {
  lightbox.classList.add('hidden');
  lightboxVideo.pause();
});

downloadBtn.addEventListener('click', (e) => {
  e.preventDefault();

  fetch(downloadBtn.href)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = downloadBtn.getAttribute('download') || 'image.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error('Download failed:', err);
      alert('ההורדה נכשלה 😢');
    });
});
