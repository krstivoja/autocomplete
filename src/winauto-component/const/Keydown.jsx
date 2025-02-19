import { useCallback } from "react";

const copyTagsToClipboard = (tags) => {
    const tagString = tags.join(" ");
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = tagString;
    textArea.style.position = "fixed"; // Prevent scrolling
    textArea.style.opacity = "0"; // Make it invisible
    document.body.appendChild(textArea);

    // Select and copy the text
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
    } catch (err) {
        console.error("Error copying tags:", err);
    }

    // Clean up
    document.body.removeChild(textArea);
};

async function pasteClassesFromClipboard() {
    // Check if the current context is secure
    if (!window.isSecureContext) {
        console.warn('Clipboard API is not available in insecure contexts (HTTP).');
        return [];
    }

    // Check for Clipboard API support
    if (navigator.clipboard && navigator.clipboard.readText) {
        try {
            // Attempt to read text from the clipboard
            const clipboardText = await navigator.clipboard.readText();

            return [...clipboardText.split(' ')];
        } catch (err) {
            // Log any errors encountered during the process
            console.error('Failed to read classes from clipboard: ', err);
            return [];
        }
    }
}

export const createKeydownHandler = ({
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
    removeTag,
    addTag,
    handleBreakpoint,
    updateTag,
    resetInput,
    handleTagClick,
    handleSuggestionClick,
    showSuggestions,
    setSelectedTags,
    setPasteEvent,
    setPasteOverridesEvent
}) => {
    return useCallback(
        async (e) => {
            // Add check if event target is within our component
            const isWithinComponent = e.target.closest('#winauto') !== null;
            const componentHasFocus = document.activeElement.closest('#winauto') !== null;
            
            if (!isWithinComponent || !componentHasFocus) {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "c") {
                e.preventDefault();
                e.stopPropagation();
                copyTagsToClipboard(selectedTags);
            }

            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "v") {
                if (window.isSecureContext) {
                    e.preventDefault();
                    const _tags = [...selectedTags].concat([...(await pasteClassesFromClipboard())])
                    setSelectedTags(Array.from(new Set(_tags)));
                    return;
                } else {
                    setPasteEvent(true);
                }
            }

            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "v") {
                if (window.isSecureContext) {
                    e.preventDefault();
                    setSelectedTags([...(await pasteClassesFromClipboard())])
                    return;
                } else {
                    setPasteOverridesEvent(true);
                }
            }

            if (e.key === "," || e.key === " ") {
                e.preventDefault();
                if (editingTagIndex === -1 && inputValue) {
                    addTag(inputValue)
                    return;
                } else if (inputValue) {
                    updateTag(inputValue, editingTagIndex);
                }

                if (inputRef.current) inputRef.current.focus();
                return;
            }

            if (
                e.key === "Backspace" &&
                focusedTagIndex !== -1 &&
                editingTagIndex === -1
            ) {
                e.preventDefault();
                removeTag(selectedTags[focusedTagIndex]);
                setFocusedTagIndex(-1);
                if (inputRef.current) inputRef.current.focus();
                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();
                if (editingTagIndex !== -1) {
                    // Handle editing mode
                    if (!breakpoint && inputValue.includes(':')) {
                        const [prefix, value] = inputValue.split(':');
                        setBreakpoint(prefix + ':');
                        return;
                    }

                    if (breakpoint && suggestions[selectedIndex]) {
                        updateTag(breakpoint.concat(suggestions[selectedIndex]), editingTagIndex);
                        setBreakpoint("");
                        setaddBreakpointValue(false);
                        resetInput();
                        return;
                    }
                    if (suggestions[selectedIndex]) {
                        updateTag(suggestions[selectedIndex], editingTagIndex);
                        return
                    }
                    if (inputValue) {
                        updateTag(inputValue, editingTagIndex);
                        resetInput();
                    }
                    return;
                } else if (focusedTagIndex !== -1) {
                    handleTagClick(selectedTags[focusedTagIndex], focusedTagIndex);
                    return;
                }
            }


            if (e.key === 'Enter') {
                const currentValue = inputRef.current?.textContent?.trim() || inputValue;
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else if (inputValue) {
                    inputValue.split(" ").forEach(tag => {
                        addTag(tag);
                    })

                }
            }



            if (e.key === "Escape") {
                if (editingTagIndex !== -1) {
                    e.preventDefault();
                    resetInput();
                    return;
                }
                if (showSuggestions) {
                    e.preventDefault();
                    setShowSuggestions(false);
                    return;
                }
            }

            if (showSuggestions) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : prev
                    );
                    return;
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
                    return;
                }
            }

            const content = e.target.textContent.trim();

            if (content === "") {
                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setFocusedTagIndex((prev) =>
                        prev === -1 ? selectedTags.length - 1 : Math.max(0, prev - 1)
                    );
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setFocusedTagIndex((prev) => {
                        const newIndex = prev === -1 ? 0 : prev + 1;
                        if (newIndex >= selectedTags.length) {
                            if (inputRef.current) inputRef.current.focus();
                            return -1;
                        }
                        return newIndex;
                    });
                }
            }


        },
        [
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
            removeTag,
            handleBreakpoint,
            updateTag,
            resetInput,
            handleTagClick,
            handleSuggestionClick,
            showSuggestions,
        ]
    );
};
