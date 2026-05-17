function ItemList({ items, matchedItems = [] }) {
  const matchedNames = new Set(matchedItems.map((m) => m.name.toLowerCase()));

  return (
    <div className="item-list">
      {items.map((item) => {
        const itemName = typeof item === "string" ? item : item.name;
        const itemId = typeof item === "string" ? itemName : item.id;
        const isMatched = matchedNames.has(itemName.toLowerCase());

        return (
          <span
            key={itemId}
            className={`item-chip ${isMatched ? "matched" : ""}`}
          >
            {itemName}
          </span>
        );
      })}
    </div>
  );
}

export default ItemList;
