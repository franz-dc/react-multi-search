import React, { useState } from 'react';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';
import ClickAwayListener from 'react-click-away-listener';

import {
  type FieldWithSuggestions,
  type FieldWithoutSuggestions,
  type MultiSearchOptions,
  useMultiSearch,
} from '../src';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const createData = (amount: number) =>
  Array.from({ length: amount }, () => {
    const sex = faker.person.sex() as 'male' | 'female';

    return {
      id: faker.string.uuid(),
      name: faker.person.fullName({ sex }),
      sex: capitalize(sex),
      birthDate: faker.date.birthdate({
        min: 1970,
        max: 2000,
        mode: 'year',
      }),
      favoriteNumber: faker.number.int({ min: 1, max: 100 }),
      favoriteColor: capitalize(faker.color.human()),
      isEmployed: faker.datatype.boolean(),
    };
  });

type Schema = ReturnType<typeof createData>[number];

const fields = [
  {
    value: 'name',
    label: 'Name',
  },
  {
    value: 'sex',
    label: 'Sex',
    showSearchSuggestions: true,
    strictSuggestions: true,
  },
  {
    value: 'birthDate',
    label: 'Birth Date',
  },
  {
    value: 'favoriteNumber',
    label: 'Favorite Number',
  },
  {
    value: 'favoriteColor',
    label: 'Favorite Color',
    showSearchSuggestions: true,
  },
  {
    value: 'isEmployed',
    label: 'Employed',
    showSearchSuggestions: true,
  },
] satisfies (FieldWithSuggestions<Schema> | FieldWithoutSuggestions<Schema>)[];

export type BasicProps = {
  test?: string;
} & MultiSearchOptions<Schema>;

const Basic = ({ setFilteredData: _, ...props }: BasicProps) => {
  const [filteredData, setFilteredData] = useState<Schema[]>([]);

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
                  {searchSuggestions[searchField.value as keyof Schema]?.map(
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
          {(filteredData as unknown as Schema[]).map((item) => (
            <tr key={item.id}>
              {props.fields.map((field) => {
                let tdValue = '';

                switch (typeof item[field.value as string]) {
                  case 'boolean':
                    tdValue = item[field.value as string] ? 'Yes' : 'No';
                    break;
                  case 'number':
                    tdValue = item[field.value as string].toString();
                    break;
                  default:
                    tdValue =
                      item[field.value as string] instanceof Date
                        ? item[field.value as string].toLocaleDateString()
                        : item[field.value as string];
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

const meta: Meta<typeof Basic> = {
  title: 'useMultiSearch/Basic',
  component: Basic,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialData: createData(20),
    fields,
  },
};
