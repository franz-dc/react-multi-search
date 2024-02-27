# React Multi Search

A react hook to filter data based on multiple search queries.

![NPM License](https://img.shields.io/npm/l/react-multi-search)
![NPM Version](https://img.shields.io/npm/v/react-multi-search)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-multi-search)
![NPM Type Definitions](https://img.shields.io/npm/types/react-multi-search)

## Features

- 🗃️ Support for various data types
- 📈 Range queries for numbers and dates
- 📜 Search suggestions
- 📊 Support for categorized data
- ✨ Headless, bring your own UI
- 🌐 TypeScript support

## Supported data types

- String
  - Can be case-sensitive or case-insensitive (default).
  - Exact matches can be done by enclosing the query in double quotes.
  - Can come with search suggestions, which is the aggregated possible
    values for a specific field.
- Boolean
  - Support for various truthy and falsy queries (`true`, `yes`, `1`, etc.)
    or provide your own.
- Number
  - Support for range queries with operators: `>`, `>=`, `<`, `<=`, and `!=`.
- Date
  - Support for range queries with operators like numbers.
  - Time and timezone are ignored.

_Other data types will be treated as strings._

## Demo

To see the hook in action, you can check the [Storybook demo](https://franz-dc.github.io/react-multi-search).

## Installation

npm:

```sh
npm i react-multi-search
```

yarn:

```sh
yarn add react-multi-search
```

## Usage

```jsx
import { useState } from 'react';
import { useMultiSearch } from 'react-multi-search';

const MyComponent = () => {
  const initialData = [
    { name: 'John Doe', age: 20, gender: 'Male' },
    { name: 'Jane Doe', age: 25, gender: 'Female' },
    // ...
  ];

  const [filteredData, setFilteredData] = useState([]);

  const {
    states: {
      searchString,
      searchField,
      searchSuggestions,
      searchQueries,
      isMenuOpen,
      shownMenu,
    },
    actions: {
      clearInput,
      addSearchQuery,
      deleteSearchQuery,
      deleteAllSearchQueries,
      onMenuKeyDown,
      onSearchFieldSelect,
      onAllSearchFieldSelect,
      onSearchSuggestionSelect,
      openMenu,
    },
    inputProps,
    anchorRef,
    listRef,
  } = useMultiSearch({
    initialData,
    setFilteredData,
    fields: [
      { value: 'name', label: 'Name' },
      { value: 'age', label: 'Age' },
      { value: 'gender', label: 'Gender', showSearchSuggestions: true },
    ],
  });

  return (
    <>
      {/* search bar ------------------------------------------------------- */}
      <div ref={anchorRef}>
        <button onClick={openMenu}>{searchField.label || 'All'}</button>
        <input {...inputProps} />
        <button onClick={clearInput}>Clear</button>
        <button onClick={addSearchQuery}>Add</button>
      </div>

      {/* search queries --------------------------------------------------- */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
        }}
      >
        {searchQueries.map((query, index) => (
          <li key={index}>
            <span>
              {query.field === '_default'
                ? query.value
                : `${query.fieldLabel}: ${query.value}`}
            </span>
            <button onClick={() => deleteSearchQuery(index)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={deleteAllSearchQueries}>Clear all queries</button>

      {/* dropdown menu ---------------------------------------------------- */}
      {isMenuOpen && (
        <div>
          <ul ref={listRef} onKeyDown={onMenuKeyDown}>
            {shownMenu === 'fields' && (
              <>
                <li>Search by:</li>
                <li>
                  <button
                    onClick={onAllSearchFieldSelect}
                    disabled={searchField.value === '_default'}
                  >
                    All
                  </button>
                </li>
                {...props.fields.map((field) => (
                  <li key={field.value as string}>
                    <button
                      onClick={() => onSearchFieldSelect(field)}
                      disabled={searchField.value === field.value}
                    >
                      {field.label}
                    </button>
                  </li>
                ))}
              </>
            )}
            {shownMenu === 'searchSuggestions' && (
              <>
                <li>Search suggestions:</li>
                {searchSuggestions?.map(
                  (value) => (
                    <li key={value}>
                      <button onClick={() => onSearchSuggestionSelect(value)}>
                        {value}
                      </button>
                    </li>
                  )
                ) ?? <li>No suggestions</li>}
              </>
            )}
          </ul>
        </div>
      )}

      {/* ... */}
    </>
  );
};
```

See the [demo code](https://github.com/franz-dc/react-multi-search/blob/main/stories/Basic.tsx) for a more comprehensive example.

## API

### Options

- `initialData` (required)

  - `T[]`
  - The initial data to filter. This should be an array of objects without categorization. If you want to categorize your data, use the separate `categorizer` function.

- `setFilteredData` (required)

  - `Dispatch<SetStateAction<T[]>> | Dispatch<SetStateAction<Record<string, T[]>>>`
  - setState function to update the filtered data.
  - Since this is a headless hook, the filtered data should be managed by the consuming component for reusability.

- [`fields`](#field-options) (required)

  - `(FieldWithSuggestions<T> | FieldWithoutSuggestions<T>)[]`
  - The fields to search in. Each item in the array can be of type `FieldWithSuggestions<T>` where all keys should have the value of type `string` or `boolean`, or `FieldWithoutSuggestions<T>` for other data types.

- `categorizer`

  - `(data: T[]) => Record<string, (T | Record<string, unknown>)[]>`
  - Function to categorize and group the filtered data.
  - This is separated from `initialData` to optimize performance when filtering.

- `showEmptyCategories`

  - `boolean`
  - Defaults to `false`.
  - Show categories that have no items.
  - This is only used when `categorizer` is provided.

- `shouldInitialize`

  - `boolean`
  - Defaults to `true`.
  - Control whether the hook should initialize or not.
  - This is useful when you want to delay the initialization of the hook until the data is ready.

- `caseSensitive`

  - `boolean`
  - Defaults to `false`.
  - Whether the comparison should be case-sensitive or not.

- `trueLabel`

  - `string`
  - Defaults to `Yes`.
  - The label for `true` value on search suggestions.

- `falseLabel`

  - `string`
  - Defaults to `No`.
  - The label for `false` value on search suggestions.

- `truthyValues`

  - `string[]`
  - Defaults to `['true', '1', 'on', 'yes', 'y', 't', '✓']`
  - A list of truthy values to match against boolean values.

- `falsyValues`

  - `string[]`
  - Defaults to `['false', '0', 'off', 'no', 'n', 'f', 'x']`
  - A list of falsy values to match against boolean values.

### Field Options

- `fields[number].value` (required)

  - `{ [K in keyof T]: T[K] extends string | boolean ? K : never; }[keyof T]` for `FieldWithSuggestions<T>`
  - `{ [K in keyof T]: T[K] extends string | boolean ? never : K; }[keyof T]` for `FieldWithoutSuggestions<T>`
  - The field to search.

- `fields[number].label` (required)

  - `string`
  - The label for the field.

- `fields[number].showSearchSuggestions`

  - `boolean` (default: `false`)
  - Show search suggestions for this field.
  - This only applies to `FieldWithoutSuggestions`

- `fields[number].strictSuggestions`

  - `boolean` (default: `false`)
  - Enclose suggestions in double quotes to treat as exact match.
  - This only applies to `FieldWithoutSuggestions`

### Return Value

- `states` - Usable states for the search filter.

  - `searchString`

    - `string`
    - The current search string.

  - `searchField`

    - `string[]`
    - Selected field to search.

  - `searchSuggestions`

    - `FieldWithSuggestions<T> | FieldWithoutSuggestions<T> | { value: '_default'; label: ''; }`
    - Search suggestions for the selected field.

  - [`searchQueries`](#search-query)

    - `SearchQuery<T>[]`
    - Current search queries.

  - `isMenuOpen`

    - `boolean`
    - Dropdown menu open state.

  - `shownMenu`

    - `'fields' | 'searchSuggestions'`
    - The type of dropdown menu currently shown.

  - `isFiltered`

    - `boolean`
    - Whether the data is filtered or not.

  - `isInitialized`

    - `boolean`
    - Whether the hook is initialized or not.

- `actions` - Actions to interact with the search filter.

  - `clearInput`

    - `() => void`
    - Clear the search input.

  - `addSearchQuery`

    - `() => void`
    - Trigger to add the current search string and field as a search query.

  - `deleteSearchQuery`

    - `(idx: number) => void`
    - Delete a search query by index.

  - `deleteAllSearchQueries`

    - `() => void`
    - Delete all search queries.

  - `onMenuKeyDown`

    - `(e: KeyboardEvent<HTMLUListElement>) => void`
    - Event handler to handle key down events on the menu.

  - `onSearchFieldSelect`

    - `(field: FieldWithSuggestions<T> | FieldWithoutSuggestions<T> | { value: '_default'; label: ''; }) => void`
    - Event handler to handle field selection.

  - `onAllSearchFieldSelect`

    - `() => void`
    - Event handler to handle "All" field selection.

  - `onSearchSuggestionSelect`

    - `(value: string) => void`
    - Event handler to handle search suggestion selection.

  - `openMenu`

    - `() => void`
    - Open the dropdown menu.

  - `closeMenu`

    - `() => void`
    - Close the dropdown menu.

- `inputProps` - Props passed to the input element (search bar).

  - `onChange`

    - `(e: ChangeEvent<HTMLInputElement>) => void`
    - Event handler to handle input change.

  - `onKeyDown`

    - `(e: KeyboardEvent<HTMLInputElement>) => void`
    - Event handler to handle key down events on the input.
    - Includes handling various keys: `Enter`, `Escape`, `Backspace`, `ArrowDown`, and field selection (`:`).

  - `onPaste`

    - `(e: ClipboardEvent<HTMLInputElement>) => void`
    - Event handler to handle paste events on the input.
    - Primarily for separating search field and string.

  - `onFocus`

    - `() => void`
    - Event handler to handle focus events on the input.
    - Used for opening the dropdown menu.

  - `onBlur`

    - `() => void`
    - Event handler to handle blur events on the input.

  - `value`

    - `string`
    - Same as `searchString`.

  - `ref`

    - `RefObject<HTMLInputElement>`
    - Ref forwarded to the input element.

- `anchorRef` - Ref forwarded to the anchor element (search bar wrapper).

- `listRef` - Ref forwarded to the dropdown menu list element (`ul`).

### Search Query

- `field`

  - `keyof T | '_default'`
  - The field to search.

- `fieldLabel`

  - `string`
  - The label to display.

- `value`

  - `string`
  - Query string to match.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

Before submitting a pull request, please make sure to test your changes and update the documentation if necessary.

## License

This project is licensed under the [MIT License](https://github.com/franz-dc/react-multi-search/blob/main/LICENSE)
