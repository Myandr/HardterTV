import * as migration_20260917_134356_init from './20260917_134356_init';
import * as migration_20260917_135734_add_teams from './20260917_135734_add_teams';
import * as migration_20260919_094211_add_board_members from './20260919_094211_add_board_members';
import * as migration_20260919_102241_add_events from './20260919_102241_add_events';
import * as migration_20260919_141246_add_gallery_albums from './20260919_141246_add_gallery_albums';

export const migrations = [
  {
    up: migration_20260917_134356_init.up,
    down: migration_20260917_134356_init.down,
    name: '20260917_134356_init',
  },
  {
    up: migration_20260917_135734_add_teams.up,
    down: migration_20260917_135734_add_teams.down,
    name: '20260917_135734_add_teams',
  },
  {
    up: migration_20260919_094211_add_board_members.up,
    down: migration_20260919_094211_add_board_members.down,
    name: '20260919_094211_add_board_members',
  },
  {
    up: migration_20260919_102241_add_events.up,
    down: migration_20260919_102241_add_events.down,
    name: '20260919_102241_add_events',
  },
  {
    up: migration_20260919_141246_add_gallery_albums.up,
    down: migration_20260919_141246_add_gallery_albums.down,
    name: '20260919_141246_add_gallery_albums'
  },
];
