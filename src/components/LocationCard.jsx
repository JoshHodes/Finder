import { Link } from "react-router-dom";

function LocationCard({ location }) {
  return (
    <Link to={`/location/${location.id}`} className="card" id={`location-card-${location.id}`}>
      <img
        className="card-image"
        src={location.photoUrl}
        alt={location.name}
        loading="lazy"
      />
      <div className="card-body">
        <div className="card-title">{location.name}</div>
        <div className="card-subtitle">
          <span>📦</span>
          <span>
            {location.item_count} item{location.item_count !== 1 ? "s" : ""} detected
          </span>
        </div>
      </div>
    </Link>
  );
}

export default LocationCard;
