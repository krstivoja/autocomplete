import { useEffect, useRef, useState } from "react";
import { Tag } from "./Tag";
import { SuggestionsList } from "./SuggestionsList";
import { handleBreakpointUpdate } from "../const/breakpoint";
import { createTagHandlers } from "../const/Tag";
import { createSuggestionHandlers } from "../const/Suggestion";
import { createInputHandlers } from "../const/input";
import { createKeydownHandler } from "../const/keydown";

export const Autocomplete = ({
  onChange,
  defaultTags,
  autocomplete,
  autocompleteKey,
  isScreenChecked,
  screens,
  isDark = true,
}) => {
  const inputRef = useRef(null);
  const tagRefs = useRef([]);
  const suggestionsRef = useRef(null);
  const latestValuesRef = useRef({ editingTagIndex: -1 });

  const [selectedTags, setSelectedTags] = useState(defaultTags ?? []);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [editingTagIndex, setEditingTagIndex] = useState(-1);
  const [focusedTagIndex, setFocusedTagIndex] = useState(-1);
  const [breakpoint, setBreakpoint] = useState("");
  const [addBreakpointValue, setaddBreakpointValue] = useState(false);
  const [pasteEvent, setPasteEvent] = useState(false);
  const [pasteOverrideEvent, setPasteOverridesEvent] = useState(false);

  const getMatchingScreenKey = (str = autocompleteKey) => {
    const matchedKey = screens.find((key) => str.startsWith(`${key}:`));
    return matchedKey || null;
  };

  const getBreakpointTags = (__tags) => {
    const initialStates = screens.reduce(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      { default: [] }
    );

    __tags.forEach((tag) => {
      screens.forEach((key) => {
        if (tag.startsWith(`${key}:`)) {
          initialStates[key].push(tag);
        }
      });
      if (!tag.includes(":")) {
        initialStates.default.push(tag);
      } else if (tag.includes(":") && !getMatchingScreenKey(tag)) {
        initialStates.default.push(tag);
      }
    });

    return initialStates;
  };

  useEffect(() => {
    latestValuesRef.current = { editingTagIndex };
  }, [editingTagIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setEditingTagIndex(-1);
        setFocusedTagIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleActiveElementClassesChange = (event) => {
      if (Array.isArray(event.detail.newClasses)) {
        const _tags = getBreakpointTags(event.detail.newClasses);
        const _screen = getMatchingScreenKey() ?? "default";

        if (isScreenChecked) {
          setSelectedTags(_tags[_screen]);
        } else {
          setSelectedTags(Object.values(_tags).flat());
        }
      }
    };
    window.addEventListener(
      "activeElementClassesChange",
      handleActiveElementClassesChange
    );

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener(
        "activeElementClassesChange",
        handleActiveElementClassesChange
      );
    };
  }, []);

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange(selectedTags);
    }
  }, [selectedTags]);

  useEffect(() => {
    if (editingTagIndex === -1) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.textContent = "";
      }
    }
  }, [editingTagIndex]);

  const handleBreakpoint = handleBreakpointUpdate(
    setBreakpoint,
    setaddBreakpointValue,
    inputRef
  );

  const { handleInput, resetInput } = createInputHandlers(
    setBreakpoint,
    setaddBreakpointValue,
    setInputValue,
    setSelectedIndex,
    setSuggestions,
    setShowSuggestions,
    setEditingTagIndex,
    screens,
    autocomplete,
    breakpoint,
    addBreakpointValue,
    inputRef,
    selectedTags,
    setSelectedTags,
    pasteEvent,
    pasteOverrideEvent,
    setPasteEvent,
    setPasteOverridesEvent
  );

  const { addTag, updateTag, removeTag, handleTagClick } = createTagHandlers({
    selectedTags,
    resetInput,
    setSelectedTags,
    setEditingTagIndex,
    setInputValue,
    setSuggestions,
    setShowSuggestions,
    tagRefs,
    autocomplete,
    autocompleteKey,
  });

  const { handleSuggestionClick } = createSuggestionHandlers(
    screens,
    handleBreakpoint,
    editingTagIndex,
    breakpoint,
    updateTag,
    addTag
  );

  // In your Autocomplete component
  const handleKeyDown = createKeydownHandler({
    focusedTagIndex,
    editingTagIndex,
    selectedTags,
    suggestions,
    selectedIndex,
    inputValue,
    breakpoint,
    screens,
    autocomplete,
    inputRef,
    setFocusedTagIndex,
    setSelectedIndex,
    setShowSuggestions,
    setBreakpoint,
    setaddBreakpointValue,
    addTag,
    removeTag,
    handleBreakpoint,
    updateTag,
    resetInput,
    handleTagClick,
    handleSuggestionClick,
    showSuggestions,
    setSelectedTags,
    setPasteEvent,
    setPasteOverridesEvent
  });

  return (
    <div className="relative w-100">
      <div className="winauto-textarea"
        onClick={(e) => {
          // Only focus if clicking directly on the textarea, not on tags
          if (e.target.classList.contains('winauto-textarea')) {
            if (inputRef.current) inputRef.current.focus();
          }
        }}
        >
        {isScreenChecked &&
          selectedTags
            .map((tag) => tag.replace(autocompleteKey, ""))
            .map((tag, index) => (
              <div
                key={`${tag}-${index}`}
                ref={(el) => (tagRefs.current[index] = el)}
              >
                <Tag
                  tag={tag}
                  index={index}
                  isEditing={editingTagIndex === index}
                  isFocused={focusedTagIndex === index}
                  onEdit={handleTagClick}
                  autocompleteKey={autocompleteKey}
                  onRemove={removeTag}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocusedTagIndex(-1)}
                  onBlur={() => setFocusedTagIndex(-1)}
                  isDark={isDark}
                />
              </div>
            ))}

        {!isScreenChecked &&
          selectedTags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              ref={(el) => (tagRefs.current[index] = el)}
            >
              <Tag
                tag={tag}
                index={index}
                isEditing={editingTagIndex === index}
                isFocused={focusedTagIndex === index}
                onEdit={handleTagClick}
                autocompleteKey={autocompleteKey}
                onRemove={removeTag}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocusedTagIndex(-1)}
                onBlur={() => setFocusedTagIndex(-1)}
                isDark={isDark}
              />
            </div>
          ))}

        {editingTagIndex === -1 && (
          <span
            ref={inputRef}
            className="winauto-textbox outline-none inline-block min-w-[20px] grow"
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            role="textbox"
            aria-label="Search for Tailwind classes"
          />
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="winauto-textarea--suggestions-wrapper"
        >
          <SuggestionsList
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            autocomplete={autocomplete}
            screens={screens}
            onSuggestionClick={handleSuggestionClick}
            isDark={isDark}
            inputValue={inputValue}
          />
        </div>
      )}
    </div>
  );
};
