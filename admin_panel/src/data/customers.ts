import type { Customer } from '@/types';

export const customers: Customer[] = [
  {
    id: 'cu1', name: 'John Smith', email: 'john@example.com', phone: '+1-555-0101',
    totalOrders: 5, totalSpent: 523.40, lastOrderDate: '2024-03-12T08:30:00Z', status: 'active',
    addresses: [{ street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' }],
    createdAt: '2023-06-15T10:00:00Z',
  },
  {
    id: 'cu2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0102',
    totalOrders: 3, totalSpent: 312.50, lastOrderDate: '2024-03-05T14:20:00Z', status: 'active',
    addresses: [{ street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'US' }],
    createdAt: '2023-08-22T09:00:00Z',
  },
  {
    id: 'cu3', name: 'Mike Williams', email: 'mike@example.com', phone: '+1-555-0103',
    totalOrders: 8, totalSpent: 945.80, lastOrderDate: '2024-03-13T07:00:00Z', status: 'active',
    addresses: [{ street: '789 Pine Rd', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'US' }],
    createdAt: '2023-05-10T11:00:00Z',
  },
  {
    id: 'cu4', name: 'Emily Brown', email: 'emily@example.com', phone: '+1-555-0104',
    totalOrders: 1, totalSpent: 117.59, lastOrderDate: '2024-03-10T16:45:00Z', status: 'active',
    addresses: [{ street: '321 Elm St', city: 'Houston', state: 'TX', zipCode: '77001', country: 'US' }],
    createdAt: '2024-03-10T16:00:00Z',
  },
  {
    id: 'cu5', name: 'David Lee', email: 'david@example.com', phone: '+1-555-0105',
    totalOrders: 6, totalSpent: 678.90, lastOrderDate: '2024-03-13T09:00:00Z', status: 'active',
    addresses: [{ street: '654 Maple Dr', city: 'Phoenix', state: 'AZ', zipCode: '85001', country: 'US' }],
    createdAt: '2023-09-01T08:00:00Z',
  },
  {
    id: 'cu6', name: 'Lisa Chen', email: 'lisa@example.com', phone: '+1-555-0106',
    totalOrders: 4, totalSpent: 389.20, lastOrderDate: '2024-02-25T12:00:00Z', status: 'active',
    addresses: [{ street: '987 Cedar Ln', city: 'San Francisco', state: 'CA', zipCode: '94101', country: 'US' }],
    createdAt: '2023-07-20T10:00:00Z',
  },
  {
    id: 'cu7', name: 'Robert Taylor', email: 'robert@example.com', phone: '+1-555-0107',
    totalOrders: 2, totalSpent: 97.19, status: 'inactive',
    addresses: [{ street: '246 Birch Ave', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'US' }],
    createdAt: '2023-11-05T14:00:00Z',
  },
  {
    id: 'cu8', name: 'Jennifer Martinez', email: 'jennifer@example.com', phone: '+1-555-0108',
    totalOrders: 7, totalSpent: 856.30, lastOrderDate: '2024-03-11T14:00:00Z', status: 'active',
    addresses: [{ street: '135 Walnut St', city: 'Miami', state: 'FL', zipCode: '33101', country: 'US' }],
    createdAt: '2023-04-18T09:00:00Z',
  },
  {
    id: 'cu9', name: 'Chris Anderson', email: 'chris@example.com', phone: '+1-555-0109',
    totalOrders: 3, totalSpent: 245.60, lastOrderDate: '2024-02-28T10:00:00Z', status: 'active',
    addresses: [{ street: '864 Spruce Way', city: 'Denver', state: 'CO', zipCode: '80201', country: 'US' }],
    createdAt: '2023-10-12T11:00:00Z',
  },
  {
    id: 'cu10', name: 'Amanda White', email: 'amanda@example.com', phone: '+1-555-0110',
    totalOrders: 1, totalSpent: 0, status: 'active',
    addresses: [{ street: '579 Ash Blvd', city: 'Portland', state: 'OR', zipCode: '97201', country: 'US' }],
    createdAt: '2024-03-03T09:00:00Z',
  },
  {
    id: 'cu11', name: 'Tom Jackson', email: 'tom@example.com', phone: '+1-555-0111',
    totalOrders: 0, totalSpent: 0, status: 'blocked',
    addresses: [{ street: '753 Oak Ct', city: 'Austin', state: 'TX', zipCode: '73301', country: 'US' }],
    createdAt: '2023-12-01T10:00:00Z',
  },
];
