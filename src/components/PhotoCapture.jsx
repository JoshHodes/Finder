import { useRef } from "react";

function PhotoCapture({ photoPreview, onPhotoSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Read the file for preview
    const reader = new FileReader();
    reader.onload = () => {
      onPhotoSelect({
        file,
        preview: reader.result,
        base64: reader.result.split(",")[1], // strip data:image/...;base64, prefix
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`photo-capture ${photoPreview ? "has-photo" : ""}`}
      onClick={() => fileInputRef.current?.click()}
      id="photo-capture-area"
    >
      {photoPreview ? (
        <img src={photoPreview} alt="Preview" />
      ) : (
        <>
          <span className="camera-icon">📷</span>
          <span className="capture-text">Take a photo or upload one</span>
          <span className="capture-hint">
            Tap to open camera or file picker
          </span>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        id="photo-file-input"
      />
    </div>
  );
}

export default PhotoCapture;
