import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import WindenAutocompleteWithScreens from "../winauto-component/WindenAutocompleteWithScreens";
import './index.scss';

const { addFilter } = wp.hooks;

const plainClasses = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const defaultClass = "plain-classes";

    const onChange = (value) => {
      props.setAttributes({
        className: value?.length ? [...value].join(' ') : '',
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title="Plain Classes"
            className={defaultClass}
          >
            <WindenAutocompleteWithScreens
              onChange={onChange}
              defaultTags={props?.attributes?.className ? props.attributes.className.trim().split(' ').filter(c => c) : []}
              isDark={false} />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withInspectorControl");

addFilter(
  "editor.BlockEdit",
  "plain-classes-gutenberg/with-inspector-controls",
  plainClasses
);