# React Multi Search

A react hook to filter data based on multiple search queries.

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

## Installation

npm:

```sh
npm i react-multi-search
```

yarn:

```sh
yarn add react-multi-search
```

## Simple usage

```tsx
// Under construction
```

## API

### Options

- `initialData`\*

  - `T[]`
  - The initial data to filter. This should be an array of objects without categorization. If you want to categorize your data, use the separate `categorizer` function.

- `setFilteredData`\*

  - `Dispatch<SetStateAction<T[]>> | Dispatch<SetStateAction<Record<string, T[]>>>`
  - setState function to update the filtered data.
  - Since this is a headless hook, the filtered data should be managed by the consuming component.

- [`fields`\*](#field-options)

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

\* _Required_

### Field Options

```ts
fields: (FieldWithSuggestions<T> | FieldWithoutSuggestions<T>)[];
```

- `fields[number].value`\*

  - `{ [K in keyof T]: T[K] extends string | boolean ? K : never; }[keyof T]` for `FieldWithSuggestions<T>`
  - `{ [K in keyof T]: T[K] extends string | boolean ? never : K; }[keyof T]` for `FieldWithoutSuggestions<T>`
  - The field to search.

- `fields[number].label`\*

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
