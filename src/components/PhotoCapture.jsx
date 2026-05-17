import { useRef } from "react";

function PhotoCapture({ photoPreview, onPhotoSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onPhotoSelect({
        file,
        preview: reader.result,
        base64: reader.result.split(",")[1],
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
          <span className="camera-icon">
            <svg viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <span className="capture-text">Upload a photo</span>
          <span className="capture-hint">Click to open file picker</span>
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
