import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';

import {
  type FieldWithSuggestions,
  type FieldWithoutSuggestions,
} from '../src';

import Basic from './Basic';

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
