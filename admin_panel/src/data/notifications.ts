import type { Notification } from '@/types';

export const notifications: Notification[] = [
  { id: 'n1', title: 'New Order', message: 'Order ORD-2024-015 has been placed by Jennifer Martinez', type: 'order', read: false, createdAt: '2024-03-13T14:00:00Z' },
  { id: 'n2', title: 'Low Stock Alert', message: 'Mechanical Keyboard RGB is running low on stock (35 units remaining)', type: 'product', read: false, createdAt: '2024-03-13T12:00:00Z' },
  { id: 'n3', title: 'New Review', message: 'Backpack Travel 40L received a new 4-star review', type: 'product', read: false, createdAt: '2024-03-13T11:00:00Z' },
  { id: 'n4', title: 'Order Cancelled', message: 'Order ORD-2024-007 has been cancelled by Robert Taylor', type: 'order', read: true, createdAt: '2024-03-08T08:00:00Z' },
  { id: 'n5', title: 'New Customer', message: 'Emily Brown has created a new account', type: 'customer', read: true, createdAt: '2024-03-10T16:00:00Z' },
  { id: 'n6', title: 'System Update', message: 'System maintenance scheduled for March 15, 2024 at 2:00 AM', type: 'system', read: true, createdAt: '2024-03-07T10:00:00Z' },
  { id: 'n7', title: 'Return Request', message: 'Amanda White has requested a return for order ORD-2024-010', type: 'order', read: true, createdAt: '2024-03-10T14:00:00Z' },
  { id: 'n8', title: 'Out of Stock', message: 'Wireless Charging Pad is now out of stock', type: 'product', read: true, createdAt: '2024-03-13T08:00:00Z' },
];
