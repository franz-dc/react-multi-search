import React, { useState } from 'react';

import ClickAwayListener from 'react-click-away-listener';

import { type MultiSearchOptions, useMultiSearch } from '../src';

const Basic = <T extends Record<string, unknown>>({
  setFilteredData: _,
  ...props
}: MultiSearchOptions<T>) => {
  const [filteredData, setFilteredData] = useState<T[]>([]);

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
      deleteSearchQuery,
      deleteAllSearchQueries,
      addSearchQuery,
      onSearchFieldSelect,
      onAllSearchFieldSelect,
      onSearchSuggestionSelect,
      onMenuKeyDown,
      openMenu,
      closeMenu,
    },
    inputProps,
    anchorRef,
    listRef,
  } = useMultiSearch({
    setFilteredData,
    ...props,
  });

  return (
    <div style={{ position: 'relative' }}>
      <div ref={anchorRef}>
        <button onClick={openMenu} style={{ minWidth: 130 }}>
          {searchField.label || 'All'}
        </button>
        <input {...inputProps} />
        <button onClick={clearInput} disabled={searchString.length === 0}>
          Clear
        </button>
        <button onClick={addSearchQuery} disabled={searchString.length === 0}>
          Add
        </button>
      </div>
      {searchQueries.length > 0 && (
        <div>
          <p>Search queries:</p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
            }}
          >
            {searchQueries.map((query, index) => (
              <li key={index}>
                <button
                  onClick={() => deleteSearchQuery(index)}
                  style={{ marginRight: '0.5rem' }}
                >
                  X
                </button>
                <span>
                  {query.field === '_default'
                    ? query.value
                    : `${query.fieldLabel}: ${query.value}`}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={deleteAllSearchQueries}>Clear all queries</button>
        </div>
      )}
      {isMenuOpen && (
        <ClickAwayListener onClickAway={closeMenu}>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid',
              position: 'absolute',
              top: '2rem',
              left: 0,
              padding: '1rem',
            }}
          >
            <ul
              ref={listRef}
              onKeyDown={onMenuKeyDown}
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {shownMenu === 'fields' ? (
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
              ) : (
                <>
                  <li>Search suggestions:</li>
                  {searchSuggestions[searchField.value as keyof T]?.map(
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
        </ClickAwayListener>
      )}
      <p>Results: {filteredData.length}</p>
      <table
        style={{
          width: '100%',
          textAlign: 'left',
          borderCollapse: 'collapse',
          border: '1px solid',
        }}
      >
        <thead>
          <tr>
            {props.fields.map((field) => (
              <th key={field.value as string} style={{ border: '1px solid' }}>
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              {props.fields.map((field) => {
                let tdValue = '';

                switch (typeof item[field.value]) {
                  case 'boolean':
                    tdValue = item[field.value] ? 'Yes' : 'No';
                    break;
                  default:
                    tdValue =
                      item[field.value] instanceof Date
                        ? (item[field.value] as Date).toLocaleDateString()
                        : String(item[field.value]);
                }

                return (
                  <td
                    key={field.value as string}
                    style={{ border: '1px solid' }}
                  >
                    {tdValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Basic;
