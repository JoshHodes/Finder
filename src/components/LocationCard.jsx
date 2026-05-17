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
          <svg viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <span>
            {location.item_count} item{location.item_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default LocationCard;
