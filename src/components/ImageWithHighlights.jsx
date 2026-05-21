// Renders an image with semi-transparent bounding box overlays for matched items.
// Gemini returns coordinates on a 0–1000 scale; dividing by 10 gives CSS percentages.
function ImageWithHighlights({ src, alt, className, highlightedItems = [] }) {
  const itemsWithBoxes = highlightedItems.filter((item) => item.box);

  return (
    <div className={`image-highlight-container ${className || ""}`}>
      <img src={src} alt={alt} loading="lazy" />
      {itemsWithBoxes.map((item) => {
        const { ymin, xmin, ymax, xmax } = item.box;
        return (
          <div
            key={item.id || item.name}
            className="highlight-box"
            style={{
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
            }}
          >
            <span className="highlight-box-label">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ImageWithHighlights;
