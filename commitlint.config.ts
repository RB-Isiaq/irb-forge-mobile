import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'chore', // tooling, deps, config
        'refactor', // code change without feature or fix
        'style', // formatting, missing semicolons, etc.
        'docs', // documentation only
        'test', // adding or fixing tests
        'perf', // performance improvement
        'ci', // CI/CD changes
        'revert', // revert a previous commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};

export default config;
