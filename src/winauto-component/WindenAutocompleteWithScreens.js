import { useState, useEffect } from "@wordpress/element";
import { Autocomplete as WindenAutocomplete } from '../winauto-component/index.js';

const WindenAutocompleteWithScreens = ({ defaultTags, onChange, isDark = true }) => {
  const [isScreenChecked, setIsScreenChecked] = useState(false);
  const [__tags, set__Tags] = useState(defaultTags);

  // Parse options from window.winden_autocomplete and remove duplicates
  let options = [];
  if (window.winden_autocomplete && typeof window.winden_autocomplete === 'object') {
    options = Object.values(window.winden_autocomplete);
    options = [...new Set(options)];
  } else {
    // console.error('winden_autocomplete is not an object:', window.winden_autocomplete);
  }

  // Parse options from window.winden_autocomplete_screens and remove duplicates
  let screenOptions = [];
  if (window.winden_autocomplete_screens && typeof window.winden_autocomplete_screens === 'object') {
    screenOptions = Object.values(window.winden_autocomplete_screens);
    screenOptions = [...new Set(screenOptions)];
  } else {
    // console.error('winden_autocomplete_screens is not an object:', window.winden_autocomplete_screens);
  }

  const hasScreenKey = (str) => {
    const matchedKey = screenOptions.find(key => str.startsWith(`${key}:`));
    return matchedKey || null;
  }

  const getBreakpointTags = () => {
    const initialStates = screenOptions.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, { default: [] });

    __tags.forEach((tag) => {
      screenOptions.forEach((key) => {
        if (tag.startsWith(`${key}:`)) {
          initialStates[key].push(tag);
        }
      });
      if (!tag.includes(":")) {
        initialStates.default.push(tag);
      } else if (tag.includes(":") && !hasScreenKey(tag)) {
        initialStates.default.push(tag);
      }
    });

    return initialStates;
  };

  const getDefaultTagsByKey = (key = 'default') => {
    return getBreakpointTags()[key];
  };

  useEffect(() => {
    const handleActiveElementClassesChange = (event) => {
      if (Array.isArray(event.detail.newClasses)) {
        set__Tags(event.detail.newClasses);
      }
    };
    window.addEventListener('activeElementClassesChange', handleActiveElementClassesChange);

    return () => {
      window.removeEventListener('activeElementClassesChange', handleActiveElementClassesChange);
    };
  }, []);

  return (
    <div id="winauto">

      {/* <div id="winauto-screens">
        {screenOptions.map((screen, idx) => (
          <button
            key={idx}
            onClick={() => {
              const newTag = `${screen}:`;
              const updatedTags = [...__tags, newTag];
              set__Tags(updatedTags);
              onChange(updatedTags);

              // Enable editing for the newly added tag
              const newTagIndex = updatedTags.length - 1;
              const autocompleteKey = isScreenChecked ? screen + ":" : "";
              const tagToEdit = autocompleteKey + newTag.replace(`${screen}:`, "");
              setTimeout(() => {
                const event = new CustomEvent("editTag", {
                  detail: { tag: tagToEdit, index: newTagIndex }
                });
                window.dispatchEvent(event);
              }, 0);
            }}
          >
            {screen}
          </button>
        ))}
      </div> */}

      {
        isScreenChecked ? (
          <>
            <p className="winauto-textarea--title">Default</p>
            <WindenAutocomplete
              key={JSON.stringify(getDefaultTagsByKey('default'))}
              onChange={(tags) => {
                const _tags = Object.values({
                  ...getBreakpointTags(),
                  default: [...tags],
                }).flat();

                onChange(_tags);
                set__Tags(_tags);
              }}
              defaultTags={getDefaultTagsByKey('default')}
              autocomplete={options}
              autocompleteKey={""}
              isScreenChecked={isScreenChecked}
              screens={screenOptions}
              isDark={isDark}
            />
            {screenOptions.map((key, idx) => (
              <div key={idx} style={{ marginTop: '10px' }}>
                <p className="winauto-textarea--title">{key}</p>
                <WindenAutocomplete
                  key={JSON.stringify(getDefaultTagsByKey(key))}
                  onChange={(tags) => {
                    const _tags = Object.values({
                      ...getBreakpointTags(),
                      [key]: [...tags],
                    }).flat();

                    onChange(_tags);
                    set__Tags(_tags);
                  }}
                  defaultTags={getDefaultTagsByKey(key)}
                  autocomplete={options}
                  autocompleteKey={key + ":"}
                  isScreenChecked={isScreenChecked}
                  screens={screenOptions}
                  isDark={isDark}
                />
              </div>
            ))}
          </>
        ) : (
          <WindenAutocomplete
            key={JSON.stringify(__tags)}
            onChange={(tags) => {
              const _tags = [...tags];
              onChange(_tags);
              set__Tags(_tags);
            }}
            defaultTags={__tags}
            autocomplete={options}
            autocompleteKey={""}
            isScreenChecked={isScreenChecked}
            screens={screenOptions}
            isDark={isDark}
          />
        )
      }
      <label id="windauto--screens" className="windauto--toggle--label" style={{ marginTop: '12px' }}>
        <span className={`winauto--toggle ${isScreenChecked ? 'is-checked' : ''}`}>
          <input type="checkbox" checked={isScreenChecked} onChange={() => setIsScreenChecked(!isScreenChecked)} />
          <span className="winauto--toggle_dot"></span>
        </span>
        Split Screens (by breakpoint)
      </label>
    </div >
  );
}

export default WindenAutocompleteWithScreens;