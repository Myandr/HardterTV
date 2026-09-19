import * as migration_20260917_134356_init from './20260917_134356_init';
import * as migration_20260917_135734_add_teams from './20260917_135734_add_teams';
import * as migration_20260919_094211_add_board_members from './20260919_094211_add_board_members';
import * as migration_20260919_102241_add_events from './20260919_102241_add_events';
import * as migration_20260919_141246_add_gallery_albums from './20260919_141246_add_gallery_albums';
import * as migration_20260919_174521_add_news from './20260919_174521_add_news';
import * as migration_20260919_175022_add_legal_pages from './20260919_175022_add_legal_pages';
import * as migration_20260919_194632_add_mitgliedschaft from './20260919_194632_add_mitgliedschaft';

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
    name: '20260919_141246_add_gallery_albums',
  },
  {
    up: migration_20260919_174521_add_news.up,
    down: migration_20260919_174521_add_news.down,
    name: '20260919_174521_add_news',
  },
  {
    up: migration_20260919_175022_add_legal_pages.up,
    down: migration_20260919_175022_add_legal_pages.down,
    name: '20260919_175022_add_legal_pages',
  },
  {
    up: migration_20260919_194632_add_mitgliedschaft.up,
    down: migration_20260919_194632_add_mitgliedschaft.down,
    name: '20260919_194632_add_mitgliedschaft'
  },
];
