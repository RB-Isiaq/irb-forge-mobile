import { render, screen } from '@testing-library/react-native';

import { ThemedText } from './themed-text';

describe('ThemedText', () => {
  it('renders its children as text', () => {
    render(<ThemedText>Hello forge</ThemedText>);
    expect(screen.getByText('Hello forge')).toBeOnTheScreen();
  });

  it('forwards arbitrary Text props (e.g. accessibilityRole)', () => {
    render(
      <ThemedText accessibilityRole="header" type="title">
        Programs
      </ThemedText>
    );
    expect(screen.getByRole('header', { name: 'Programs' })).toBeOnTheScreen();
  });
});
