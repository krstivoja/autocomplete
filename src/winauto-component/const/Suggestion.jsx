export const createSuggestionHandlers = (
    screens,
    handleBreakpoint,
    editingTagIndex,
    breakpoint,
    updateTag,
    addTag
  ) => {
    const handleSuggestionClick = (suggestion) => {
      if (screens.includes(suggestion)) {
        handleBreakpoint(suggestion);
      } else {
        if (editingTagIndex !== -1) {
          updateTag(breakpoint.concat(suggestion), editingTagIndex);
        } else {
          addTag(breakpoint.concat(suggestion));
        }
      }
    };
  
    return { handleSuggestionClick };
  };