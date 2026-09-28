import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer component', () => {
  it('should render instance name', () => {
    render(<Footer />);
    const element = screen.getByText('Zonda Home Planning Poker Instance');
    expect(element).toBeInTheDocument();
  });
});
