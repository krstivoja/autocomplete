import * as React from "react";

export const Tag = ({
  tag,
  index,
  isEditing,
  isFocused,
  onEdit,
  onRemove,
  onInput,
  onKeyDown,
  onFocus,
  autocompleteKey,
  onBlur,
  isDark = false,
}) => {
  if (isEditing) {
    return (
      <span
        className="winauto-textarea--item_editing"
        contentEditable
        onInput={onInput}
        onKeyDown={onKeyDown}
        role="textbox"
        aria-label="Search for Tailwind classes"
        onFocus={onFocus}
      />
    );
  }

  return (
    <div
      className={`winauto-textarea--item ${isFocused ? "focused" : ""}`}
      onClick={() => onEdit(autocompleteKey + tag, index)}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={0}
    >
      <span>{tag}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(autocompleteKey + tag);
        }}
        className="winauto-textarea--item_remove"
      >
        ×
      </button>
    </div>
  );
};
