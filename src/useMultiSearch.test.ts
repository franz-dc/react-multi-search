import { useState } from 'react';

import { act, renderHook } from '@testing-library/react';

import {
  FieldWithSuggestions,
  FieldWithoutSuggestions,
  useMultiSearch,
} from './useMultiSearch';

describe('useMultiSearch', () => {
  const initialData = [
    {
      id: '0',
      name: 'Alice',
      birthDate: new Date('1990-01-01'),
      isEmployed: true,
      favoriteNumber: 7,
      favoriteColor: 'Light Blue',
    },
    {
      id: '1',
      name: 'Bob',
      birthDate: new Date('1991-11-04'),
      isEmployed: false,
      favoriteNumber: 8,
      favoriteColor: 'Blue',
    },
    {
      id: '2',
      name: 'Charlie',
      birthDate: new Date('1992-07-25'),
      isEmployed: true,
      favoriteNumber: 9,
      favoriteColor: 'Blue',
    },
    {
      id: '3',
      name: 'David',
      birthDate: new Date('1993-03-15'),
      isEmployed: false,
      favoriteNumber: 10,
      favoriteColor: 'Light Blue',
    },
    {
      id: '4',
      name: 'Eve',
      birthDate: new Date('1994-12-31'),
      isEmployed: true,
      favoriteNumber: 11,
      favoriteColor: 'Blue',
    },
  ];

  type Schema = (typeof initialData)[number];

  const fields: (
    | FieldWithSuggestions<Schema>
    | FieldWithoutSuggestions<Schema>
  )[] = [
    {
      value: 'name',
      label: 'Name',
    },
    {
      value: 'birthDate',
      label: 'Birth Date',
    },
    {
      value: 'isEmployed',
      label: 'Is Employed',
      showSearchSuggestions: true,
    },
    {
      value: 'favoriteNumber',
      label: 'Favorite Number',
    },
    {
      value: 'favoriteColor',
      label: 'Favorite Color',
      showSearchSuggestions: true,
      strictSuggestions: true,
    },
  ];

  it('should return all items if the query is empty', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return filteredData;
    });

    expect(result.current).toEqual(initialData);
  });

  it('should filter globally', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: 'Bob' } });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    expect(result.current.filteredData).toEqual([initialData[1]]);
  });

  it('should filter by field', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: '<=9' } });
      result.current.actions.onSearchFieldSelect({
        value: 'favoriteNumber',
        label: 'Favorite Number',
      });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    expect(result.current.filteredData).toEqual([
      initialData[0],
      initialData[1],
      initialData[2],
    ]);
  });

  it('should filter with multiple queries', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: '< June 1993' } });
      result.current.actions.onSearchFieldSelect({
        value: 'birthDate',
        label: 'Birth Date',
      });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: '"blue"' } });
      result.current.actions.onSearchFieldSelect({
        value: 'favoriteColor',
        label: 'Favorite Color',
      });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    expect(result.current.filteredData).toEqual([
      initialData[1],
      initialData[2],
    ]);
  });

  it('should return all items when all queries are removed', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: 'Bob' } });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    act(() => {
      result.current.actions.deleteAllSearchQueries();
    });

    expect(result.current.filteredData).toEqual(initialData);
  });

  it('should show search suggestions', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.actions.onSearchFieldSelect({
        value: 'isEmployed',
        label: 'Is Employed',
        showSearchSuggestions: true,
      });
    });

    expect(result.current.states.searchSuggestions.isEmployed).toEqual([
      'Yes',
      'No',
    ]);
  });

  it('should categorize data when categorizer is provided', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
        categorizer: (data) =>
          data.reduce<Record<'employed' | 'unemployed', Schema[]>>(
            (acc, item) => {
              if (item.isEmployed) {
                acc.employed.push(item);
              } else {
                acc.unemployed.push(item);
              }

              return acc;
            },
            { employed: [], unemployed: [] }
          ),
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    expect(result.current.filteredData).toEqual({
      employed: [initialData[0], initialData[2], initialData[4]],
      unemployed: [initialData[1], initialData[3]],
    });
  });

  it('should filter categorized data', () => {
    const { result } = renderHook(() => {
      const [filteredData, setFilteredData] = useState<Schema[]>([]);

      const multiSearch = useMultiSearch({
        initialData,
        setFilteredData,
        fields,
        categorizer: (data) =>
          data.reduce<Record<'employed' | 'unemployed', Schema[]>>(
            (acc, item) => {
              if (item.isEmployed) {
                acc.employed.push(item);
              } else {
                acc.unemployed.push(item);
              }

              return acc;
            },
            { employed: [], unemployed: [] }
          ),
      });

      return {
        filteredData,
        ...multiSearch,
      };
    });

    act(() => {
      // @ts-ignore
      result.current.inputProps.onChange({ target: { value: '0' } });
      result.current.actions.onSearchFieldSelect({
        value: 'isEmployed',
        label: 'Is Employed',
        showSearchSuggestions: true,
      });
    });

    act(() => {
      result.current.actions.addSearchQuery();
    });

    expect(result.current.filteredData).toEqual({
      unemployed: [initialData[1], initialData[3]],
    });
  });
});
