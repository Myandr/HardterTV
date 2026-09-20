import * as migration_20260917_134356_init from './20260917_134356_init';
import * as migration_20260917_135734_add_teams from './20260917_135734_add_teams';
import * as migration_20260919_094211_add_board_members from './20260919_094211_add_board_members';
import * as migration_20260919_102241_add_events from './20260919_102241_add_events';
import * as migration_20260919_141246_add_gallery_albums from './20260919_141246_add_gallery_albums';
import * as migration_20260919_174521_add_news from './20260919_174521_add_news';
import * as migration_20260919_175022_add_legal_pages from './20260919_175022_add_legal_pages';
import * as migration_20260919_194632_add_mitgliedschaft from './20260919_194632_add_mitgliedschaft';
import * as migration_20260920_000635_add_training from './20260920_000635_add_training';
import * as migration_20260920_044305_add_eisstock from './20260920_044305_add_eisstock';
import * as migration_20260920_092833_add_hero from './20260920_092833_add_hero';
import * as migration_20260920_093501_add_welcome_section from './20260920_093501_add_welcome_section';
import * as migration_20260920_094017_add_location_section from './20260920_094017_add_location_section';
import * as migration_20260920_094953_add_footer from './20260920_094953_add_footer';

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
    name: '20260919_194632_add_mitgliedschaft',
  },
  {
    up: migration_20260920_000635_add_training.up,
    down: migration_20260920_000635_add_training.down,
    name: '20260920_000635_add_training',
  },
  {
    up: migration_20260920_044305_add_eisstock.up,
    down: migration_20260920_044305_add_eisstock.down,
    name: '20260920_044305_add_eisstock',
  },
  {
    up: migration_20260920_092833_add_hero.up,
    down: migration_20260920_092833_add_hero.down,
    name: '20260920_092833_add_hero',
  },
  {
    up: migration_20260920_093501_add_welcome_section.up,
    down: migration_20260920_093501_add_welcome_section.down,
    name: '20260920_093501_add_welcome_section',
  },
  {
    up: migration_20260920_094017_add_location_section.up,
    down: migration_20260920_094017_add_location_section.down,
    name: '20260920_094017_add_location_section',
  },
  {
    up: migration_20260920_094953_add_footer.up,
    down: migration_20260920_094953_add_footer.down,
    name: '20260920_094953_add_footer'
  },
];
