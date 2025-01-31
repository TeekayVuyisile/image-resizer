function resizeImages() {
    const output = document.getElementById("output");
    output.innerHTML = "";  // Clear previous images
  
    const width = parseInt(document.getElementById("width").value);
    const height = parseInt(document.getElementById("height").value);
    const files = document.getElementById("imageUpload").files;
  
    if (!width || !height) {
      alert("Please enter both width and height.");
      return;
    }
  
    Array.from(files).forEach(file => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        // Set the new dimensions
        canvas.width = width;
        canvas.height = height;
  
        // Draw the resized image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
  
        // Create a new image element with the resized image
        const resizedImg = new Image();
        resizedImg.src = canvas.toDataURL("image/png");
  
        // Create a download link
        const downloadLink = document.createElement("a");
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.download = `resized-${file.name}`;
        downloadLink.textContent = "Download";
        downloadLink.className = "download-link";
  
        // Append the resized image and download link to the output div
        const imageContainer = document.createElement("div");
        imageContainer.className = "image-container";
        imageContainer.appendChild(resizedImg);
        imageContainer.appendChild(downloadLink);
        output.appendChild(imageContainer);
      };
    });
  }
  