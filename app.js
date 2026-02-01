// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeBtn = document.getElementById('resizeBtn');
const clearBtn = document.getElementById('clearBtn');
const output = document.getElementById('output');
const imageCount = document.getElementById('imageCount');
const batchActions = document.getElementById('batchActions');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const selectedCount = document.getElementById('selectedCount');

// Variables to track uploaded files and resized images
let uploadedFiles = [];
let resizedImages = [];

// File upload event listener
imageUpload.addEventListener('change', function() {
  uploadedFiles = Array.from(this.files);
  updateImagePreview();
});

// Update image preview
function updateImagePreview() {
  imagePreview.innerHTML = '';
  
  if (uploadedFiles.length === 0) {
    imagePreview.innerHTML = `
      <i class="fas fa-cloud-upload-alt preview-icon"></i>
      <p class="mb-2">Selected images will appear here</p>
      <small class="text-muted">No images selected</small>
    `;
    imagePreview.classList.remove('has-images');
    return;
  }
  
  imagePreview.classList.add('has-images');
  
  const previewHeader = document.createElement('div');
  previewHeader.className = 'w-100 mb-3 d-flex justify-content-between align-items-center';
  previewHeader.innerHTML = `
    <h6 class="mb-0">Selected Images (${uploadedFiles.length})</h6>
    <button class="btn btn-sm btn-outline-secondary" id="clearSelectionBtn">Clear</button>
  `;
  imagePreview.appendChild(previewHeader);
  
  // Add clear selection button functionality
  document.getElementById('clearSelectionBtn').addEventListener('click', function(e) {
    e.preventDefault();
    imageUpload.value = '';
    uploadedFiles = [];
    updateImagePreview();
  });
  
  // Create a grid for thumbnails
  const thumbGrid = document.createElement('div');
  thumbGrid.className = 'row row-cols-3 g-2 w-100';
  imagePreview.appendChild(thumbGrid);
  
  // Generate thumbnails for up to 6 images
  const filesToShow = uploadedFiles.slice(0, 6);
  
  filesToShow.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const thumbCol = document.createElement('div');
      thumbCol.className = 'col';
      
      const thumbWrapper = document.createElement('div');
      thumbWrapper.className = 'position-relative';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'img-fluid rounded';
      img.style.height = '80px';
      img.style.width = '100%';
      img.style.objectFit = 'cover';
      
      thumbWrapper.appendChild(img);
      
      if (index === 5 && uploadedFiles.length > 6) {
        const overlay = document.createElement('div');
        overlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded';
        overlay.innerHTML = `<span class="text-white fw-bold">+${uploadedFiles.length - 6}</span>`;
        thumbWrapper.appendChild(overlay);
      }
      
      thumbCol.appendChild(thumbWrapper);
      thumbGrid.appendChild(thumbCol);
    };
    reader.readAsDataURL(file);
  });
  
  if (uploadedFiles.length > 6) {
    const infoText = document.createElement('p');
    infoText.className = 'small text-muted mt-2 mb-0';
    infoText.textContent = `and ${uploadedFiles.length - 6} more images...`;
    imagePreview.appendChild(infoText);
  }
}

// Clear all button
clearBtn.addEventListener('click', function() {
  imageUpload.value = '';
  uploadedFiles = [];
  widthInput.value = '';
  heightInput.value = '';
  output.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-images"></i>
      <h4>No resized images yet</h4>
      <p>Upload images, set dimensions and click "Resize Images" to get started.</p>
    </div>
  `;
  batchActions.classList.add('d-none');
  imageCount.textContent = '0 images';
  updateImagePreview();
});

// Download all images
downloadAllBtn.addEventListener('click', function() {
  if (resizedImages.length === 0) return;
  
  // Create a loading state
  const originalText = downloadAllBtn.innerHTML;
  downloadAllBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Preparing ZIP...';
  downloadAllBtn.disabled = true;
  
  // In a real implementation, you would create a ZIP file with all images
  // For this example, we'll trigger download for each image individually
  setTimeout(() => {
    resizedImages.forEach((imageData, index) => {
      const link = document.createElement('a');
      link.href = imageData.dataUrl;
      link.download = imageData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    
    // Restore button state
    downloadAllBtn.innerHTML = originalText;
    downloadAllBtn.disabled = false;
    
    // Show success message
    alert(`Successfully downloaded ${resizedImages.length} images!`);
  }, 1000);
});

// Resize images function
resizeBtn.addEventListener('click', function() {
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);
  
  if (uploadedFiles.length === 0) {
    showAlert('Please select at least one image.', 'warning');
    return;
  }
  
  if ((width && width <= 0) || (height && height <= 0)) {
    showAlert('Width and height must be positive numbers.', 'warning');
    return;
  }
  
  if (!width && !height) {
    showAlert('Please enter at least one dimension (width or height).', 'warning');
    return;
  }
  
  // Show processing state
  const originalText = resizeBtn.innerHTML;
  resizeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  resizeBtn.disabled = true;
  
  // Clear previous output
  output.innerHTML = '';
  resizedImages = [];
  
  // Process each image
  let processedCount = 0;
  
  uploadedFiles.forEach(file => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Calculate dimensions
      let targetWidth = width || (height ? Math.round(img.width * (height / img.height)) : img.width);
      let targetHeight = height || (width ? Math.round(img.height * (width / img.width)) : img.height);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Create data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Store resized image data
      const resizedImage = {
        dataUrl: dataUrl,
        filename: `resized-${file.name.replace(/\.[^/.]+$/, "")}.png`,
        originalName: file.name,
        width: targetWidth,
        height: targetHeight
      };
      
      resizedImages.push(resizedImage);
      
      // Create output card
      const outputCard = document.createElement('div');
      outputCard.className = 'output-card';
      
      outputCard.innerHTML = `
        <img src="${dataUrl}" alt="Resized ${file.name}" class="output-img">
        <div class="output-card-body">
          <div class="file-name" title="${file.name}">${file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</div>
          <div class="output-info">
            <div><i class="fas fa-expand-alt me-1"></i> ${targetWidth} × ${targetHeight}px</div>
            <div><i class="fas fa-weight me-1"></i> ${Math.round(file.size / 1024)} KB → ${Math.round(dataUrl.length / 1024)} KB</div>
          </div>
          <a href="#" class="btn btn-primary btn-sm download-btn download-single" data-index="${resizedImages.length - 1}">
            <i class="fas fa-download me-1"></i> Download
          </a>
        </div>
      `;
      
      output.appendChild(outputCard);
      
      // Update counters
      processedCount++;
      
      if (processedCount === uploadedFiles.length) {
        // All images processed
        resizeBtn.innerHTML = originalText;
        resizeBtn.disabled = false;
        
        // Update UI
        imageCount.textContent = `${resizedImages.length} image${resizedImages.length !== 1 ? 's' : ''}`;
        selectedCount.textContent = resizedImages.length;
        batchActions.classList.remove('d-none');
        
        // Add event listeners to download buttons
        document.querySelectorAll('.download-single').forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            const link = document.createElement('a');
            link.href = resizedImages[index].dataUrl;
            link.download = resizedImages[index].filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        });
        
        showAlert(`Successfully resized ${resizedImages.length} image${resizedImages.length !== 1 ? 's' : ''}!`, 'success');
      }
    };
  });
});

// Alert function
function showAlert(message, type) {
  // Remove existing alert
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();
  
  // Create alert
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = '1050';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.classList.remove('show');
      setTimeout(() => alertDiv.remove(), 300);
    }
  }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Add some sample dimension presets
  const presets = [
    {label: 'Social Media', width: 1080, height: 1080},
    {label: 'Website Banner', width: 1200, height: 400},
    {label: 'Thumbnail', width: 320, height: 240},
    {label: 'HD', width: 1920, height: 1080}
  ];
  
  // Add presets to a dropdown
  const dimensionsContainer = document.querySelector('.dimensions-container');
  const presetHTML = `
    <div class="mt-3">
      <label class="form-label">Quick Presets:</label>
      <div class="d-flex flex-wrap gap-2">
        ${presets.map(preset => `
          <button type="button" class="btn btn-sm btn-outline-secondary preset-btn" data-width="${preset.width}" data-height="${preset.height}">
            ${preset.label} (${preset.width}×${preset.height})
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  dimensionsContainer.insertAdjacentHTML('beforeend', presetHTML);
  
  // Add preset button functionality
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      widthInput.value = this.getAttribute('data-width');
      heightInput.value = this.getAttribute('data-height');
      showAlert(`Preset applied: ${this.textContent}`, 'info');
    });
  });
});