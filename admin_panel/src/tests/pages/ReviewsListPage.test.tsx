import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewsListPage } from '@/pages/reviews/ReviewsListPage';
import type { Review } from '@/types';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock adminApi
vi.mock('@/api/admin', () => ({
  adminApi: {
    getReviews: vi.fn(),
    updateReviewStatus: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

import { adminApi } from '@/api/admin';

const mockGetReviews = vi.mocked(adminApi.getReviews);
const mockUpdateReviewStatus = vi.mocked(adminApi.updateReviewStatus);
const mockDeleteReview = vi.mocked(adminApi.deleteReview);

const makeReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'r1',
  productId: 'p1',
  productName: 'Test Product',
  customer: { id: 'c1', name: 'Alice' },
  rating: 4,
  title: 'Great product',
  comment: 'Really happy with this purchase.',
  status: 'pending',
  createdAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

const emptyResponse = {
  success: true,
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const listResponse = (reviews: Review[]) => ({
  success: true,
  data: reviews,
  total: reviews.length,
  page: 1,
  limit: 20,
  totalPages: 1,
});

beforeEach(() => {
  vi.clearAllMocks();
  // Stub window.confirm to return true
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('ReviewsListPage', () => {
  it('renders the page heading', async () => {
    mockGetReviews.mockResolvedValueOnce(emptyResponse);
    render(<ReviewsListPage />);
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('renders loading skeleton initially', () => {
    // Never resolves during this test — we just check what renders immediately
    mockGetReviews.mockReturnValueOnce(new Promise(() => {}));
    const { container } = render(<ReviewsListPage />);
    // Skeleton is rendered as a div with inline styles or specific class
    const skeletonEl = container.querySelector('.animate-pulse');
    expect(skeletonEl).toBeInTheDocument();
  });

  it('renders list of reviews when data loads', async () => {
    const reviews = [
      makeReview({ id: 'r1', productName: 'Awesome Sneakers', customer: { id: 'c1', name: 'Bob' } }),
      makeReview({ id: 'r2', productName: 'Cool T-Shirt', customer: { id: 'c2', name: 'Carol' }, status: 'approved' }),
    ];
    mockGetReviews.mockResolvedValueOnce(listResponse(reviews));
    render(<ReviewsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Awesome Sneakers')).toBeInTheDocument();
      expect(screen.getByText('Cool T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Carol')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reviews returned', async () => {
    mockGetReviews.mockResolvedValueOnce(emptyResponse);
    render(<ReviewsListPage />);
    await waitFor(() => {
      expect(screen.getByText('No reviews found')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockGetReviews.mockRejectedValueOnce(new Error('Network error'));
    render(<ReviewsListPage />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('approve button calls updateReviewStatus with "approved"', async () => {
    const review = makeReview({ id: 'r1', status: 'pending' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));
    mockUpdateReviewStatus.mockResolvedValueOnce({ success: true });

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByTitle('Approve')).toBeInTheDocument());

    const approveBtn = screen.getByTitle('Approve');
    await userEvent.click(approveBtn);
    expect(mockUpdateReviewStatus).toHaveBeenCalledWith('r1', 'approved');
  });

  it('reject button calls updateReviewStatus with "rejected"', async () => {
    const review = makeReview({ id: 'r1', status: 'pending' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));
    mockUpdateReviewStatus.mockResolvedValueOnce({ success: true });

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByTitle('Reject')).toBeInTheDocument());

    const rejectBtn = screen.getByTitle('Reject');
    await userEvent.click(rejectBtn);
    expect(mockUpdateReviewStatus).toHaveBeenCalledWith('r1', 'rejected');
  });

  it('approved review shows no Approve button but shows Reject button', async () => {
    const review = makeReview({ id: 'r1', status: 'approved' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByText('approved')).toBeInTheDocument());

    expect(screen.queryByTitle('Approve')).not.toBeInTheDocument();
    expect(screen.getByTitle('Reject')).toBeInTheDocument();
  });

  it('rejected review shows Approve button but no Reject button', async () => {
    const review = makeReview({ id: 'r1', status: 'rejected' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByText('rejected')).toBeInTheDocument());

    expect(screen.getByTitle('Approve')).toBeInTheDocument();
    expect(screen.queryByTitle('Reject')).not.toBeInTheDocument();
  });

  it('delete button calls deleteReview after confirm', async () => {
    const review = makeReview({ id: 'r1', status: 'pending' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));
    mockDeleteReview.mockResolvedValueOnce({ success: true });

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByTitle('Delete')).toBeInTheDocument());

    const deleteBtn = screen.getByTitle('Delete');
    await userEvent.click(deleteBtn);
    expect(vi.mocked(window.confirm)).toHaveBeenCalledWith('Delete this review?');
    expect(mockDeleteReview).toHaveBeenCalledWith('r1');
  });

  it('delete button does NOT call deleteReview when confirm is cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const review = makeReview({ id: 'r1', status: 'pending' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByTitle('Delete')).toBeInTheDocument());

    const deleteBtn = screen.getByTitle('Delete');
    await userEvent.click(deleteBtn);
    expect(mockDeleteReview).not.toHaveBeenCalled();
  });

  it('status filter buttons trigger a new fetch with the selected status', async () => {
    mockGetReviews.mockResolvedValue(emptyResponse);

    render(<ReviewsListPage />);
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(1));

    // Click the "Pending" filter button
    const pendingBtn = screen.getByRole('button', { name: 'Pending' });
    fireEvent.click(pendingBtn);

    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(2));
    const lastCall = mockGetReviews.mock.calls[1][0];
    expect(lastCall?.status).toBe('pending');
  });

  it('clicking "All" filter clears the status filter', async () => {
    mockGetReviews.mockResolvedValue(emptyResponse);
    render(<ReviewsListPage />);
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(1));

    // First click Pending
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(2));

    // Then click All
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(3));
    const lastCall = mockGetReviews.mock.calls[2][0];
    expect(lastCall?.status).toBeUndefined();
  });

  it('deletes a review and removes it from the list', async () => {
    const review = makeReview({ id: 'r1', productName: 'Widget', status: 'pending' });
    mockGetReviews.mockResolvedValueOnce(listResponse([review]));
    mockDeleteReview.mockResolvedValueOnce({ success: true });

    render(<ReviewsListPage />);
    await waitFor(() => expect(screen.getByText('Widget')).toBeInTheDocument());

    const deleteBtn = screen.getByTitle('Delete');
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Widget')).not.toBeInTheDocument();
    });
  });
});
