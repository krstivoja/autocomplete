import useDebounce from "../hooks/Debounce";

export const createInputHandlers = (
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
) => {
    // Debounced input handler
    const handleInput = useDebounce((e) => {
        const value = e.target.textContent;

        // Handle breakpoint prefix
        if (value.includes(":")) {
            const [prefix, val] = value.split(':');
            setBreakpoint(prefix + ':');
            setaddBreakpointValue(true);

        } else if (breakpoint) {
            setBreakpoint("");
            setaddBreakpointValue(false);
        }

        // Update input value
        setInputValue(value);

        if (pasteEvent) {
            setPasteEvent(false);
            if (typeof value === "string" && value?.length) {
                let _tags = value.split(' ');
                _tags = [...selectedTags].concat([..._tags]);
                _tags = Array.from(new Set(_tags));
                setSelectedTags(_tags);
            }
        } else if (pasteOverrideEvent) {
            setPasteOverridesEvent(false);
            if (typeof value === "string" && value?.length) {
                let _tags = value.split(' ');
                setSelectedTags([..._tags]);
            }
        } else {
            // Generate suggestions
            const currentSuggestions = value.includes(":")
                ? (() => {
                    const [prefix, val] = value.split(":");
                    if (addBreakpointValue) {
                        return autocomplete.filter((key) =>
                            key.toLowerCase().includes(val.toLowerCase())
                        );
                    }
                    return [];
                })()
                : [
                    ...autocomplete.filter((key) =>
                        key.toLowerCase().includes(value.toLowerCase())
                    ),
                    ...screens.filter((key) =>
                        key.toLowerCase().includes(value.toLowerCase())
                    )
                ];

            // Update UI state
            setSelectedIndex(-1);
            setSuggestions(currentSuggestions);
            setShowSuggestions(currentSuggestions.length > 0);
        }
    }, 100);

    // Reset input handler
    const resetInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.textContent = "";
        }

        setInputValue("");
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setEditingTagIndex(-1);
    };

    return {
        handleInput,
        resetInput
    };
};