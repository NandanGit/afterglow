import understory from '../../themes/bundled/understory.json';
import voidOrchid from '../../themes/bundled/void-orchid.json';
import ember from '../../themes/bundled/ember.json';
import arctic from '../../themes/bundled/arctic.json';
import sakuraDusk from '../../themes/bundled/sakura-dusk.json';
import copperMill from '../../themes/bundled/copper-mill.json';
import deepOcean from '../../themes/bundled/deep-ocean.json';
import noir from '../../themes/bundled/noir.json';
import desertNight from '../../themes/bundled/desert-night.json';
import tidalPool from '../../themes/bundled/tidal-pool.json';
import merlot from '../../themes/bundled/merlot.json';
import mossGarden from '../../themes/bundled/moss-garden.json';
import nebula from '../../themes/bundled/nebula.json';
import slatePeak from '../../themes/bundled/slate-peak.json';
import seville from '../../themes/bundled/seville.json';
import moonstone from '../../themes/bundled/moonstone.json';

import type { Theme } from '../types/theme.ts';

interface ThemeJson {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  colors: Theme['colors'];
}

const addSource = (t: ThemeJson): Theme => ({ ...t, source: 'bundled' as const });

export const bundledThemes: Map<string, Theme> = new Map([
  ['understory', addSource(understory)],
  ['void-orchid', addSource(voidOrchid)],
  ['ember', addSource(ember)],
  ['arctic', addSource(arctic)],
  ['sakura-dusk', addSource(sakuraDusk)],
  ['copper-mill', addSource(copperMill)],
  ['deep-ocean', addSource(deepOcean)],
  ['noir', addSource(noir)],
  ['desert-night', addSource(desertNight)],
  ['tidal-pool', addSource(tidalPool)],
  ['merlot', addSource(merlot)],
  ['moss-garden', addSource(mossGarden)],
  ['nebula', addSource(nebula)],
  ['slate-peak', addSource(slatePeak)],
  ['seville', addSource(seville)],
  ['moonstone', addSource(moonstone)],
]);
