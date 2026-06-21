/**
 * Centralized query key factory — mirrors `irb-forge-fe/shared/lib/query-keys.ts`.
 * Every useQuery/useMutation that touches the cache imports from here.
 */
export const queryKeys = {
  me: () => ['me'] as const,

  orgs: {
    all: () => ['orgs'] as const,
    detail: (slug: string) => ['orgs', slug] as const,
  },

  members: {
    list: (slug: string) => ['orgs', slug, 'members'] as const,
    me: (slug: string) => ['orgs', slug, 'members', 'me'] as const,
  },

  invitations: {
    byOrg: (slug: string) => ['orgs', slug, 'invitations'] as const,
    mine: () => ['invitations', 'me'] as const,
  },

  programs: {
    list: (slug: string) => ['orgs', slug, 'programs'] as const,
    detail: (slug: string, id: string) => ['orgs', slug, 'programs', id] as const,
  },

  messages: {
    byOrg: (slug: string) => ['orgs', slug, 'messages'] as const,
  },
} as const;
