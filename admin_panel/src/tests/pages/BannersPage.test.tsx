import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BannersPage } from '@/pages/banners/BannersPage';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock adminApi
vi.mock('@/api/admin', () => ({
  adminApi: {
    getBanners: vi.fn(),
    createBanner: vi.fn(),
    updateBanner: vi.fn(),
    deleteBanner: vi.fn(),
  },
}));

import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

const mockGetBanners = vi.mocked(adminApi.getBanners);
const mockCreateBanner = vi.mocked(adminApi.createBanner);
const mockUpdateBanner = vi.mocked(adminApi.updateBanner);
const mockDeleteBanner = vi.mocked(adminApi.deleteBanner);
const mockToastSuccess = vi.mocked(toast.success);

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'url' | 'none';
  linkValue: string;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const makeBanner = (overrides: Partial<Banner> = {}): Banner => ({
  id: 'b1',
  title: 'Summer Sale',
  imageUrl: 'https://example.com/banner.jpg',
  linkType: 'url',
  linkValue: 'https://example.com/sale',
  sortOrder: 1,
  isActive: true,
  startDate: '2024-06-01',
  endDate: '2024-06-30',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const emptyResponse = {
  success: true,
  data: [],
  total: 0,
  page: 1,
  limit: 100,
  totalPages: 1,
};

const listResponse = (banners: Banner[]) => ({
  success: true,
  data: banners,
  total: banners.length,
  page: 1,
  limit: 100,
  totalPages: 1,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BannersPage', () => {
  it('renders the page heading', async () => {
    mockGetBanners.mockResolvedValueOnce(emptyResponse);
    render(<BannersPage />);
    expect(screen.getByText('Banners')).toBeInTheDocument();
  });

  it('renders loading skeleton initially', () => {
    mockGetBanners.mockReturnValueOnce(new Promise(() => {}));
    const { container } = render(<BannersPage />);
    const skeletonEl = container.querySelector('.animate-pulse');
    expect(skeletonEl).toBeInTheDocument();
  });

  it('renders banner list when data loads', async () => {
    const banners = [
      makeBanner({ id: 'b1', title: 'Summer Sale' }),
      makeBanner({ id: 'b2', title: 'Winter Clearance', isActive: false }),
    ];
    mockGetBanners.mockResolvedValueOnce(listResponse(banners));
    render(<BannersPage />);

    await waitFor(() => {
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
      expect(screen.getByText('Winter Clearance')).toBeInTheDocument();
    });
  });

  it('shows empty state when no banners returned', async () => {
    mockGetBanners.mockResolvedValueOnce(emptyResponse);
    render(<BannersPage />);
    await waitFor(() => {
      expect(screen.getByText('No banners yet')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockGetBanners.mockRejectedValueOnce(new Error('Server error'));
    render(<BannersPage />);
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('"Add Banner" button opens the add modal', async () => {
    mockGetBanners.mockResolvedValueOnce(emptyResponse);
    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('No banners yet')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add banner/i });
    await userEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: 'Add Banner' })).toBeInTheDocument();
  });

  it('submitting add form calls adminApi.createBanner with the form data', async () => {
    mockGetBanners.mockResolvedValue(emptyResponse);
    mockCreateBanner.mockResolvedValueOnce({ success: true, data: makeBanner() });

    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('No banners yet')).toBeInTheDocument());

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: /add banner/i }));

    // Fill in title
    const titleInput = screen.getByPlaceholderText('e.g. Summer Sale');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Black Friday Sale');

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Add Banner' });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBanner).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Black Friday Sale' })
      );
    });
  });

  it('shows form validation error when title is empty', async () => {
    mockGetBanners.mockResolvedValueOnce(emptyResponse);
    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('No banners yet')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /add banner/i }));

    // Don't fill in title, just submit
    const submitBtn = screen.getByRole('button', { name: 'Add Banner' });
    await userEvent.click(submitBtn);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockCreateBanner).not.toHaveBeenCalled();
  });

  it('edit button opens modal pre-filled with banner data', async () => {
    const banner = makeBanner({ id: 'b1', title: 'Existing Banner' });
    mockGetBanners.mockResolvedValueOnce(listResponse([banner]));

    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('Existing Banner')).toBeInTheDocument());

    // Click the pencil/edit icon button for this banner
    const editBtns = screen.getAllByTitle(/edit/i).length > 0
      ? screen.getAllByTitle(/edit/i)
      : document.querySelectorAll('button svg.lucide-pencil');

    // Use closest button approach
    const pencilIcon = document.querySelector('svg.lucide-pencil');
    if (pencilIcon) {
      const editBtn = pencilIcon.closest('button') as HTMLElement;
      await userEvent.click(editBtn);
    } else {
      // Fallback: find all buttons and click the one before the delete
      const allButtons = screen.getAllByRole('button');
      // The table row buttons: edit then delete. Click the edit one.
      const editButtonInRow = allButtons.find(btn => btn.querySelector('[data-lucide="pencil"]') || btn.innerHTML.includes('Pencil') || btn.className.includes('hover:bg-gray-100'));
      if (editButtonInRow) await userEvent.click(editButtonInRow);
    }

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Banner' })).toBeInTheDocument();
    });

    // The title input should be pre-filled
    const titleInput = screen.getByPlaceholderText('e.g. Summer Sale') as HTMLInputElement;
    expect(titleInput.value).toBe('Existing Banner');
  });

  it('delete confirmation modal opens on trash icon click', async () => {
    const banner = makeBanner({ id: 'b1', title: 'Old Banner' });
    mockGetBanners.mockResolvedValueOnce(listResponse([banner]));

    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('Old Banner')).toBeInTheDocument());

    // Find the trash icon button
    const trashIcon = document.querySelector('svg.lucide-trash2, [data-lucide="trash-2"]');
    if (trashIcon) {
      const deleteBtn = trashIcon.closest('button') as HTMLElement;
      await userEvent.click(deleteBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this banner? This action cannot be undone.')).toBeInTheDocument();
    });
  });

  it('confirming delete calls adminApi.deleteBanner and shows success toast', async () => {
    const banner = makeBanner({ id: 'b1', title: 'Old Banner' });
    mockGetBanners.mockResolvedValue(listResponse([banner]));
    mockDeleteBanner.mockResolvedValueOnce({ success: true });

    render(<BannersPage />);
    await waitFor(() => expect(screen.getByText('Old Banner')).toBeInTheDocument());

    // Open delete confirm modal
    const trashIcon = document.querySelector('svg.lucide-trash-2, svg[class*="trash"]');
    const allButtons = screen.getAllByRole('button');
    // Find button that contains trash2 icon - it's the last action button in the row
    const rowActionButtons = allButtons.filter(btn =>
      btn.className.includes('hover:bg-red-50') && !btn.textContent?.includes('Delete')
    );

    if (rowActionButtons.length > 0) {
      await userEvent.click(rowActionButtons[0]);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    });

    // Click confirm Delete button
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i });
    await userEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockDeleteBanner).toHaveBeenCalledWith('b1');
      expect(mockToastSuccess).toHaveBeenCalledWith('Banner deleted');
    });
  });

  it('shows active/inactive status badge for each banner', async () => {
    const banners = [
      makeBanner({ id: 'b1', title: 'Active Banner', isActive: true }),
      makeBanner({ id: 'b2', title: 'Inactive Banner', isActive: false }),
    ];
    mockGetBanners.mockResolvedValueOnce(listResponse(banners));
    render(<BannersPage />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });
});
