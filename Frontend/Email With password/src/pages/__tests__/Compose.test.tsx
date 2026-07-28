import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Compose from '../Compose/Compose';

describe('Compose page', () => {
  test('renders headings and primary actions', () => {
    render(<Compose />);
    expect(screen.getByRole('heading', { name: /compose email/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /email details/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /email content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
  });

  test('validates subject is required on submit', async () => {
    const user = userEvent.setup();
    render(<Compose />);

    const subject = screen.getByPlaceholderText(/enter email subject/i);
    // Ensure empty
    await user.clear(subject);

    await user.click(screen.getByRole('button', { name: /send email/i }));
    expect(await screen.findByText(/subject is required/i)).toBeInTheDocument();
  });

  test('toggles personalization panel', async () => {
    const user = userEvent.setup();
    render(<Compose />);

    const addVars = screen.getByRole('button', { name: /add variables/i });
    await user.click(addVars);
    expect(screen.getByText(/click to insert/i)).toBeInTheDocument();

    // Hide again
    await user.click(addVars);
    expect(screen.queryByText(/click to insert/i)).not.toBeInTheDocument();
  });

  test('recipient type radio switches input controls', async () => {
    const user = userEvent.setup();
    render(<Compose />);

    // default is 'single' with email input
    expect(screen.getByPlaceholderText(/enter email address/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/mailing list/i));
    // The mailing list select should show the "Select a list" option
    expect(screen.getByRole('option', { name: /select a list/i })).toBeInTheDocument();

    await user.click(screen.getByLabelText(/upload csv\/excel/i));
    expect(screen.getByText(/upload csv or excel file/i)).toBeInTheDocument();
  });

  test('schedule toggle updates submit button label', async () => {
    const user = userEvent.setup();
    render(<Compose />);

    // Initially send now
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /schedule/i }));
    expect(screen.getByRole('button', { name: /schedule email/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /send now/i }));
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
  });
});


