import * as migration_20260917_134356_init from './20260917_134356_init';
import * as migration_20260917_135734_add_teams from './20260917_135734_add_teams';

export const migrations = [
  {
    up: migration_20260917_134356_init.up,
    down: migration_20260917_134356_init.down,
    name: '20260917_134356_init',
  },
  {
    up: migration_20260917_135734_add_teams.up,
    down: migration_20260917_135734_add_teams.down,
    name: '20260917_135734_add_teams'
  },
];
