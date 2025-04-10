document.addEventListener('DOMContentLoaded', async function () {
  const fileInput = document.getElementById("fileInput");
  const customUploadBtn = document.getElementById("customUploadBtn");
  const previewContainer = document.getElementById("previewContainer");
  const sendBtn = document.getElementById("sendBtn");
  const gallery = document.getElementById('gallery');

  const db = window.firebaseDB;
  const collection = window.firebaseCollection(db, "photos");
  const addDoc = window.firebaseAddDoc;
  const getDocs = window.firebaseGetDocs;

  const cloudName = 'dkwxhr5pr';
  const uploadPreset = 'talandadir';

  let selectedFiles = [];
  let galleryItems = [];
  let currentIndex = 0;

  try {
    const snapshot = await getDocs(collection);
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.url) {
        displayMedia(data.url, data.type || "image");
      }
    });
  } catch (err) {
    console.error("Error loading gallery:", err);
  }

  function displayMedia(url, type) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    let media;
    if (type === 'video') {
      media = document.createElement('video');
      media.src = url;
      media.controls = true;
      media.style.maxWidth = "100%";
      media.style.borderRadius = "12px";
    } else {
      media = document.createElement('img');
      media.src = url;
      media.alt = 'Uploaded Photo';
      media.style.width = '100%';
      media.style.borderRadius = '12px';
      media.style.objectFit = 'cover';
    }

    media.addEventListener('click', () => {
      galleryItems = Array.from(document.querySelectorAll('#gallery img, #gallery video'));
      const index = galleryItems.indexOf(media);
      if (index !== -1) showMedia(index);
    });

    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '📤';
    shareBtn.title = 'שתף';
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
            title: 'תמונה מהאירוע 💍',
            text: 'תראו איזו תמונה יפה!',
            files: [file]
          });
        } catch (err) {
          console.error('Sharing failed:', err);
        }
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      }
    };

    container.appendChild(media);
    container.appendChild(shareBtn);
    gallery.appendChild(container);
  }

  customUploadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files);
    selectedFiles = [...selectedFiles, ...files];
    renderPreviews();
  });

  function renderPreviews() {
    previewContainer.innerHTML = "";
  
    selectedFiles.forEach((file, index) => {
      const fileURL = URL.createObjectURL(file);
  
      const item = document.createElement("div");
      item.classList.add("preview-item");
  
      let media;
      if (file.type.startsWith("video")) {
        media = document.createElement("video");
        media.src = fileURL;
        media.controls = true;
        media.muted = true;
      } else {
        media = document.createElement("img");
        media.src = fileURL;
        media.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }
  
      const removeBtn = document.createElement("button");
      removeBtn.innerText = "×";
      removeBtn.classList.add("remove-btn");
      removeBtn.onclick = () => {
        selectedFiles.splice(index, 1);
        renderPreviews();
      };
  
      item.appendChild(media);
      item.appendChild(removeBtn);
      previewContainer.appendChild(item);
    });
  
    sendBtn.style.display = selectedFiles.length > 0 ? "inline-block" : "none";
  }
  

  sendBtn.addEventListener("click", async () => {
    if (!selectedFiles.length) return;
  
    document.getElementById("loadingBanner").classList.remove("hidden");
  
    let uploadSuccess = false;
  
    await Promise.all(
      selectedFiles.map(async (file) => {
        if (file.size > 15 * 1024 * 1024) {
          alert("⚠️ הקובץ שאתה מנסה להעלות גדול מידי (מעל 15MB)");
          return;
        }
  
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("cloud_name", cloudName);
  
        const uploadUrl = file.type.startsWith("video")
          ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
          : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
        try {
          const res = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
          });
  
          const data = await res.json();
  
          if (data.secure_url) {
            await addDoc(collection, {
              url: data.secure_url,
              type: file.type.startsWith("video") ? "video" : "image",
              createdAt: new Date(),
            });
  
            displayMedia(data.secure_url, file.type.startsWith("video") ? "video" : "image");
            uploadSuccess = true;
          }
        } catch (err) {
          console.error("Upload error:", err);
          alert("העלאה נכשלה עבור אחד הקבצים.");
        }
      })
    );
  
    document.getElementById("loadingBanner").classList.add("hidden");
  
    selectedFiles = [];
    previewContainer.innerHTML = "";
    sendBtn.style.display = "none";
  
    if (uploadSuccess) {
      alert("הקבצים הועלו בהצלחה!");
    }
  });


  // lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const closeBtn = document.querySelector('.close-btn');
  const downloadBtn = document.getElementById('download-btn');

  function showMedia(index) {
    galleryItems = Array.from(document.querySelectorAll('#gallery img, #gallery video'));
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
        a.download = downloadBtn.getAttribute('download') || 'media';
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
});

