/**
 * @jest-environment node
 *
 * SSR ("no window") test for `listMilestonesByContract`, isolated into its
 * own `node`-environment file. jest-environment-jsdom 30 made the global
 * `window` a non-configurable accessor, so `delete global.window` can no
 * longer simulate SSR from within a jsdom-environment file. The plain `node`
 * test environment has no `window` at all, which is exactly the condition
 * being tested.
 */

import { listMilestonesByContract } from '../repository';

describe('listMilestonesByContract SSR context (no window)', () => {
  it('returns [] without throwing when window is undefined', () => {
    expect(() => listMilestonesByContract('contract-a')).not.toThrow();
    expect(listMilestonesByContract('contract-a')).toEqual([]);
  });
});
