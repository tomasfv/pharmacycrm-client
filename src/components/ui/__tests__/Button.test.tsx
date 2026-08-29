import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies the primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-primary-600');
    expect(button).toHaveClass('text-white');
  });

  it('applies the secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-100');
  });

  it('applies the danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-red-600');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled when loading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} loading>Saving</Button>);
    await user.click(screen.getByText('Saving'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByText('Saving')).toBeDisabled();
  });

  it('merges a custom className', () => {
    render(<Button className="my-custom-class">Custom</Button>);
    expect(screen.getByText('Custom')).toHaveClass('my-custom-class');
  });
});
