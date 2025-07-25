import {
  type ChangeEvent,
  type ClipboardEvent,
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { type IsQueryMatchOptions, isQueryMatch } from './isQueryMatch';
import { usePrevious } from './usePrevious';

export type SearchQuery<T extends Record<string, unknown>> = {
  /**
   * The field to search.
   */
  field: keyof T | '_default'; // internal `_default` will use all field values
  /**
   * The label to display.
   */
  fieldLabel: string; // to avoid unnecessary lookups in the `fields` prop
  /**
   * Query string to match.
   */
  value: string;
};

export type FieldWithSuggestions<T extends Record<string, unknown>> = {
  /**
   * The field to search.
   */
  value: {
    [K in keyof T]: T[K] extends string | boolean ? K : never;
  }[keyof T];
  /**
   * The label to display.
   */
  label: string;
  /**
   * Show search suggestions for this field.
   */
  showSearchSuggestions?: boolean;
  /**
   * Enclose suggestions in double quotes to treat as exact match.
   */
  strictSuggestions?: boolean;
  /**
   * The search suggestions for this field.
   *
   * If provided, it will be used instead of computing the suggestions.
   */
  searchSuggestions?: T[FieldWithSuggestions<T>['value']][];
};

export type FieldWithoutSuggestions<T extends Record<string, unknown>> = {
  /**
   * The field to search.
   */
  value: {
    [K in keyof T]: T[K] extends string | boolean ? never : K;
  }[keyof T];
  /**
   * The label to display.
   */
  label: string;
};

export type MultiSearchOptions<T extends Record<string, unknown>> = {
  /**
   * The initial data to filter.
   */
  initialData: T[];
  /**
   * setState function to update the filtered data.
   */
  setFilteredData:
    | Dispatch<SetStateAction<T[]>>
    | Dispatch<SetStateAction<Record<string, T[]>>>;
  /**
   * The fields to search.
   *
   * `showSearchSuggestions` is optional and only applicable to string and boolean
   * fields.
   */
  fields: (FieldWithSuggestions<T> | FieldWithoutSuggestions<T>)[];
  // ? Why setFilteredData gives an error when returning T[] in categorizer?
  /**
   * Function to categorize and group the filtered data.
   *
   * This is separated from `initialData` to optimize performance when
   * filtering.
   */
  categorizer?: (data: T[]) => Record<string, (T | Record<string, unknown>)[]>;
  /**
   * Show categories that have no items.
   */
  showEmptyCategories?: boolean;
  /**
   * Label for `true` value on search suggestions.
   *
   * @default Yes
   */
  trueLabel?: string;
  /**
   * Label for `false` value on search suggestions.
   *
   * @default No
   */
  falseLabel?: string;
  /**
   * Control whether the hook should initialize or not.
   *
   * This is useful when you want to delay the initialization of the hook
   * until the data is ready.
   */
  shouldInitialize?: boolean;
  /**
   * Default field to use when field is not specified.
   *
   * This will disable the global search functionality.
   */
  globalSearchReplacement?: keyof T;
  /**
   * Override existing queries with the same field.
   */
  overrideExistingQueriesWithSameField?: boolean;
} & IsQueryMatchOptions;

export type MultiSearch<T extends Record<string, unknown>> = {
  /**
   * Usable states for the search filter.
   */
  states: {
    /**
     * The current search string.
     */
    searchString: string;
    /**
     * Selected field to search.
     */
    searchField:
      | FieldWithSuggestions<T>
      | FieldWithoutSuggestions<T>
      | {
          value: '_default';
          label: '';
        };
    /**
     * Search suggestions for the selected field.
     */
    searchSuggestions: Record<keyof T, string[]>;
    /**
     * Current search queries.
     */
    searchQueries: SearchQuery<T>[];
    /**
     * Dropdown menu open state.
     */
    isMenuOpen: boolean;
    /**
     * The type of dropdown menu currently shown.
     */
    shownMenu: 'fields' | 'searchSuggestions';
    /**
     * Whether the data is filtered or not.
     */
    isFiltered: boolean;
    /**
     * Whether the hook is initialized or not.
     */
    isInitialized: boolean;
  };
  /**
   * Actions to interact with the search filter.
   */
  actions: {
    /**
     * Trigger to clear the search string and selected field.
     */
    clearInput: () => void;
    /**
     * Trigger to add the current search string and field as a search query.
     */
    addSearchQuery: () => void;
    /**
     * Delete a search query by index.
     */
    deleteSearchQuery: (index: number) => void;
    /**
     * Delete all search queries.
     */
    deleteAllSearchQueries: () => void;
    /**
     * Event handler to handle key down events on the menu.
     */
    onMenuKeyDown: (e: KeyboardEvent<HTMLUListElement>) => void;
    /**
     * Event handler to handle field selection.
     */
    onSearchFieldSelect: (
      field:
        | FieldWithSuggestions<T>
        | FieldWithoutSuggestions<T>
        | {
            value: '_default';
            label: '';
          }
    ) => void;
    /**
     * Event handler to handle "All" field selection.
     */
    onAllSearchFieldSelect: () => void;
    /**
     * Event handler to handle search suggestion selection.
     */
    onSearchSuggestionSelect: (value: string) => void;
    /**
     * Open the dropdown menu.
     */
    openMenu: () => void;
    /**
     * Close the dropdown menu.
     */
    closeMenu: (event: Event | SyntheticEvent) => void;
  };
  /**
   * Props passed to the input element (search bar).
   */
  inputProps: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent) => void;
    onPaste: (e: ClipboardEvent) => void;
    onFocus: () => void;
    onBlur: () => void;
    value: string;
    ref: RefObject<HTMLInputElement>;
  };
  /**
   * Ref forwarded to the anchor element (search bar wrapper).
   */
  anchorRef: RefObject<HTMLDivElement>;
  /**
   * Ref forwarded to the dropdown menu list element (`ul`).
   */
  listRef: RefObject<HTMLUListElement>;
};

/**
 * A hook to filter data based on multiple search queries.
 * All values are matched against all search queries (AND).
 *
 * Supported data types:
 * - String
 *   - Can be case-sensitive or case-insensitive (default).
 *   - Exact matches can be done by enclosing the query in double quotes.
 *   - Can come with search suggestions, which is the aggregated possible
 *     values for a specific field.
 * - Boolean
 *   - Support for various truthy and falsy queries (`true`, `yes`, `1`, etc.)
 *     or provide your own.
 * - Number
 *   - Support for range queries with operators: `>`, `>=`, `<`, `<=`, and `!=`.
 * - Date
 *   - Support for range queries with operators like numbers.
 *   - Time and timezone are ignored.
 *
 * Other data types will be treated as strings.
 */
export const useMultiSearch = <T extends Record<string, unknown>>({
  initialData,
  setFilteredData,
  fields,
  categorizer,
  showEmptyCategories,
  trueLabel = 'Yes',
  falseLabel = 'No',
  shouldInitialize = true,
  globalSearchReplacement,
  overrideExistingQueriesWithSameField,
  ...isQueryMatchOptions
}: MultiSearchOptions<T>): MultiSearch<T> => {
  const [isInitialized, setIsInitialized] = useState(false);

  const categorizedInitialData = categorizer?.(initialData);

  // Search queries that are used to filter the data
  const [searchQueries, setSearchQueries] = useState<SearchQuery<T>[]>([]);

  const prevSearchQueries = usePrevious(searchQueries);

  // Infinite loop workaround
  const [isFiltered, setIsFiltered] = useState(false);

  // Reset filtered data when initial data changes
  useEffect(() => {
    if (!shouldInitialize) return;
    setIsInitialized(false);
    setIsFiltered(false);
  }, [initialData, shouldInitialize]);

  // Update the data when the search queries change
  useEffect(() => {
    if (!shouldInitialize) return;
    if (isFiltered) return;

    if (searchQueries.length === 0) {
      // Data is `Record<string, T[]>` when categorizer is provided.
      // Just ignore the type error for now to avoid type gymnastics.
      // @ts-ignore
      setFilteredData(categorizedInitialData || initialData);
      setIsInitialized(true);
      setIsFiltered(true);
      return;
    }

    // Optimization logic:
    // Check if the new search queries exist in the previous search queries in
    // the same order. If so, only filter the data that was already filtered.
    // This is to avoid filtering the entire data if there are just additional
    // search queries.
    const isSearchQueriesSubset = prevSearchQueries.every(
      (query, idx) =>
        searchQueries[idx]?.field === query.field &&
        searchQueries[idx]?.value === query.value
    );

    const filterData = (data: T[]) =>
      data.filter((row) => {
        return searchQueries.every((query) => {
          // Search all specified in the `fields` prop if the field is `_default`
          if (query.field === '_default') {
            return fields.some((field) => {
              return isQueryMatch(
                row[field.value],
                query.value,
                isQueryMatchOptions
              );
            });
          }

          // Search the specific field
          return isQueryMatch(
            row[query.field],
            query.value,
            isQueryMatchOptions
          );
        });
      });

    const filterCategorizedData = (prev: Record<string, T[]>) =>
      Object.entries(
        isSearchQueriesSubset
          ? (prev as unknown as Record<string, T[]>)
          : (categorizedInitialData as unknown as Record<string, T[]>)
      ).map(([key, value]) => [key, filterData(value)]);

    setFilteredData((prev: T[] | Record<string, T[]>) =>
      categorizer
        ? Object.fromEntries(
            showEmptyCategories
              ? filterCategorizedData(prev as Record<string, T[]>)
              : filterCategorizedData(prev as Record<string, T[]>).filter(
                  ([, v]) => (v as T[]).length > 0
                )
          )
        : filterData(
            isSearchQueriesSubset ? (prev as T[]) : (initialData as T[])
          )
    );

    setIsInitialized(true);
    setIsFiltered(true);
  }, [
    searchQueries,
    categorizedInitialData,
    initialData,
    fields,
    setFilteredData,
    isFiltered,
    prevSearchQueries,
    categorizer,
    showEmptyCategories,
    isQueryMatchOptions,
    shouldInitialize,
  ]);

  // Searchbar states to handle the input value.
  const [searchString, setSearchString] = useState('');
  const [searchField, setSearchField] = useState<
    MultiSearchOptions<T>['fields'][number] | { value: '_default'; label: '' }
  >({
    value: '_default',
    label: '',
  });

  const fieldLabels = fields.map((field) => field.label.toLowerCase());

  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Normally, the menu will show on input focus + field value is `_default`
  // + `searchString` is empty. This state is used to override that behavior
  // when the user explicitly selects the "All" (`_default`) option.
  const [isExplicitAll, setIsExplicitAll] = useState(false);

  // Dropdown menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setIsMenuOpen(false);
  };

  // Search suggestions (strings and booleans only):
  // Suggestions for each field is cached to avoid unnecessary lookups.
  // Only requested fields are computed and cached to optimize performance.
  const [searchSuggestions, setSearchSuggestions] = useState<
    Record<keyof T, string[]>
  >({} as Record<keyof T, string[]>);

  useEffect(() => {
    if (
      (searchField as FieldWithSuggestions<T>).showSearchSuggestions &&
      !searchSuggestions[searchField.value as string]
    ) {
      // use provided search suggestions if available
      if ((searchField as FieldWithSuggestions<T>).searchSuggestions) {
        setSearchSuggestions((prev) => ({
          ...prev,
          [searchField.value]: (searchField as FieldWithSuggestions<T>)
            .searchSuggestions!,
        }));
        return;
      }

      setSearchSuggestions((prev) => {
        // Boolean fields
        if (
          initialData.some((row) => typeof row[searchField.value] === 'boolean')
        ) {
          return {
            ...prev,
            [searchField.value]: [trueLabel, falseLabel],
          };
        }

        // String fields
        return {
          ...prev,
          [searchField.value]: Array.from(
            new Set(
              initialData
                .map((row) => row[searchField.value as string] as string)
                .filter(Boolean)
            )
          ),
        };
      });
    }
  }, [initialData, searchSuggestions, searchField, trueLabel, falseLabel]);

  const shownMenu: 'fields' | 'searchSuggestions' =
    (searchField as FieldWithSuggestions<T>).showSearchSuggestions &&
    inputRef.current === document.activeElement
      ? 'searchSuggestions'
      : 'fields';

  // Menu related props / event handlers
  const onMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setIsMenuOpen(false);
    } else if (e.key === 'Escape') {
      setIsMenuOpen(false);
    }
  };

  const onSearchFieldSelect = (
    field:
      | FieldWithSuggestions<T>
      | FieldWithoutSuggestions<T>
      | { value: '_default'; label: '' }
  ) => {
    if (field.value === '_default') {
      setIsExplicitAll(true);
    }
    setSearchField(field);
    inputRef.current?.focus();
    setIsMenuOpen(!!(field as FieldWithSuggestions<T>).showSearchSuggestions);
  };

  const onAllSearchFieldSelect = () => {
    onSearchFieldSelect({ value: '_default', label: '' });
  };

  const onSearchSuggestionSelect = (value: string) => {
    setSearchQueries((prev) => [
      ...prev,
      {
        field: searchField.value as string,
        fieldLabel: searchField.label,
        value: (searchField as FieldWithSuggestions<T>).strictSuggestions
          ? `"${value}"`
          : value,
      },
    ]);
    setIsFiltered(false);
    setSearchString('');
    setSearchField({ value: '_default', label: '' });
    inputRef.current?.focus();
    setIsMenuOpen(false);
  };

  // Input related props / event handlers
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchString(e.target.value);

  const clearInput = () => {
    setSearchString('');
    setIsFiltered(false);
    setSearchField({ value: '_default', label: '' });
    setIsMenuOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // Add the search query on enter
    if (e.key === 'Enter' && searchString.length > 0) {
      e.preventDefault();
      addSearchQuery();
    }
    // Hide the menu on escape
    else if (e.key === 'Escape') {
      if (
        searchString.length === 0 &&
        searchField.value !== '_default' &&
        !isMenuOpen
      ) {
        setSearchField({ value: '_default', label: '' });
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    }
    // Reset the field to `_default` on backspace when `searchString` is empty
    else if (
      e.key === 'Backspace' &&
      searchField.value !== '_default' &&
      searchString.length === 0
    ) {
      setSearchField({ value: '_default', label: '' });
      setIsMenuOpen(true);
    }
    // Handle field selection by manual typing
    else if (e.key === ':' && searchField.value === '_default') {
      e.preventDefault();
      const fieldStr = searchString.toLowerCase().split(':')[0];
      const fieldIdx = fieldLabels.indexOf(fieldStr!);
      if (fieldIdx !== -1) {
        setSearchField(fields[fieldIdx] as FieldWithSuggestions<T>);
        setSearchString('');
        setIsMenuOpen(
          !!(fields[fieldIdx] as FieldWithSuggestions<T>).showSearchSuggestions
        );
      } else {
        setSearchString((prev) => prev + ':');
      }
    }
    // Focus first option in the menu on arrow down or tab
    else if (e.key === 'ArrowDown' && isMenuOpen) {
      e.preventDefault();
      (listRef.current?.children[1] as HTMLLIElement | null)?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    const clipboardData = e.clipboardData?.getData('Text');
    if (clipboardData?.includes(':')) {
      const fieldStr = clipboardData.split(':')[0];
      const fieldIdx = fieldLabels.indexOf(fieldStr!);
      if (fieldIdx !== -1) {
        e.preventDefault();
        setSearchField(fields[fieldIdx] as FieldWithSuggestions<T>);
        setSearchString(clipboardData.split(':')[1]!);
        setIsMenuOpen(
          !!(fields[fieldIdx] as FieldWithSuggestions<T>).showSearchSuggestions
        );
      }
    }
  };

  const onFocus = () => {
    if (
      !isExplicitAll &&
      searchField.value === '_default' &&
      searchString.length === 0 &&
      inputRef.current
    ) {
      setIsMenuOpen(true);
    } else if (
      searchField.value !== '_default' &&
      searchString.length === 0 &&
      (searchField as FieldWithSuggestions<T>).showSearchSuggestions
    ) {
      setIsMenuOpen(true);
    }
  };

  const onBlur = () => {
    setIsExplicitAll(false);
  };

  // Search query related props
  const addSearchQuery = () => {
    const newQuery = {
      field:
        globalSearchReplacement && searchField.value === '_default'
          ? globalSearchReplacement
          : (searchField.value as string),
      fieldLabel:
        globalSearchReplacement && searchField.value === '_default'
          ? fields.find((f) => f.value === globalSearchReplacement)?.label || ''
          : searchField.label,
      value: searchString.trim(),
    };

    if (overrideExistingQueriesWithSameField) {
      setSearchQueries((prev) =>
        prev.filter((q) => q.field !== newQuery.field).concat(newQuery)
      );
    } else {
      setSearchQueries((prev) => [...prev, newQuery]);
    }

    setIsFiltered(false);
    setSearchString('');
    setSearchField({ value: '_default', label: '' });
    setIsMenuOpen(false);
    inputRef.current?.focus();
  };

  const deleteSearchQuery = (idx: number) => {
    setSearchQueries((prev) => prev.filter((_, i) => i !== idx));
    setIsFiltered(false);
  };

  const deleteAllSearchQueries = () => {
    setSearchQueries([]);
    setIsFiltered(false);
  };

  return {
    states: {
      searchString,
      searchField,
      searchSuggestions,
      searchQueries,
      isMenuOpen,
      shownMenu,
      isFiltered,
      isInitialized,
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
      closeMenu,
    },
    inputProps: {
      onChange,
      onKeyDown,
      onPaste,
      onFocus,
      onBlur,
      value: searchString,
      ref: inputRef,
    },
    anchorRef,
    listRef,
  };
};
