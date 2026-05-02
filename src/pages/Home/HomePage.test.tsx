import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the dashboard heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: /milo dashboard/i })).toBeInTheDocument();
  });
});
