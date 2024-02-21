# React Multi Search

A react hook to filter data based on multiple search queries.
All values are matched against all search queries (AND).

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

Under construction
