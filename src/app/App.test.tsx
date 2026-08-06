import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the K-SORT product name', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'K-SORT' })).toBeInTheDocument();
});
