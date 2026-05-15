#!/usr/bin/env node
/**
 * migrate-wai-aria.js
 * Generates WAI-ARIA roles, states/properties, and patterns as rule JSON files
 */

const WAI_ARIA_ROLES = [
  { id: 'alert', name: 'Alert', description: 'A type of live region with alert messages.', tags: ['wai-aria', 'role', 'alert', 'live-region'], automated: false },
  { id: 'alertdialog', name: 'Alert Dialog', description: 'A type of dialog with an alert message.', tags: ['wai-aria', 'role', 'alert', 'dialog'], automated: false },
  { id: 'application', name: 'Application', description: 'A region that behaves like a standalone application.', tags: ['wai-aria', 'role', 'application', 'landmark'], automated: false },
  { id: 'article', name: 'Article', description: 'A section of a page that forms an independent part.', tags: ['wai-aria', 'role', 'article', 'content'], automated: false },
  { id: 'banner', name: 'Banner', description: 'A region that is the main header of a page.', tags: ['wai-aria', 'role', 'banner', 'landmark'], automated: false },
  { id: 'blockquote', name: 'Blockquote', description: 'A section with quoted content from another source.', tags: ['wai-aria', 'role', 'blockquote', 'content'], automated: false },
  { id: 'button', name: 'Button', description: 'An input that triggers an action.', tags: ['wai-aria', 'role', 'button', 'interactive'], automated: true },
  { id: 'caption', name: 'Caption', description: 'A visible label for a figure.', tags: ['wai-aria', 'role', 'caption', 'content'], automated: false },
  { id: 'cell', name: 'Cell', description: 'A cell in a tabular container.', tags: ['wai-aria', 'role', 'cell', 'table'], automated: false },
  { id: 'checkbox', name: 'Checkbox', description: 'An input with three states: true, false, mixed.', tags: ['wai-aria', 'role', 'checkbox', 'input'], automated: true },
  { id: 'code', name: 'Code', description: 'A fragment of computer code.', tags: ['wai-aria', 'role', 'code', 'text'], automated: false },
  { id: 'columnheader', name: 'Column Header', description: 'A cell containing header information for a column.', tags: ['wai-aria', 'role', 'columnheader', 'table'], automated: false },
  { id: 'combobox', name: 'Combobox', description: 'A input that shows a list of options.', tags: ['wai-aria', 'role', 'combobox', 'input', 'composite'], automated: true },
  { id: 'complementary', name: 'Complementary', description: 'A supporting section of the page.', tags: ['wai-aria', 'role', 'complementary', 'landmark'], automated: false },
  { id: 'contentinfo', name: 'Content Info', description: 'A region with information about the page.', tags: ['wai-aria', 'role', 'contentinfo', 'landmark'], automated: false },
  { id: 'definition', name: 'Definition', description: 'A definition of a term.', tags: ['wai-aria', 'role', 'definition', 'content'], automated: false },
  { id: 'deletion', name: 'Deletion', description: 'Content that has been removed.', tags: ['wai-aria', 'role', 'deletion', 'text'], automated: false },
  { id: 'dialog', name: 'Dialog', description: 'A container for interactive elements.', tags: ['wai-aria', 'role', 'dialog', 'interactive'], automated: false },
  { id: 'directory', name: 'Directory', description: 'A list of references to members of a group.', tags: ['wai-aria', 'role', 'directory', 'list'], automated: false },
  { id: 'document', name: 'Document', description: 'A region containing content for user to read.', tags: ['wai-aria', 'role', 'document', 'content'], automated: false },
  { id: 'emphasis', name: 'Emphasis', description: 'Text with added importance.', tags: ['wai-aria', 'role', 'emphasis', 'text'], automated: false },
  { id: 'feed', name: 'Feed', description: 'A scrollable list of articles.', tags: ['wai-aria', 'role', 'feed', 'list'], automated: false },
  { id: 'figure', name: 'Figure', description: 'A graphical document with an optional caption.', tags: ['wai-aria', 'role', 'figure', 'content'], automated: false },
  { id: 'form', name: 'Form', description: 'A region containing form elements.', tags: ['wai-aria', 'role', 'form', 'landmark'], automated: false },
  { id: 'generic', name: 'Generic', description: 'A container with no semantic meaning.', tags: ['wai-aria', 'role', 'generic', 'container'], automated: false },
  { id: 'grid', name: 'Grid', description: 'A table-like container of interactive elements.', tags: ['wai-aria', 'role', 'grid', 'table', 'composite'], automated: true },
  { id: 'gridcell', name: 'Grid Cell', description: 'A cell in a grid.', tags: ['wai-aria', 'role', 'gridcell', 'table'], automated: false },
  { id: 'group', name: 'Group', description: 'A set of user interface objects.', tags: ['wai-aria', 'role', 'group', 'container'], automated: false },
  { id: 'heading', name: 'Heading', description: 'A heading for a section.', tags: ['wai-aria', 'role', 'heading', 'content'], automated: true },
  { id: 'img', name: 'Image', description: 'A container for image content.', tags: ['wai-aria', 'role', 'img', 'media'], automated: false },
  { id: 'insertion', name: 'Insertion', description: 'Content that has been added.', tags: ['wai-aria', 'role', 'insertion', 'text'], automated: false },
  { id: 'link', name: 'Link', description: 'An interactive reference to a resource.', tags: ['wai-aria', 'role', 'link', 'interactive'], automated: true },
  { id: 'list', name: 'List', description: 'A container for list items.', tags: ['wai-aria', 'role', 'list', 'container'], automated: false },
  { id: 'listbox', name: 'Listbox', description: 'A widget that allows selecting from list items.', tags: ['wai-aria', 'role', 'listbox', 'select', 'composite'], automated: true },
  { id: 'listitem', name: 'List Item', description: 'A single item in a list.', tags: ['wai-aria', 'role', 'listitem', 'list'], automated: false },
  { id: 'log', name: 'Log', description: 'A type of live region with log messages.', tags: ['wai-aria', 'role', 'log', 'live-region'], automated: false },
  { id: 'main', name: 'Main', description: 'The primary content of a page.', tags: ['wai-aria', 'role', 'main', 'landmark'], automated: false },
  { id: 'marquee', name: 'Marquee', description: 'A type of live region with non-essential updates.', tags: ['wai-aria', 'role', 'marquee', 'live-region'], automated: false },
  { id: 'math', name: 'Math', description: 'A mathematical expression.', tags: ['wai-aria', 'role', 'math', 'content'], automated: false },
  { id: 'menu', name: 'Menu', description: 'A type of widget that offers a list of choices.', tags: ['wai-aria', 'role', 'menu', 'navigation'], automated: true },
  { id: 'menubar', name: 'Menu Bar', description: 'A menu with a visible bar of menu items.', tags: ['wai-aria', 'role', 'menubar', 'menu'], automated: false },
  { id: 'menuitem', name: 'Menu Item', description: 'An option in a menu.', tags: ['wai-aria', 'role', 'menuitem', 'menu'], automated: false },
  { id: 'menuitemcheckbox', name: 'Menu Item Checkbox', description: 'A checkbox inside a menu.', tags: ['wai-aria', 'role', 'menuitemcheckbox', 'menu', 'checkbox'], automated: false },
  { id: 'menuitemradio', name: 'Menu Item Radio', description: 'A radio button inside a menu.', tags: ['wai-aria', 'role', 'menuitemradio', 'menu', 'radio'], automated: false },
  { id: 'navigation', name: 'Navigation', description: 'A region with navigation links.', tags: ['wai-aria', 'role', 'navigation', 'landmark'], automated: false },
  { id: 'none', name: 'None', description: 'An element with no semantic meaning.', tags: ['wai-aria', 'role', 'none', 'presentational'], automated: false },
  { id: 'note', name: 'Note', description: 'A section with parenthetical content.', tags: ['wai-aria', 'role', 'note', 'content'], automated: false },
  { id: 'option', name: 'Option', description: 'A selectable item in a list.', tags: ['wai-aria', 'role', 'option', 'listbox'], automated: false },
  { id: 'paragraph', name: 'Paragraph', description: 'A paragraph of content.', tags: ['wai-aria', 'role', 'paragraph', 'text'], automated: false },
  { id: 'presentation', name: 'Presentation', description: 'An element with no semantic meaning.', tags: ['wai-aria', 'role', 'presentation', 'presentational'], automated: false },
  { id: 'progressbar', name: 'Progress Bar', description: 'An element showing progress.', tags: ['wai-aria', 'role', 'progressbar', 'widget'], automated: true },
  { id: 'radio', name: 'Radio', description: 'A selectable item in a group.', tags: ['wai-aria', 'role', 'radio', 'input'], automated: true },
  { id: 'radiogroup', name: 'Radio Group', description: 'A group of radio buttons.', tags: ['wai-aria', 'role', 'radiogroup', 'select'], automated: false },
  { id: 'region', name: 'Region', description: 'A perceivable section of a page.', tags: ['wai-aria', 'role', 'region', 'landmark'], automated: false },
  { id: 'row', name: 'Row', description: 'A row of cells in a table.', tags: ['wai-aria', 'role', 'row', 'table'], automated: false },
  { id: 'rowgroup', name: 'Row Group', description: 'A group of rows in a table.', tags: ['wai-aria', 'role', 'rowgroup', 'table'], automated: false },
  { id: 'rowheader', name: 'Row Header', description: 'A cell containing header information for a row.', tags: ['wai-aria', 'role', 'rowheader', 'table'], automated: false },
  { id: 'scrollbar', name: 'Scrollbar', description: 'A scrollbar control.', tags: ['wai-aria', 'role', 'scrollbar', 'widget'], automated: false },
  { id: 'search', name: 'Search', description: 'A region with search functionality.', tags: ['wai-aria', 'role', 'search', 'landmark'], automated: false },
  { id: 'searchbox', name: 'Search Box', description: 'An input field for search queries.', tags: ['wai-aria', 'role', 'searchbox', 'input'], automated: false },
  { id: 'separator', name: 'Separator', description: 'A divider between content.', tags: ['wai-aria', 'role', 'separator', 'content'], automated: false },
  { id: 'slider', name: 'Slider', description: 'An input for selecting a value.', tags: ['wai-aria', 'role', 'slider', 'input'], automated: true },
  { id: 'spinbutton', name: 'Spin Button', description: 'An input for numeric values with controls.', tags: ['wai-aria', 'role', 'spinbutton', 'input'], automated: false },
  { id: 'status', name: 'Status', description: 'A type of live region with status messages.', tags: ['wai-aria', 'role', 'status', 'live-region'], automated: false },
  { id: 'strong', name: 'Strong', description: 'Text with strong importance.', tags: ['wai-aria', 'role', 'strong', 'text'], automated: false },
  { id: 'subscript', name: 'Subscript', description: 'Text displayed below the baseline.', tags: ['wai-aria', 'role', 'subscript', 'text'], automated: false },
  { id: 'superscript', name: 'Superscript', description: 'Text displayed above the baseline.', tags: ['wai-aria', 'role', 'superscript', 'text'], automated: false },
  { id: 'switch', name: 'Switch', description: 'A checkbox that represents on/off states.', tags: ['wai-aria', 'role', 'switch', 'checkbox', 'input'], automated: true },
  { id: 'tab', name: 'Tab', description: 'An interactive tab in a tab list.', tags: ['wai-aria', 'role', 'tab', 'navigation'], automated: false },
  { id: 'table', name: 'Table', description: 'A table containing rows and columns.', tags: ['wai-aria', 'role', 'table', 'container'], automated: false },
  { id: 'tablist', name: 'Tab List', description: 'A container of tabs.', tags: ['wai-aria', 'role', 'tablist', 'navigation', 'composite'], automated: true },
  { id: 'tabpanel', name: 'Tab Panel', description: 'A container for tab content.', tags: ['wai-aria', 'role', 'tabpanel', 'container'], automated: false },
  { id: 'term', name: 'Term', description: 'A definition list term.', tags: ['wai-aria', 'role', 'term', 'content'], automated: false },
  { id: 'textbox', name: 'Textbox', description: 'An input for text.', tags: ['wai-aria', 'role', 'textbox', 'input'], automated: true },
  { id: 'timer', name: 'Timer', description: 'A type of live region with a counter.', tags: ['wai-aria', 'role', 'timer', 'live-region'], automated: false },
  { id: 'toolbar', name: 'Toolbar', description: 'A container of toolbar controls.', tags: ['wai-aria', 'role', 'toolbar', 'container'], automated: false },
  { id: 'tooltip', name: 'Tooltip', description: 'A popup with descriptions for elements.', tags: ['wai-aria', 'role', 'tooltip', 'popup'], automated: false },
  { id: 'tree', name: 'Tree', description: 'A widget with hierarchical items.', tags: ['wai-aria', 'role', 'tree', 'select', 'composite'], automated: true },
  { id: 'treegrid', name: 'Tree Grid', description: 'A grid with tree structure.', tags: ['wai-aria', 'role', 'treegrid', 'table', 'composite'], automated: false },
  { id: 'treeitem', name: 'Tree Item', description: 'An item in a tree.', tags: ['wai-aria', 'role', 'treeitem', 'tree'], automated: false }
];

const WAI_ARIA_STATES_PROPERTIES = [
  { id: 'aria-activedescendant', name: 'Active Descendant', description: 'Identifies the currently active descendant.', tags: ['wai-aria', 'property', 'widget'], automated: false },
  { id: 'aria-atomic', name: 'Atomic', description: 'Whether live region updates are atomic.', tags: ['wai-aria', 'property', 'live-region'], automated: false },
  { id: 'aria-autocomplete', name: 'Autocomplete', description: 'Indicates if input completion suggestions are provided.', tags: ['wai-aria', 'property', 'input', 'combobox'], automated: false },
  { id: 'aria-braillelabel', name: 'Braille Label', description: 'Accessible label for braille devices.', tags: ['wai-aria', 'property', 'accessibility'], automated: false },
  { id: 'aria-brailleroledescription', name: 'Braille Role Description', description: 'Role description for braille devices.', tags: ['wai-aria', 'property', 'accessibility'], automated: false },
  { id: 'aria-busy', name: 'Busy', description: 'Indicates if live region is updating.', tags: ['wai-aria', 'property', 'live-region'], automated: false },
  { id: 'aria-checked', name: 'Checked', description: 'Indicates checked state (true/false/mixed).', tags: ['wai-aria', 'state', 'checkbox', 'radio', 'switch'], automated: false },
  { id: 'aria-colcount', name: 'Column Count', description: 'Defines the number of columns in a table.', tags: ['wai-aria', 'property', 'table', 'grid'], automated: false },
  { id: 'aria-colindex', name: 'Column Index', description: 'Defines the column position in a table.', tags: ['wai-aria', 'property', 'table', 'grid'], automated: false },
  { id: 'aria-colindextext', name: 'Column Index Text', description: 'Accessible text for column position.', tags: ['wai-aria', 'property', 'table'], automated: false },
  { id: 'aria-colspan', name: 'Column Span', description: 'Defines the number of columns spanned.', tags: ['wai-aria', 'property', 'table'], automated: false },
  { id: 'aria-controls', name: 'Controls', description: 'Lists elements controlled by current element.', tags: ['wai-aria', 'property', 'relationship'], automated: false },
  { id: 'aria-current', name: 'Current', description: 'Indicates current item in a set.', tags: ['wai-aria', 'property', 'navigation'], automated: false },
  { id: 'aria-describedby', name: 'Described By', description: 'Lists elements that describe the current element.', tags: ['wai-aria', 'property', 'relationship', 'accessibility'], automated: true },
  { id: 'aria-description', name: 'Description', description: 'Provides an accessible description.', tags: ['wai-aria', 'property', 'accessibility'], automated: false },
  { id: 'aria-details', name: 'Details', description: 'Identifies related elements with details.', tags: ['wai-aria', 'property', 'relationship'], automated: false },
  { id: 'aria-disabled', name: 'Disabled', description: 'Indicates the element is not editable.', tags: ['wai-aria', 'state', 'widget'], automated: true },
  { id: 'aria-dropeffect', name: 'Drop Effect', description: 'Indicates drag-and-drop operations.', tags: ['wai-aria', 'property', 'drag-drop'], automated: false },
  { id: 'aria-errormessage', name: 'Error Message', description: 'Identifies error message elements.', tags: ['wai-aria', 'property', 'form', 'validation'], automated: false },
  { id: 'aria-expanded', name: 'Expanded', description: 'Indicates if expandable element is expanded.', tags: ['wai-aria', 'state', 'widget', 'disclosure'], automated: true },
  { id: 'aria-flowto', name: 'Flow To', description: 'Indicates reading order destination.', tags: ['wai-aria', 'property', 'relationship'], automated: false },
  { id: 'aria-haspopup', name: 'Has Popup', description: 'Indicates the element has a popup.', tags: ['wai-aria', 'property', 'menu', 'listbox'], automated: false },
  { id: 'aria-hidden', name: 'Hidden', description: 'Indicates if element is hidden.', tags: ['wai-aria', 'state', 'visibility'], automated: true },
  { id: 'aria-invalid', name: 'Invalid', description: 'Indicates input validation state.', tags: ['wai-aria', 'state', 'form', 'validation'], automated: false },
  { id: 'aria-keyshortcuts', name: 'Key Shortcuts', description: 'Lists keyboard shortcuts.', tags: ['wai-aria', 'property', 'keyboard', 'shortcuts'], automated: false },
  { id: 'aria-label', name: 'Label', description: 'Provides an accessible label.', tags: ['wai-aria', 'property', 'accessibility'], automated: true },
  { id: 'aria-labelledby', name: 'Labelled By', description: 'Lists elements that label the current element.', tags: ['wai-aria', 'property', 'relationship', 'accessibility'], automated: true },
  { id: 'aria-level', name: 'Level', description: 'Defines the hierarchical level.', tags: ['wai-aria', 'property', 'heading', 'tree'], automated: false },
  { id: 'aria-live', name: 'Live', description: 'Indicates if updates are announced.', tags: ['wai-aria', 'property', 'live-region'], automated: false },
  { id: 'aria-modal', name: 'Modal', description: 'Indicates if element is modal.', tags: ['wai-aria', 'property', 'dialog', 'modal'], automated: false },
  { id: 'aria-multiline', name: 'Multiline', description: 'Indicates textbox accepts multiple lines.', tags: ['wai-aria', 'property', 'textbox'], automated: false },
  { id: 'aria-multiselectable', name: 'Multiselectable', description: 'Indicates list allows multiple selection.', tags: ['wai-aria', 'property', 'listbox', 'tree'], automated: false },
  { id: 'aria-orientation', name: 'Orientation', description: 'Indicates element orientation.', tags: ['wai-aria', 'property', 'widget', 'slider', 'scrollbar'], automated: false },
  { id: 'aria-owns', name: 'Owns', description: 'Identifies child elements.', tags: ['wai-aria', 'property', 'relationship', 'widget'], automated: false },
  { id: 'aria-placeholder', name: 'Placeholder', description: 'Provides a hint for input.', tags: ['wai-aria', 'property', 'input', 'textbox'], automated: false },
  { id: 'aria-posinset', name: 'Position In Set', description: 'Defines position in a set.', tags: ['wai-aria', 'property', 'listitem', 'treeitem'], automated: false },
  { id: 'aria-pressed', name: 'Pressed', description: 'Indicates toggle button state.', tags: ['wai-aria', 'state', 'button', 'toggle'], automated: false },
  { id: 'aria-readonly', name: 'Read Only', description: 'Indicates element is not editable.', tags: ['wai-aria', 'property', 'input', 'widget'], automated: false },
  { id: 'aria-relevant', name: 'Relevant', description: 'Indicates what updates are relevant.', tags: ['wai-aria', 'property', 'live-region'], automated: false },
  { id: 'aria-required', name: 'Required', description: 'Indicates input is required.', tags: ['wai-aria', 'property', 'form', 'input'], automated: true },
  { id: 'aria-roledescription', name: 'Role Description', description: 'Provides a readable role.', tags: ['wai-aria', 'property', 'accessibility'], automated: false },
  { id: 'aria-rowcount', name: 'Row Count', description: 'Defines the number of rows in a table.', tags: ['wai-aria', 'property', 'table', 'grid'], automated: false },
  { id: 'aria-rowindex', name: 'Row Index', description: 'Defines the row position in a table.', tags: ['wai-aria', 'property', 'table', 'grid'], automated: false },
  { id: 'aria-rowindextext', name: 'Row Index Text', description: 'Accessible text for row position.', tags: ['wai-aria', 'property', 'table'], automated: false },
  { id: 'aria-rowspan', name: 'Row Span', description: 'Defines the number of rows spanned.', tags: ['wai-aria', 'property', 'table'], automated: false },
  { id: 'aria-selected', name: 'Selected', description: 'Indicates selection state.', tags: ['wai-aria', 'state', 'treeitem', 'tab', 'option'], automated: false },
  { id: 'aria-setsize', name: 'Set Size', description: 'Defines the size of the set.', tags: ['wai-aria', 'property', 'listitem', 'treeitem'], automated: false },
  { id: 'aria-sort', name: 'Sort', description: 'Indicates sort direction.', tags: ['wai-aria', 'property', 'table', 'grid'], automated: false },
  { id: 'aria-valuemax', name: 'Value Max', description: 'Defines the maximum value.', tags: ['wai-aria', 'property', 'range', 'slider', 'progressbar'], automated: false },
  { id: 'aria-valuemin', name: 'Value Min', description: 'Defines the minimum value.', tags: ['wai-aria', 'property', 'range', 'slider', 'progressbar'], automated: false },
  { id: 'aria-valuenow', name: 'Value Now', description: 'Defines the current value.', tags: ['wai-aria', 'property', 'range', 'slider', 'progressbar'], automated: false },
  { id: 'aria-valuetext', name: 'Value Text', description: 'Defines the accessible text for value.', tags: ['wai-aria', 'property', 'slider', 'spinbutton'], automated: false }
];

const WAI_ARIA_PATTERNS = [
  { id: 'accordion', name: 'Accordion', description: 'Expandable/collapsible sections pattern.', tags: ['wai-aria', 'pattern', 'disclosure'], automated: false },
  { id: 'alert', name: 'Alert', description: 'Important time-sensitive information.', tags: ['wai-aria', 'pattern', 'live-region'], automated: false },
  { id: 'breadcrumbs', name: 'Breadcrumbs', description: 'Navigation path pattern.', tags: ['wai-aria', 'pattern', 'navigation'], automated: false },
  { id: 'button', name: 'Button', description: 'Interactive trigger pattern.', tags: ['wai-aria', 'pattern', 'interactive'], automated: true },
  { id: 'carousel', name: 'Carousel', description: 'Rotating content pattern.', tags: ['wai-aria', 'pattern', 'content'], automated: false },
  { id: 'checkbox', name: 'Checkbox', description: 'Three-state selection pattern.', tags: ['wai-aria', 'pattern', 'input'], automated: true },
  { id: 'combobox', name: 'Combobox', description: 'Input with dropdown options pattern.', tags: ['wai-aria', 'pattern', 'input', 'composite'], automated: true },
  { id: 'dialog-modal', name: 'Dialog (Modal)', description: 'Modal dialog pattern.', tags: ['wai-aria', 'pattern', 'dialog', 'modal'], automated: false },
  { id: 'disclosure', name: 'Disclosure', description: 'Show/hide content pattern.', tags: ['wai-aria', 'pattern', 'disclosure', 'navigation'], automated: false },
  { id: 'feed', name: 'Feed', description: 'Scrollable content list pattern.', tags: ['wai-aria', 'pattern', 'list', 'content'], automated: false },
  { id: 'grid', name: 'Grid', description: 'Tabular data grid pattern.', tags: ['wai-aria', 'pattern', 'table', 'composite'], automated: true },
  { id: 'link', name: 'Link', description: 'Navigation link pattern.', tags: ['wai-aria', 'pattern', 'navigation'], automated: true },
  { id: 'listbox', name: 'Listbox', description: 'Selectable list pattern.', tags: ['wai-aria', 'pattern', 'select', 'composite'], automated: true },
  { id: 'menu', name: 'Menu', description: 'Menu of actions pattern.', tags: ['wai-aria', 'pattern', 'navigation', 'menu'], automated: false },
  { id: 'menubar', name: 'Menu Bar', description: 'Menu bar pattern.', tags: ['wai-aria', 'pattern', 'menu'], automated: false },
  { id: 'pagination', name: 'Pagination', description: 'Page navigation pattern.', tags: ['wai-aria', 'pattern', 'navigation'], automated: false },
  { id: 'progressbar', name: 'Progress Bar', description: 'Progress indicator pattern.', tags: ['wai-aria', 'pattern', 'widget'], automated: true },
  { id: 'radio-group', name: 'Radio Group', description: 'Single-selection list pattern.', tags: ['wai-aria', 'pattern', 'input'], automated: false },
  { id: 'scrollable-listbox', name: 'Scrollable Listbox', description: 'Scrollable list pattern.', tags: ['wai-aria', 'pattern', 'listbox'], automated: false },
  { id: 'slider', name: 'Slider', description: 'Range selection pattern.', tags: ['wai-aria', 'pattern', 'input'], automated: true },
  { id: 'spinbutton', name: 'Spin Button', description: 'Numeric input with controls pattern.', tags: ['wai-aria', 'pattern', 'input'], automated: false },
  { id: 'switch', name: 'Switch', description: 'On/off toggle pattern.', tags: ['wai-aria', 'pattern', 'input', 'checkbox'], automated: true },
  { id: 'tabs', name: 'Tabs', description: 'Tab panel navigation pattern.', tags: ['wai-aria', 'pattern', 'navigation', 'composite'], automated: true },
  { id: 'table', name: 'Table', description: 'Data table pattern.', tags: ['wai-aria', 'pattern', 'table'], automated: false },
  { id: 'toolbar', name: 'Toolbar', description: 'Button group toolbar pattern.', tags: ['wai-aria', 'pattern', 'container'], automated: false },
  { id: 'tooltip', name: 'Tooltip', description: 'Popup description pattern.', tags: ['wai-aria', 'pattern', 'popup'], automated: false },
  { id: 'tree-view', name: 'Tree View', description: 'Hierarchical navigation pattern.', tags: ['wai-aria', 'pattern', 'navigation', 'tree', 'composite'], automated: true },
  { id: 'treegrid', name: 'Tree Grid', description: 'Hierarchical table pattern.', tags: ['wai-aria', 'pattern', 'table', 'tree', 'composite'], automated: false }
];

async function main() {
  const rolesDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/accessibility/wai-aria/rules/roles';
  const propsDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/accessibility/wai-aria/rules/properties';
  const patternsDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/accessibility/wai-aria/rules/patterns';

  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  function createRoleRule(role) {
    return {
      id: `wai-aria.role.${role.id}`,
      standard: 'wai-aria',
      version: '1.2',
      category: 'role',
      title: `${role.name} Role`,
      description: role.description,
      appliesTo: { frontend: true },
      severity: 'warning',
      relatedStandards: ['wcag22'],
      tags: role.tags,
      implementation: {
        patterns: [`role="${role.id}"`],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: role.automated,
        manual: !role.automated,
        lint: false
      },
      evidence: {
        requiredArtifacts: role.automated ? ['test-report', 'code-coverage'] : ['manual-review'],
        generators: role.automated ? ['axe-core'] : []
      },
      context: {
        industries: ['government', 'education', 'healthcare', 'finance', 'e-commerce'],
        platforms: ['frontend'],
        criticality: ['medium']
      },
      source: `https://www.w3.org/TR/wai-aria-1.2/#${role.id}`
    };
  }

  function createPropertyRule(prop) {
    return {
      id: `wai-aria.${prop.id}`,
      standard: 'wai-aria',
      version: '1.2',
      category: 'property',
      title: prop.name,
      description: prop.description,
      appliesTo: { frontend: true },
      severity: 'warning',
      relatedStandards: ['wcag22'],
      tags: prop.tags,
      implementation: {
        patterns: [`aria-${prop.id.replace('aria-', '')}`],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: prop.automated,
        manual: !prop.automated,
        lint: false
      },
      evidence: {
        requiredArtifacts: prop.automated ? ['test-report', 'code-coverage'] : ['manual-review'],
        generators: prop.automated ? ['axe-core'] : []
      },
      context: {
        industries: ['government', 'education', 'healthcare', 'finance', 'e-commerce'],
        platforms: ['frontend'],
        criticality: ['medium']
      },
      source: `https://www.w3.org/TR/wai-aria-1.2/#${prop.id.replace('aria-', '')}`
    };
  }

  function createPatternRule(pattern) {
    return {
      id: `wai-aria.pattern.${pattern.id}`,
      standard: 'wai-aria',
      version: '1.2',
      category: 'pattern',
      title: `${pattern.name} Pattern`,
      description: pattern.description,
      appliesTo: { frontend: true },
      severity: 'warning',
      relatedStandards: ['wcag22', 'material3'],
      tags: pattern.tags,
      implementation: {
        patterns: [],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: pattern.automated,
        manual: !pattern.automated,
        lint: false
      },
      evidence: {
        requiredArtifacts: ['manual-review', 'test-plan'],
        generators: []
      },
      context: {
        industries: ['government', 'education', 'healthcare', 'finance', 'e-commerce'],
        platforms: ['frontend'],
        criticality: ['medium']
      },
      source: `https://www.w3.org/TR/wai-aria-1.2/#aria-practices-${pattern.id}`
    };
  }

  console.log(`Generating WAI-ARIA rules...`);

  let count = 0;

  for (const role of WAI_ARIA_ROLES) {
    const rule = createRoleRule(role);
    const filePath = `${rolesDir}/wai-aria.role.${role.id}.json`;
    writeFileSync(filePath, JSON.stringify(rule, null, 2));
    count++;
  }

  for (const prop of WAI_ARIA_STATES_PROPERTIES) {
    const rule = createPropertyRule(prop);
    const filePath = `${propsDir}/wai-aria.${prop.id}.json`;
    writeFileSync(filePath, JSON.stringify(rule, null, 2));
    count++;
  }

  for (const pattern of WAI_ARIA_PATTERNS) {
    const rule = createPatternRule(pattern);
    const filePath = `${patternsDir}/wai-aria.pattern.${pattern.id}.json`;
    writeFileSync(filePath, JSON.stringify(rule, null, 2));
    count++;
  }

  console.log(`Created ${count} WAI-ARIA rule files`);
  console.log(`  - ${WAI_ARIA_ROLES.length} roles`);
  console.log(`  - ${WAI_ARIA_STATES_PROPERTIES.length} states/properties`);
  console.log(`  - ${WAI_ARIA_PATTERNS.length} patterns`);
}

main();