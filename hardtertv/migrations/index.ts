import * as migration_20260917_134356_init from './20260917_134356_init';

export const migrations = [
  {
    up: migration_20260917_134356_init.up,
    down: migration_20260917_134356_init.down,
    name: '20260917_134356_init'
  },
];
