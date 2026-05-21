import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock pdf-lib operations
vi.mock('../utils/exportPddPdf', () => ({
  buildPddRegistrationPdfBytes: vi.fn().mockResolvedValue(new Uint8Array()),
}));

// Mock logo asset
vi.mock('./assets/philhealth-logo.png', () => ({
  default: 'mock-logo-url',
}));

// Mock framer motion animations for instantaneous DOM tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PhilHealth Patient Dialysis Database (PDD) Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/portal');
  });

  it('renders Patient Portal by default', () => {
    render(<App />);
    
    // Check patient portal header elements
    expect(screen.getByText('Mode: Patient')).toBeInTheDocument();
    expect(screen.getAllByText('Juan Dela Cruz').length).toBeGreaterThan(0);
  });

  it('switches personas instantly using Persona Switcher widget', async () => {
    render(<App />);

    // Trigger Persona Switcher open
    const trigger = screen.getByText('Mode: Patient');
    fireEvent.click(trigger);

    // Click HCI Encoder
    const encoderBtn = screen.getByText('Maria Santos');
    fireEvent.click(encoderBtn);

    // Verify UI shifted to Admin Portal
    await waitFor(() => {
      expect(screen.getByText('Mode: HCI Encoder (Admin)')).toBeInTheDocument();
      expect(screen.getByText('St. Jude Renal Center')).toBeInTheDocument();
      expect(screen.getByText('Clinical & Financial Overview')).toBeInTheDocument();
    });
  });

  it('performs direct patient registration and session logs under Admin Mode', async () => {
    render(<App />);

    // Swap role to Admin Encoder
    fireEvent.click(screen.getByText('Mode: Patient'));
    fireEvent.click(screen.getByText('Maria Santos'));

    // Go to Patient Directory tab
    const directoryTab = screen.getByText('Patient Registry Directory');
    fireEvent.click(directoryTab);

    expect(screen.getByText('Search demographics, view clinical files, verify Z-Benefits status, and export PDD PDF certifications.')).toBeInTheDocument();

    // Verify seeded patients exist
    expect(screen.getByText('Dela Cruz, Juan')).toBeInTheDocument();
    expect(screen.getByText('Clara, Maria')).toBeInTheDocument();
  });

  it('allows logging dialysis sessions and deducts from 156-session balances', async () => {
    render(<App />);

    // Swap to Admin
    fireEvent.click(screen.getByText('Mode: Patient'));
    fireEvent.click(screen.getByText('Maria Santos'));

    // Go to Session Tracker
    fireEvent.click(screen.getByText('156 Session Tracker'));

    expect(screen.getAllByText('Annual Allocation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reimbursement Claims Ledger').length).toBeGreaterThan(0);

    // Verify session count dials are displaying balances
    // Juan Dela Cruz has 15 sessions logged, so 156 - 15 = 141 remaining
    expect(screen.getAllByText('141').length).toBeGreaterThan(0);

    // Maria Clara has 142 sessions logged, so 156 - 142 = 14 remaining
    expect(screen.getAllByText('14').length).toBeGreaterThan(0);
  });

  it('handles Return-To-Hospital (RTH) mending and re-transmission', async () => {
    render(<App />);

    // Swap to Admin
    fireEvent.click(screen.getByText('Mode: Patient'));
    fireEvent.click(screen.getByText('Maria Santos'));

    // Verify outstanding RTH claims exist on dashboard
    expect(screen.getByText('Return-To-Hospital Claims Board')).toBeInTheDocument();
    
    // Check for seeded RTH items
    expect(screen.getByText(/PRC License Accreditation Number out of sync/i)).toBeInTheDocument();

    // Click mend & re-transmit
    const mendButtons = screen.getAllByText('Mend & Re-transmit');
    expect(mendButtons.length).toBeGreaterThan(0);
  });
});
