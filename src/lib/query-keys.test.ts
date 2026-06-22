import { queryKeys } from './query-keys';

describe('queryKeys', () => {
  it('namespaces org-scoped keys under the org slug', () => {
    expect(queryKeys.orgs.all()).toEqual(['orgs']);
    expect(queryKeys.orgs.detail('acme')).toEqual(['orgs', 'acme']);
    expect(queryKeys.members.list('acme')).toEqual(['orgs', 'acme', 'members']);
    expect(queryKeys.members.me('acme')).toEqual(['orgs', 'acme', 'members', 'me']);
    expect(queryKeys.programs.detail('acme', 'p1')).toEqual(['orgs', 'acme', 'programs', 'p1']);
  });

  it('keeps a program detail key as a prefix-extension of its list key', () => {
    // Ensures invalidating the list also matches the detail under React Query's
    // partial key matching.
    const list = queryKeys.programs.list('acme');
    const detail = queryKeys.programs.detail('acme', 'p1');
    expect(detail.slice(0, list.length)).toEqual(list);
  });

  it('scopes the two invitation views to different roots', () => {
    expect(queryKeys.invitations.byOrg('acme')).toEqual(['orgs', 'acme', 'invitations']);
    expect(queryKeys.invitations.mine()).toEqual(['invitations', 'me']);
  });
});
