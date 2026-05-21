function ItemList({ items, matchedItems = [], onItemHover }) {
  const matchedNames = new Set(matchedItems.map((m) => m.name.toLowerCase()));

  return (
    <div className="item-list">
      {items.map((item) => {
        const itemName = typeof item === "string" ? item : item.name;
        const itemId = typeof item === "string" ? itemName : item.id;
        const isMatched = matchedNames.has(itemName.toLowerCase());
        const hasBox = typeof item === "object" && item.box;

        return (
          <span
            key={itemId}
            className={`item-chip ${isMatched ? "matched" : ""} ${hasBox && onItemHover ? "locatable" : ""}`}
            onMouseEnter={hasBox && onItemHover ? () => onItemHover(item) : undefined}
            onMouseLeave={onItemHover ? () => onItemHover(null) : undefined}
          >
            {itemName}
          </span>
        );
      })}
    </div>
  );
}

export default ItemList;
