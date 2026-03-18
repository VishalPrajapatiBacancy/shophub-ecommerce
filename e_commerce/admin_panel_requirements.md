# E-Commerce Admin Panel - Complete Requirements Document

## Overview

**Project Name:** [Your App Name] Admin Panel
**Platform:** Flutter Web / Desktop (Windows, macOS, Linux)
**Backend:** Firebase (Firestore, Authentication, Storage, Cloud Functions)
**Architecture:** Clean Architecture with BLoC Pattern
**Target Users:** Store Administrators, Staff Members, Support Agents

---

## Table of Contents

1. [Admin Panel Overview](#1-admin-panel-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Dashboard Module](#3-dashboard-module)
4. [Product Management](#4-product-management)
5. [Category Management](#5-category-management)
6. [Brand Management](#6-brand-management)
7. [Inventory Management](#7-inventory-management)
8. [Order Management](#8-order-management)
9. [Customer Management](#9-customer-management)
10. [Coupon & Promotions](#10-coupon--promotions)
11. [Flash Sales Management](#11-flash-sales-management)
12. [Banner Management](#12-banner-management)
13. [Review Management](#13-review-management)
14. [Support Ticket Management](#14-support-ticket-management)
15. [Notification Management](#15-notification-management)
16. [Loyalty Program Management](#16-loyalty-program-management)
17. [Reports & Analytics](#17-reports--analytics)
18. [Content Management](#18-content-management)
19. [Settings & Configuration](#19-settings--configuration)
20. [Staff Management](#20-staff-management)
21. [Role & Permission Management](#21-role--permission-management)
22. [Activity Logs](#22-activity-logs)
23. [Data Models](#23-data-models)
24. [Screen Specifications](#24-screen-specifications)
25. [UI/UX Requirements](#25-uiux-requirements)

---

## 1. Admin Panel Overview

### 1.1 Purpose

The Admin Panel serves as the central management system for the e-commerce application, enabling administrators and staff to:

- Manage products, categories, and inventory
- Process and track orders
- Handle customer accounts and support
- Create and manage promotions
- View analytics and generate reports
- Configure application settings
- Manage staff access and permissions

### 1.2 Key Features Summary

| Module | Features Count | Priority |
|--------|---------------|----------|
| Dashboard | 15+ widgets | Critical |
| Product Management | 25+ features | Critical |
| Order Management | 20+ features | Critical |
| Customer Management | 15+ features | High |
| Inventory Management | 15+ features | High |
| Coupon Management | 12+ features | High |
| Reports & Analytics | 20+ reports | High |
| Staff Management | 10+ features | Medium |
| Content Management | 10+ features | Medium |
| Settings | 15+ configurations | Medium |

### 1.3 Access Levels

| Level | Role | Access |
|-------|------|--------|
| Super Admin | Owner/Admin | Full access to all modules |
| Store Manager | Manager | All except staff and critical settings |
| Inventory Manager | Staff | Products, inventory, categories |
| Order Manager | Staff | Orders, customers, support |
| Marketing Manager | Staff | Coupons, banners, flash sales |
| Support Agent | Staff | Support tickets, limited customer view |
| Content Editor | Staff | Banners, pages, FAQ |
| Viewer | Staff | View-only access |

---

## 2. Authentication & Authorization

### 2.1 Login Features

#### Core Features
- [ ] Email and password login
- [ ] Remember me functionality
- [ ] Forgot password with email reset
- [ ] Password strength validation
- [ ] Session management
- [ ] Auto-logout on inactivity

#### Advanced Features
- [ ] Two-factor authentication (2FA)
- [ ] Login with OTP
- [ ] IP-based access restriction
- [ ] Device management
- [ ] Login attempt limiting (lockout after 5 failures)
- [ ] Login activity logging
- [ ] Force password change on first login
- [ ] Password expiry policy

### 2.2 Authorization Features

- [ ] Role-based access control (RBAC)
- [ ] Module-level permissions
- [ ] Action-level permissions (view, create, edit, delete)
- [ ] Data-level restrictions
- [ ] Permission inheritance
- [ ] Dynamic permission checking
- [ ] Access denied handling

### 2.3 Security Features

- [ ] Secure token storage
- [ ] Session timeout configuration
- [ ] HTTPS enforcement
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Input sanitization
- [ ] Audit trail for all actions

### 2.4 Login Screen Requirements

| Element | Description |
|---------|-------------|
| Logo | Company/App logo |
| Email field | With validation |
| Password field | With show/hide toggle |
| Remember me | Checkbox |
| Login button | Primary action |
| Forgot password | Link to reset |
| Error messages | Inline validation |
| Loading state | Button loading indicator |

### 2.5 Data Model: Staff Authentication

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique staff ID |
| email | string | Login email |
| passwordHash | string | Hashed password |
| name | string | Full name |
| phone | string | Contact number |
| avatar | string | Profile picture URL |
| roleId | string | Assigned role |
| permissions | array | Direct permissions |
| isActive | boolean | Account status |
| isSuperAdmin | boolean | Super admin flag |
| twoFactorEnabled | boolean | 2FA status |
| twoFactorSecret | string | 2FA secret key |
| lastLoginAt | timestamp | Last login time |
| lastLoginIp | string | Last login IP |
| loginAttempts | number | Failed attempts |
| lockedUntil | timestamp | Lockout expiry |
| passwordChangedAt | timestamp | Last password change |
| mustChangePassword | boolean | Force change flag |
| createdBy | string | Creator admin ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 3. Dashboard Module

### 3.1 Overview Statistics

#### Sales Statistics
- [ ] Today's sales amount
- [ ] Today's order count
- [ ] This week's sales
- [ ] This month's sales
- [ ] This year's sales
- [ ] Sales comparison (vs yesterday/last week/last month)
- [ ] Average order value
- [ ] Sales growth percentage

#### Order Statistics
- [ ] Total orders
- [ ] Pending orders
- [ ] Processing orders
- [ ] Shipped orders
- [ ] Delivered orders
- [ ] Cancelled orders
- [ ] Returned orders
- [ ] Orders requiring attention

#### Customer Statistics
- [ ] Total customers
- [ ] New customers today
- [ ] New customers this week
- [ ] New customers this month
- [ ] Active customers (last 30 days)
- [ ] Guest orders

#### Product Statistics
- [ ] Total products
- [ ] Active products
- [ ] Out of stock products
- [ ] Low stock products
- [ ] Draft products
- [ ] Products added today

### 3.2 Dashboard Widgets

#### Charts & Graphs
- [ ] Sales trend chart (line/bar) - 7 days/30 days/12 months
- [ ] Orders trend chart
- [ ] Revenue by category (pie chart)
- [ ] Revenue by payment method (pie chart)
- [ ] Customer acquisition chart
- [ ] Top selling products chart
- [ ] Geographic sales map (optional)

#### Lists & Tables
- [ ] Recent orders (last 10)
- [ ] Recent customers (last 10)
- [ ] Top selling products (top 10)
- [ ] Low stock alerts
- [ ] Pending reviews
- [ ] Open support tickets
- [ ] Recent activity log

#### Quick Actions
- [ ] Add new product
- [ ] View all orders
- [ ] Process pending orders
- [ ] View low stock items
- [ ] Create coupon
- [ ] Send notification

### 3.3 Dashboard Filters

- [ ] Date range selector (Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, Custom range)
- [ ] Compare with previous period toggle
- [ ] Auto-refresh toggle
- [ ] Widget customization (show/hide)
- [ ] Dashboard layout customization

### 3.4 Dashboard Data Model

| Field | Type | Description |
|-------|------|-------------|
| date | string | YYYY-MM-DD |
| totalOrders | number | Orders count |
| totalRevenue | number | Revenue amount |
| averageOrderValue | number | AOV |
| newCustomers | number | New registrations |
| activeCustomers | number | Active users |
| productsViewed | number | Product views |
| addToCartCount | number | Add to cart events |
| checkoutStarted | number | Checkout starts |
| checkoutCompleted | number | Successful orders |
| conversionRate | number | Conversion % |
| cartAbandonmentRate | number | Abandonment % |
| topProducts | array | Best sellers |
| topCategories | array | Top categories |
| revenueByPayment | map | By payment method |
| ordersByStatus | map | By order status |
| revenueByCategory | map | By category |

---

## 4. Product Management

### 4.1 Product Listing

#### Core Features
- [ ] Display all products in table/grid view
- [ ] Search products by name, SKU, description
- [ ] Filter by category
- [ ] Filter by brand
- [ ] Filter by status (active, draft, archived)
- [ ] Filter by stock status (in stock, out of stock, low stock)
- [ ] Filter by price range
- [ ] Sort by name, price, stock, created date, sales
- [ ] Pagination with configurable page size
- [ ] Bulk selection
- [ ] Bulk actions (activate, deactivate, delete, archive)

#### Advanced Features
- [ ] Column customization (show/hide columns)
- [ ] Save filter presets
- [ ] Export filtered results
- [ ] Quick edit inline
- [ ] Duplicate product
- [ ] View product on store

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Checkbox | No | Bulk selection |
| Image | No | Product thumbnail |
| Name | Yes | Product name |
| SKU | Yes | Stock keeping unit |
| Category | Yes | Primary category |
| Price | Yes | Base price |
| Sale Price | Yes | Discounted price |
| Stock | Yes | Stock quantity |
| Status | Yes | Active/Draft/Archived |
| Created | Yes | Creation date |
| Actions | No | Edit, Delete, View |

### 4.2 Add/Edit Product

#### Basic Information
- [ ] Product name (required)
- [ ] Short description
- [ ] Full description (rich text editor)
- [ ] SKU (auto-generate option)
- [ ] Product type (simple, variable, bundle)
- [ ] Product status (active, draft, archived)

#### Pricing
- [ ] Base price (required)
- [ ] Sale price
- [ ] Sale start date
- [ ] Sale end date
- [ ] Cost price (for profit calculation)
- [ ] Tax class selection

#### Inventory
- [ ] Track inventory toggle
- [ ] Stock quantity
- [ ] Low stock threshold
- [ ] Allow backorders toggle
- [ ] Stock status (in stock, out of stock, on backorder)

#### Categories & Organization
- [ ] Primary category (required)
- [ ] Additional categories
- [ ] Brand selection
- [ ] Tags (comma-separated)

#### Media
- [ ] Primary image upload
- [ ] Gallery images (multiple upload)
- [ ] Image reordering (drag & drop)
- [ ] Image alt text
- [ ] Video URL
- [ ] 360° view images

#### Variants (for variable products)
- [ ] Add variant attributes (size, color, material, etc.)
- [ ] Generate variants automatically
- [ ] Individual variant SKU
- [ ] Individual variant price
- [ ] Individual variant stock
- [ ] Individual variant images
- [ ] Enable/disable individual variants

#### Shipping
- [ ] Weight
- [ ] Dimensions (length, width, height)
- [ ] Shipping class

#### Specifications
- [ ] Add specification groups
- [ ] Add key-value specifications
- [ ] Reorder specifications

#### SEO
- [ ] SEO title
- [ ] Meta description
- [ ] URL slug
- [ ] Focus keywords

#### Advanced Options
- [ ] Featured product toggle
- [ ] New arrival toggle
- [ ] Publish date scheduling
- [ ] Related products selection
- [ ] Cross-sell products
- [ ] Up-sell products

### 4.3 Product Actions

- [ ] Save as draft
- [ ] Publish product
- [ ] Update product
- [ ] Delete product
- [ ] Archive product
- [ ] Duplicate product
- [ ] Preview product
- [ ] View on store

### 4.4 Bulk Operations

- [ ] Bulk import from CSV/Excel
- [ ] Bulk export to CSV/Excel
- [ ] Bulk price update
- [ ] Bulk stock update
- [ ] Bulk category assignment
- [ ] Bulk status change
- [ ] Bulk delete

### 4.5 Product Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Product ID |
| name | string | Yes | Product name |
| slug | string | Yes | URL slug |
| description | string | No | Full description |
| shortDescription | string | No | Brief description |
| sku | string | Yes | Stock keeping unit |
| categoryId | string | Yes | Primary category |
| additionalCategories | array | No | Other categories |
| brandId | string | No | Brand reference |
| tags | array | No | Search tags |
| type | string | Yes | simple/variable/bundle |
| status | string | Yes | active/draft/archived |
| basePrice | number | Yes | Regular price |
| salePrice | number | No | Discounted price |
| saleStartDate | timestamp | No | Sale start |
| saleEndDate | timestamp | No | Sale end |
| costPrice | number | No | Cost for margin |
| taxClass | string | No | Tax classification |
| trackInventory | boolean | Yes | Track stock |
| stockQuantity | number | Yes | Available stock |
| lowStockThreshold | number | Yes | Alert threshold |
| allowBackorder | boolean | Yes | Allow backorder |
| stockStatus | string | Yes | Stock status |
| weight | number | No | Product weight |
| dimensions | map | No | L x W x H |
| shippingClass | string | No | Shipping class |
| images | array | Yes | Product images |
| videoUrl | string | No | Product video |
| specifications | array | No | Spec key-values |
| isFeatured | boolean | Yes | Featured flag |
| isNewArrival | boolean | Yes | New arrival flag |
| publishDate | timestamp | No | Scheduled publish |
| relatedProducts | array | No | Related product IDs |
| crossSellProducts | array | No | Cross-sell IDs |
| upSellProducts | array | No | Up-sell IDs |
| seoTitle | string | No | SEO title |
| metaDescription | string | No | Meta description |
| averageRating | number | Yes | Average review rating |
| totalReviews | number | Yes | Review count |
| totalSold | number | Yes | Units sold |
| viewCount | number | Yes | View count |
| createdBy | string | Yes | Creator admin ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

## 5. Category Management

### 5.1 Category Listing

#### Features
- [ ] Display categories in tree view
- [ ] Display categories in table view
- [ ] Search categories
- [ ] Filter by status (active/inactive)
- [ ] Filter by level (parent/child)
- [ ] Sort by name, order, product count
- [ ] Expand/collapse tree nodes
- [ ] Drag and drop reordering
- [ ] Bulk actions

#### Table Columns
| Column | Description |
|--------|-------------|
| Image | Category image |
| Name | Category name with indentation |
| Slug | URL slug |
| Parent | Parent category |
| Products | Product count |
| Status | Active/Inactive |
| Order | Sort order |
| Actions | Edit, Delete |

### 5.2 Add/Edit Category

#### Fields
- [ ] Category name (required)
- [ ] Slug (auto-generate from name)
- [ ] Description
- [ ] Parent category (dropdown)
- [ ] Category image upload
- [ ] Category banner upload
- [ ] Category icon upload
- [ ] Sort order
- [ ] Status (active/inactive)
- [ ] Featured category toggle
- [ ] SEO title
- [ ] Meta description
- [ ] Custom filters (for this category)

### 5.3 Category Actions

- [ ] Create category
- [ ] Edit category
- [ ] Delete category (with product reassignment)
- [ ] Move category (change parent)
- [ ] Reorder categories
- [ ] Activate/Deactivate category

### 5.4 Category Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Category ID |
| name | string | Yes | Category name |
| slug | string | Yes | URL slug |
| description | string | No | Description |
| parentId | string | No | Parent category ID |
| level | number | Yes | Hierarchy level |
| path | array | Yes | Ancestor IDs |
| imageUrl | string | No | Category image |
| bannerUrl | string | No | Category banner |
| iconUrl | string | No | Category icon |
| sortOrder | number | Yes | Display order |
| isActive | boolean | Yes | Active status |
| isFeatured | boolean | Yes | Featured flag |
| productCount | number | Yes | Products count |
| filters | array | No | Custom filters |
| seoTitle | string | No | SEO title |
| metaDescription | string | No | Meta description |
| createdBy | string | Yes | Creator ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

## 6. Brand Management

### 6.1 Brand Listing

#### Features
- [ ] Display brands in table/grid view
- [ ] Search brands by name
- [ ] Filter by status
- [ ] Sort by name, product count
- [ ] Pagination
- [ ] Bulk actions

### 6.2 Add/Edit Brand

#### Fields
- [ ] Brand name (required)
- [ ] Slug
- [ ] Description
- [ ] Logo upload
- [ ] Banner upload
- [ ] Website URL
- [ ] Status (active/inactive)
- [ ] Featured brand toggle
- [ ] Sort order
- [ ] SEO title
- [ ] Meta description

### 6.3 Brand Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Brand ID |
| name | string | Yes | Brand name |
| slug | string | Yes | URL slug |
| description | string | No | Description |
| logoUrl | string | No | Brand logo |
| bannerUrl | string | No | Brand banner |
| websiteUrl | string | No | Official website |
| isActive | boolean | Yes | Active status |
| isFeatured | boolean | Yes | Featured flag |
| productCount | number | Yes | Products count |
| sortOrder | number | Yes | Display order |
| seoTitle | string | No | SEO title |
| metaDescription | string | No | Meta description |
| createdBy | string | Yes | Creator ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

## 7. Inventory Management

### 7.1 Stock Overview

#### Features
- [ ] Total stock value
- [ ] Total products count
- [ ] In stock products count
- [ ] Out of stock products count
- [ ] Low stock products count
- [ ] Stock by category chart
- [ ] Stock movement summary

### 7.2 Stock Listing

#### Features
- [ ] Display all products with stock info
- [ ] Search by product name, SKU
- [ ] Filter by stock status
- [ ] Filter by category
- [ ] Filter by warehouse (if multi-warehouse)
- [ ] Sort by stock quantity
- [ ] Quick stock update inline
- [ ] Bulk stock update

#### Table Columns
| Column | Description |
|--------|-------------|
| Product | Name with image |
| SKU | Stock keeping unit |
| Category | Product category |
| Current Stock | Available quantity |
| Reserved | Reserved for orders |
| Available | Actual available |
| Low Stock Threshold | Alert level |
| Status | Stock status |
| Actions | Update, History |

### 7.3 Stock Adjustment

#### Features
- [ ] Add stock
- [ ] Remove stock
- [ ] Adjustment reason selection
- [ ] Adjustment notes
- [ ] Reference number (for auditing)
- [ ] Batch/bulk adjustment

#### Adjustment Reasons
- Purchase/Restock
- Sales return
- Damaged goods
- Theft/Loss
- Stock count correction
- Transfer in
- Transfer out
- Sample/Giveaway
- Other

### 7.4 Stock Movement History

#### Features
- [ ] View all stock movements
- [ ] Filter by product
- [ ] Filter by movement type
- [ ] Filter by date range
- [ ] Filter by staff member
- [ ] Export history

#### Movement Types
- Stock In (purchase, return)
- Stock Out (sale, adjustment)
- Transfer
- Adjustment

### 7.5 Low Stock Alerts

#### Features
- [ ] View all low stock products
- [ ] Configure alert threshold per product
- [ ] Configure global default threshold
- [ ] Email notifications for low stock
- [ ] Push notifications for low stock
- [ ] Quick reorder action

### 7.6 Stock Reports

- [ ] Stock valuation report
- [ ] Stock movement report
- [ ] Low stock report
- [ ] Out of stock report
- [ ] Dead stock report (no sales in X days)
- [ ] Fast-moving stock report

### 7.7 Inventory Data Model

| Field | Type | Description |
|-------|------|-------------|
| productId | string | Product reference |
| variantId | string | Variant reference (if applicable) |
| sku | string | SKU |
| currentStock | number | Current quantity |
| reservedStock | number | Reserved for orders |
| availableStock | number | Actual available |
| lowStockThreshold | number | Alert threshold |
| warehouseId | string | Warehouse (if multi) |
| lastRestockDate | timestamp | Last restock |
| lastSoldDate | timestamp | Last sale |
| updatedAt | timestamp | Last update |

### 7.8 Stock Movement Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Movement ID |
| productId | string | Product reference |
| variantId | string | Variant reference |
| sku | string | SKU |
| type | string | in/out/adjustment/transfer |
| quantity | number | Movement quantity |
| previousStock | number | Stock before |
| newStock | number | Stock after |
| reason | string | Movement reason |
| notes | string | Additional notes |
| referenceType | string | order/purchase/adjustment |
| referenceId | string | Reference document ID |
| performedBy | string | Staff ID |
| performedByName | string | Staff name |
| createdAt | timestamp | Movement time |

---

## 8. Order Management

### 8.1 Order Listing

#### Features
- [ ] Display all orders in table
- [ ] Search by order number, customer name, email, phone
- [ ] Filter by status
- [ ] Filter by payment status
- [ ] Filter by payment method
- [ ] Filter by date range
- [ ] Filter by order total range
- [ ] Sort by date, total, status
- [ ] Pagination
- [ ] Bulk actions (update status, export)
- [ ] Quick view preview

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Checkbox | No | Bulk selection |
| Order # | Yes | Order number |
| Date | Yes | Order date |
| Customer | Yes | Customer name |
| Items | No | Item count |
| Total | Yes | Order total |
| Payment | No | Payment status |
| Status | Yes | Order status |
| Actions | No | View, Edit, Print |

#### Order Status Badge Colors
| Status | Color |
|--------|-------|
| Pending | Yellow |
| Confirmed | Blue |
| Processing | Indigo |
| Packed | Purple |
| Shipped | Cyan |
| Out for Delivery | Orange |
| Delivered | Green |
| Cancelled | Red |
| Returned | Gray |
| Refunded | Pink |

### 8.2 Order Detail View

#### Order Information
- [ ] Order number
- [ ] Order date and time
- [ ] Order status with timeline
- [ ] Payment status
- [ ] Payment method
- [ ] Transaction ID

#### Customer Information
- [ ] Customer name
- [ ] Customer email
- [ ] Customer phone
- [ ] Customer link (to customer profile)
- [ ] Order count for customer

#### Shipping Information
- [ ] Shipping address (full)
- [ ] Billing address (if different)
- [ ] Shipping method
- [ ] Estimated delivery
- [ ] Tracking number
- [ ] Carrier information

#### Order Items
- [ ] Product image
- [ ] Product name (linked)
- [ ] SKU
- [ ] Variant details
- [ ] Unit price
- [ ] Quantity
- [ ] Line total
- [ ] Item status

#### Order Summary
- [ ] Subtotal
- [ ] Discount (with coupon code)
- [ ] Shipping cost
- [ ] Tax amount
- [ ] Total amount

#### Order Timeline
- [ ] Order placed
- [ ] Payment received
- [ ] Order confirmed
- [ ] Processing started
- [ ] Packed
- [ ] Shipped (with tracking)
- [ ] Out for delivery
- [ ] Delivered
- [ ] All status changes with timestamp and actor

#### Order Notes
- [ ] Customer notes
- [ ] Internal notes (admin only)
- [ ] Add new note

### 8.3 Order Actions

#### Status Updates
- [ ] Confirm order
- [ ] Mark as processing
- [ ] Mark as packed
- [ ] Mark as shipped (add tracking)
- [ ] Mark as delivered
- [ ] Cancel order (with reason)
- [ ] Mark as returned

#### Other Actions
- [ ] Print invoice
- [ ] Print packing slip
- [ ] Print shipping label
- [ ] Send status notification
- [ ] Resend order confirmation
- [ ] Edit order (before processing)
- [ ] Duplicate order
- [ ] Process refund

### 8.4 Refund Management

#### Features
- [ ] Initiate full refund
- [ ] Initiate partial refund
- [ ] Select items to refund
- [ ] Refund reason
- [ ] Refund to original payment method
- [ ] Refund to store credit
- [ ] Restock items toggle
- [ ] Refund confirmation
- [ ] Refund history

### 8.5 Order Edit (Before Processing)

#### Editable Fields
- [ ] Add/remove items
- [ ] Update quantities
- [ ] Change shipping address
- [ ] Change shipping method
- [ ] Apply/remove coupon
- [ ] Add discount
- [ ] Update notes

### 8.6 Bulk Order Operations

- [ ] Bulk status update
- [ ] Bulk export (CSV, Excel)
- [ ] Bulk print invoices
- [ ] Bulk print packing slips
- [ ] Bulk assign to staff

### 8.7 Order Fulfillment

#### Fulfillment Workflow
1. View pending orders
2. Verify payment
3. Check stock availability
4. Print packing slip
5. Pack items
6. Update to packed
7. Generate shipping label
8. Hand over to carrier
9. Update tracking
10. Update to shipped

### 8.8 Order Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Order ID |
| orderNumber | string | Display order number |
| userId | string | Customer ID |
| customerName | string | Customer name |
| customerEmail | string | Customer email |
| customerPhone | string | Customer phone |
| status | string | Order status |
| paymentStatus | string | Payment status |
| paymentMethod | string | Payment method |
| paymentId | string | Payment reference |
| transactionId | string | Transaction ID |
| shippingAddress | map | Shipping address |
| billingAddress | map | Billing address |
| shippingMethod | map | Shipping details |
| items | array | Order items |
| subtotal | number | Items subtotal |
| discount | number | Discount amount |
| couponCode | string | Applied coupon |
| shippingCost | number | Shipping charge |
| taxAmount | number | Tax amount |
| total | number | Grand total |
| currency | string | Currency code |
| customerNotes | string | Customer notes |
| internalNotes | array | Admin notes |
| tracking | map | Tracking info |
| estimatedDelivery | timestamp | Expected delivery |
| timeline | array | Status history |
| assignedTo | string | Assigned staff |
| createdAt | timestamp | Order time |
| updatedAt | timestamp | Last update |
| confirmedAt | timestamp | Confirmation time |
| processedAt | timestamp | Processing start |
| packedAt | timestamp | Packed time |
| shippedAt | timestamp | Shipped time |
| deliveredAt | timestamp | Delivery time |
| cancelledAt | timestamp | Cancellation time |
| cancellationReason | string | Cancel reason |
| cancelledBy | string | Cancelled by |

---

## 9. Customer Management

### 9.1 Customer Listing

#### Features
- [ ] Display all customers in table
- [ ] Search by name, email, phone
- [ ] Filter by status (active, suspended)
- [ ] Filter by registration date
- [ ] Filter by order count
- [ ] Filter by total spent
- [ ] Filter by loyalty tier
- [ ] Sort by name, date, orders, spent
- [ ] Pagination
- [ ] Bulk actions
- [ ] Export customers

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Avatar | No | Profile picture |
| Name | Yes | Customer name |
| Email | Yes | Email address |
| Phone | No | Phone number |
| Orders | Yes | Total orders |
| Total Spent | Yes | Lifetime value |
| Loyalty Tier | Yes | Membership tier |
| Status | Yes | Account status |
| Joined | Yes | Registration date |
| Actions | No | View, Edit |

### 9.2 Customer Detail View

#### Profile Information
- [ ] Avatar
- [ ] Full name
- [ ] Email (with verification status)
- [ ] Phone (with verification status)
- [ ] Registration date
- [ ] Last login
- [ ] Account status
- [ ] Linked auth providers

#### Statistics
- [ ] Total orders
- [ ] Total spent
- [ ] Average order value
- [ ] First order date
- [ ] Last order date
- [ ] Loyalty points
- [ ] Loyalty tier

#### Addresses
- [ ] List all saved addresses
- [ ] Default shipping address
- [ ] Default billing address
- [ ] Add new address
- [ ] Edit address
- [ ] Delete address

#### Order History
- [ ] List all orders
- [ ] Order status
- [ ] Order total
- [ ] Order date
- [ ] View order detail

#### Wishlist
- [ ] View customer's wishlist items

#### Reviews
- [ ] List reviews by customer
- [ ] Review status
- [ ] Rating given

#### Support Tickets
- [ ] List customer's tickets
- [ ] Ticket status

#### Activity Log
- [ ] Login history
- [ ] Order history
- [ ] Profile changes

#### Notes
- [ ] Internal notes about customer
- [ ] Add new note

### 9.3 Customer Actions

- [ ] Edit customer profile
- [ ] Reset password
- [ ] Suspend account
- [ ] Activate account
- [ ] Delete account
- [ ] Merge duplicate accounts
- [ ] Impersonate customer (login as)
- [ ] Send notification
- [ ] Add loyalty points
- [ ] Deduct loyalty points

### 9.4 Customer Segments

#### Features
- [ ] Create customer segments
- [ ] Segment by total spent
- [ ] Segment by order count
- [ ] Segment by location
- [ ] Segment by loyalty tier
- [ ] Segment by last order date
- [ ] Segment by registration date
- [ ] Use segments for targeted marketing

### 9.5 Customer Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID |
| email | string | Email address |
| phoneNumber | string | Phone number |
| displayName | string | Full name |
| firstName | string | First name |
| lastName | string | Last name |
| photoUrl | string | Avatar URL |
| isEmailVerified | boolean | Email verified |
| isPhoneVerified | boolean | Phone verified |
| status | string | Account status |
| role | string | User role |
| defaultAddressId | string | Default address |
| totalOrders | number | Order count |
| totalSpent | number | Lifetime value |
| averageOrderValue | number | AOV |
| firstOrderDate | timestamp | First order |
| lastOrderDate | timestamp | Last order |
| loyaltyTier | string | Membership tier |
| loyaltyPoints | number | Current points |
| referralCode | string | Referral code |
| referredBy | string | Referrer ID |
| linkedProviders | array | Auth providers |
| createdAt | timestamp | Registration |
| updatedAt | timestamp | Last update |
| lastLoginAt | timestamp | Last login |
| notes | array | Admin notes |
| tags | array | Customer tags |

---

## 10. Coupon & Promotions

### 10.1 Coupon Listing

#### Features
- [ ] Display all coupons in table
- [ ] Search by code, title
- [ ] Filter by status (active, inactive, expired)
- [ ] Filter by discount type
- [ ] Filter by date range
- [ ] Sort by code, usage, created date
- [ ] Pagination
- [ ] Bulk actions

#### Table Columns
| Column | Description |
|--------|-------------|
| Code | Coupon code |
| Title | Coupon title |
| Type | Discount type |
| Value | Discount value |
| Usage | Used/Limit |
| Valid From | Start date |
| Valid Until | End date |
| Status | Active/Inactive |
| Actions | Edit, Delete, Duplicate |

### 10.2 Add/Edit Coupon

#### Basic Information
- [ ] Coupon code (required, unique)
- [ ] Auto-generate code option
- [ ] Coupon title (required)
- [ ] Description

#### Discount Settings
- [ ] Discount type (percentage, fixed, free shipping, BOGO)
- [ ] Discount value
- [ ] Maximum discount cap (for percentage)

#### Usage Restrictions
- [ ] Minimum order value
- [ ] Maximum order value
- [ ] Usage limit (total)
- [ ] Usage limit per user
- [ ] First order only toggle

#### Product Restrictions
- [ ] Apply to all products
- [ ] Apply to specific categories
- [ ] Apply to specific products
- [ ] Exclude specific products
- [ ] Exclude sale items toggle

#### User Restrictions
- [ ] Available to all users
- [ ] Available to specific users
- [ ] Available to specific user groups

#### Validity
- [ ] Start date and time
- [ ] End date and time
- [ ] Active/Inactive toggle

#### Terms
- [ ] Terms and conditions text

### 10.3 Coupon Analytics

- [ ] Total usage count
- [ ] Total discount given
- [ ] Average discount per order
- [ ] Orders using coupon
- [ ] Revenue with coupon
- [ ] Conversion impact

### 10.4 Coupon Actions

- [ ] Create coupon
- [ ] Edit coupon
- [ ] Delete coupon
- [ ] Duplicate coupon
- [ ] Activate/Deactivate coupon
- [ ] Bulk generate codes
- [ ] Export coupons

### 10.5 Coupon Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Coupon ID |
| code | string | Unique code |
| title | string | Display title |
| description | string | Description |
| discountType | string | Type of discount |
| discountValue | number | Discount amount |
| maxDiscount | number | Maximum cap |
| minOrderValue | number | Minimum order |
| maxOrderValue | number | Maximum order |
| usageLimit | number | Total usage limit |
| usedCount | number | Times used |
| perUserLimit | number | Per user limit |
| isFirstOrderOnly | boolean | First order flag |
| applicableCategories | array | Category IDs |
| applicableProducts | array | Product IDs |
| excludedProducts | array | Excluded IDs |
| excludeSaleItems | boolean | Exclude sales |
| applicableUsers | array | User IDs |
| applicableUserGroups | array | User groups |
| startDate | timestamp | Valid from |
| endDate | timestamp | Valid until |
| isActive | boolean | Active status |
| termsAndConditions | string | T&C text |
| totalDiscountGiven | number | Total discount |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 11. Flash Sales Management

### 11.1 Flash Sale Listing

#### Features
- [ ] Display all flash sales
- [ ] Filter by status (upcoming, active, ended)
- [ ] Sort by start date, end date
- [ ] View sale performance
- [ ] Quick start/end sale

### 11.2 Add/Edit Flash Sale

#### Basic Information
- [ ] Sale title (required)
- [ ] Description
- [ ] Banner image upload
- [ ] Start date and time (required)
- [ ] End date and time (required)
- [ ] Active status

#### Sale Items
- [ ] Add products to sale
- [ ] Set sale price per product
- [ ] Set stock limit per product
- [ ] Remove products from sale
- [ ] Bulk add products

#### Sale Item Fields
| Field | Description |
|-------|-------------|
| Product | Product selection |
| Original Price | Regular price |
| Sale Price | Flash sale price |
| Discount % | Auto-calculated |
| Stock Limit | Max units for sale |
| Sold Count | Units sold |

### 11.3 Flash Sale Analytics

- [ ] Total revenue
- [ ] Total units sold
- [ ] Average discount given
- [ ] Product-wise performance
- [ ] Time-wise sales chart

### 11.4 Flash Sale Actions

- [ ] Create flash sale
- [ ] Edit flash sale
- [ ] Delete flash sale
- [ ] Start sale early
- [ ] End sale early
- [ ] Duplicate flash sale

### 11.5 Flash Sale Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Sale ID |
| title | string | Sale title |
| description | string | Description |
| bannerUrl | string | Banner image |
| startTime | timestamp | Start time |
| endTime | timestamp | End time |
| isActive | boolean | Active status |
| status | string | upcoming/active/ended |
| totalProducts | number | Product count |
| totalRevenue | number | Revenue generated |
| totalUnitsSold | number | Units sold |
| items | array | Sale items |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 12. Banner Management

### 12.1 Banner Listing

#### Features
- [ ] Display all banners
- [ ] Filter by position (home top, home middle, category, etc.)
- [ ] Filter by status
- [ ] Sort by order, created date
- [ ] Drag and drop reordering
- [ ] Preview banner

### 12.2 Add/Edit Banner

#### Fields
- [ ] Banner title (required)
- [ ] Subtitle
- [ ] Desktop image upload (required)
- [ ] Mobile image upload
- [ ] Position selection (required)
- [ ] Link type (product, category, brand, URL, none)
- [ ] Link value
- [ ] Sort order
- [ ] Start date
- [ ] End date
- [ ] Active status

#### Banner Positions
| Position | Description |
|----------|-------------|
| home_hero | Main hero slider |
| home_middle | Middle section |
| home_bottom | Bottom section |
| category_top | Category page header |
| product_sidebar | Product page sidebar |
| cart_banner | Cart page |
| checkout_banner | Checkout page |

### 12.3 Banner Analytics

- [ ] View count (impressions)
- [ ] Click count
- [ ] Click-through rate (CTR)

### 12.4 Banner Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Banner ID |
| title | string | Banner title |
| subtitle | string | Subtitle text |
| imageUrl | string | Desktop image |
| mobileImageUrl | string | Mobile image |
| position | string | Display position |
| linkType | string | Link type |
| linkValue | string | Link destination |
| sortOrder | number | Display order |
| startDate | timestamp | Show from |
| endDate | timestamp | Show until |
| isActive | boolean | Active status |
| viewCount | number | Impressions |
| clickCount | number | Clicks |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 13. Review Management

### 13.1 Review Listing

#### Features
- [ ] Display all reviews in table
- [ ] Search by product, customer, content
- [ ] Filter by status (pending, approved, rejected)
- [ ] Filter by rating (1-5 stars)
- [ ] Filter by verified purchase
- [ ] Filter by date range
- [ ] Sort by date, rating
- [ ] Pagination
- [ ] Bulk actions

#### Table Columns
| Column | Description |
|--------|-------------|
| Product | Product name with image |
| Customer | Reviewer name |
| Rating | Star rating |
| Review | Review text (truncated) |
| Verified | Purchase verified |
| Status | Pending/Approved/Rejected |
| Date | Review date |
| Actions | View, Approve, Reject, Delete |

### 13.2 Review Detail View

#### Information
- [ ] Product details
- [ ] Customer details
- [ ] Order reference (if verified)
- [ ] Rating
- [ ] Review title
- [ ] Review content
- [ ] Review images
- [ ] Review video
- [ ] Helpful votes
- [ ] Report count
- [ ] Created date

#### Moderation
- [ ] Approve review
- [ ] Reject review (with reason)
- [ ] Delete review
- [ ] Reply to review
- [ ] Edit reply
- [ ] Delete reply

### 13.3 Review Actions

- [ ] Approve review
- [ ] Reject review
- [ ] Delete review
- [ ] Bulk approve
- [ ] Bulk reject
- [ ] Bulk delete
- [ ] Reply to review
- [ ] Report to product team

### 13.4 Review Settings

- [ ] Auto-approve verified purchases
- [ ] Auto-approve above X stars
- [ ] Require approval for all
- [ ] Enable review images
- [ ] Enable review videos
- [ ] Minimum review length
- [ ] Profanity filter

### 13.5 Review Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Review ID |
| productId | string | Product reference |
| productName | string | Product name |
| userId | string | Reviewer ID |
| userName | string | Reviewer name |
| userAvatar | string | Reviewer avatar |
| orderId | string | Order reference |
| isVerifiedPurchase | boolean | Verified buyer |
| rating | number | Rating 1-5 |
| title | string | Review title |
| content | string | Review text |
| images | array | Review images |
| videoUrl | string | Review video |
| helpfulCount | number | Helpful votes |
| notHelpfulCount | number | Not helpful |
| reportCount | number | Reports |
| status | string | Moderation status |
| rejectionReason | string | Rejection reason |
| sellerReply | map | Admin reply |
| createdAt | timestamp | Review time |
| updatedAt | timestamp | Last update |
| approvedAt | timestamp | Approval time |
| approvedBy | string | Approver ID |

---

## 14. Support Ticket Management

### 14.1 Ticket Listing

#### Features
- [ ] Display all tickets in table
- [ ] Search by ticket number, customer, subject
- [ ] Filter by status
- [ ] Filter by category
- [ ] Filter by priority
- [ ] Filter by assigned agent
- [ ] Filter by date range
- [ ] Sort by date, priority, status
- [ ] Pagination
- [ ] Bulk actions

#### Table Columns
| Column | Description |
|--------|-------------|
| Ticket # | Ticket number |
| Subject | Ticket subject |
| Customer | Customer name |
| Category | Ticket category |
| Priority | Low/Medium/High/Urgent |
| Status | Current status |
| Assigned To | Agent name |
| Last Update | Last activity |
| Actions | View, Assign |

#### Priority Colors
| Priority | Color |
|----------|-------|
| Low | Green |
| Medium | Blue |
| High | Orange |
| Urgent | Red |

### 14.2 Ticket Detail View

#### Ticket Information
- [ ] Ticket number
- [ ] Subject
- [ ] Category
- [ ] Priority
- [ ] Status
- [ ] Created date
- [ ] Last updated

#### Customer Information
- [ ] Customer name
- [ ] Customer email
- [ ] Customer phone
- [ ] Link to customer profile
- [ ] Related order (if applicable)

#### Conversation
- [ ] Thread of messages
- [ ] Message sender (customer/agent)
- [ ] Message timestamp
- [ ] Attachments
- [ ] Internal notes (hidden from customer)

#### Response Box
- [ ] Rich text editor
- [ ] Canned responses
- [ ] Attach files
- [ ] Internal note toggle
- [ ] Send response

### 14.3 Ticket Actions

- [ ] Reply to ticket
- [ ] Add internal note
- [ ] Change status
- [ ] Change priority
- [ ] Assign to agent
- [ ] Transfer to department
- [ ] Merge tickets
- [ ] Close ticket
- [ ] Reopen ticket

### 14.4 Canned Responses

- [ ] Create canned responses
- [ ] Categorize responses
- [ ] Insert response in reply
- [ ] Edit responses
- [ ] Delete responses

### 14.5 Ticket Metrics

- [ ] Total tickets
- [ ] Open tickets
- [ ] Average response time
- [ ] Average resolution time
- [ ] Customer satisfaction (CSAT)
- [ ] Agent performance

### 14.6 Ticket Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Ticket ID |
| ticketNumber | string | Display number |
| userId | string | Customer ID |
| userName | string | Customer name |
| userEmail | string | Customer email |
| userPhone | string | Customer phone |
| orderId | string | Related order |
| subject | string | Ticket subject |
| category | string | Ticket category |
| priority | string | Priority level |
| status | string | Current status |
| assignedAgentId | string | Assigned agent |
| assignedAgentName | string | Agent name |
| department | string | Department |
| tags | array | Ticket tags |
| messages | array | Conversation |
| attachments | array | All attachments |
| firstResponseAt | timestamp | First response |
| resolvedAt | timestamp | Resolution time |
| closedAt | timestamp | Closure time |
| satisfactionRating | number | CSAT score |
| feedback | string | Customer feedback |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 15. Notification Management

### 15.1 Send Notification

#### Features
- [ ] Send push notification
- [ ] Send email notification
- [ ] Send SMS notification
- [ ] Send to all users
- [ ] Send to specific users
- [ ] Send to user segments
- [ ] Send to topic subscribers
- [ ] Schedule notification

#### Notification Form
- [ ] Title (required)
- [ ] Body (required)
- [ ] Image URL
- [ ] Action type (open app, deep link, URL)
- [ ] Action value
- [ ] Target audience
- [ ] Schedule date/time
- [ ] Channels (push, email, SMS)

### 15.2 Notification History

#### Features
- [ ] List all sent notifications
- [ ] Filter by type
- [ ] Filter by channel
- [ ] Filter by date
- [ ] View delivery stats
- [ ] Resend notification

#### Notification Stats
- [ ] Total sent
- [ ] Delivered
- [ ] Opened
- [ ] Clicked
- [ ] Failed

### 15.3 Notification Templates

- [ ] Create templates
- [ ] Edit templates
- [ ] Delete templates
- [ ] Use templates when sending
- [ ] Template variables

### 15.4 Automated Notifications

#### Trigger-based Notifications
- [ ] Order placed
- [ ] Order confirmed
- [ ] Order shipped
- [ ] Order delivered
- [ ] Order cancelled
- [ ] Payment success
- [ ] Payment failed
- [ ] Abandoned cart reminder
- [ ] Back in stock
- [ ] Price drop alert
- [ ] Review reminder
- [ ] Birthday wishes
- [ ] Loyalty tier upgrade

### 15.5 Notification Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Notification ID |
| title | string | Notification title |
| body | string | Notification body |
| imageUrl | string | Image URL |
| actionType | string | Action type |
| actionValue | string | Action destination |
| targetType | string | all/users/segment/topic |
| targetValue | array | Target IDs |
| channels | array | push/email/sms |
| scheduledAt | timestamp | Scheduled time |
| sentAt | timestamp | Sent time |
| status | string | Status |
| stats | map | Delivery stats |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |

---

## 16. Loyalty Program Management

### 16.1 Loyalty Overview

#### Statistics
- [ ] Total enrolled members
- [ ] Active members (last 30 days)
- [ ] Total points issued
- [ ] Total points redeemed
- [ ] Points pending expiry
- [ ] Members by tier

### 16.2 Member Management

#### Features
- [ ] List all loyalty members
- [ ] Search by name, email
- [ ] Filter by tier
- [ ] Filter by points range
- [ ] View member details
- [ ] Adjust points manually
- [ ] View transaction history

### 16.3 Points Adjustment

#### Features
- [ ] Add points to user
- [ ] Deduct points from user
- [ ] Bulk add/deduct
- [ ] Adjustment reason
- [ ] Adjustment notes

### 16.4 Loyalty Settings

#### Points Configuration
- [ ] Points per currency spent
- [ ] Points value (currency per point)
- [ ] Minimum points to redeem
- [ ] Maximum redemption per order (%)
- [ ] Points expiry period
- [ ] Referral bonus points
- [ ] Review bonus points
- [ ] Birthday bonus points
- [ ] Registration bonus points

#### Tier Configuration
| Tier | Points Required | Multiplier | Benefits |
|------|-----------------|------------|----------|
| Bronze | 0 | 1x | Basic |
| Silver | 1000 | 1.5x | Free shipping |
| Gold | 5000 | 2x | Priority support |
| Platinum | 10000 | 3x | Exclusive access |

### 16.5 Referral Program

#### Features
- [ ] View all referrals
- [ ] Referral statistics
- [ ] Configure referral bonus
- [ ] Configure referee bonus
- [ ] Referral terms

### 16.6 Loyalty Reports

- [ ] Points issued report
- [ ] Points redeemed report
- [ ] Points expired report
- [ ] Tier distribution report
- [ ] Top point earners
- [ ] Referral performance

---

## 17. Reports & Analytics

### 17.1 Sales Reports

#### Reports Available
- [ ] Sales overview (daily, weekly, monthly, yearly)
- [ ] Sales by product
- [ ] Sales by category
- [ ] Sales by brand
- [ ] Sales by payment method
- [ ] Sales by customer
- [ ] Sales by location
- [ ] Sales trend analysis
- [ ] Hourly sales distribution
- [ ] Weekday sales distribution

#### Report Features
- [ ] Date range selection
- [ ] Comparison with previous period
- [ ] Chart visualization
- [ ] Table view
- [ ] Export to CSV
- [ ] Export to PDF
- [ ] Schedule email reports

### 17.2 Order Reports

#### Reports Available
- [ ] Orders overview
- [ ] Orders by status
- [ ] Orders by payment status
- [ ] Average order value trend
- [ ] Order fulfillment time
- [ ] Cancellation rate
- [ ] Return rate
- [ ] COD vs Prepaid ratio

### 17.3 Product Reports

#### Reports Available
- [ ] Best selling products
- [ ] Worst selling products
- [ ] Product views
- [ ] Product conversion rate
- [ ] Category performance
- [ ] Brand performance
- [ ] Out of stock impact
- [ ] Price change impact

### 17.4 Customer Reports

#### Reports Available
- [ ] New vs returning customers
- [ ] Customer acquisition
- [ ] Customer lifetime value
- [ ] Customer retention
- [ ] Cohort analysis
- [ ] Geographic distribution
- [ ] Customer segmentation
- [ ] Purchase frequency

### 17.5 Inventory Reports

#### Reports Available
- [ ] Stock valuation
- [ ] Stock movement
- [ ] Low stock report
- [ ] Out of stock report
- [ ] Dead stock report
- [ ] Stock turnover

### 17.6 Marketing Reports

#### Reports Available
- [ ] Coupon usage
- [ ] Coupon revenue impact
- [ ] Flash sale performance
- [ ] Banner CTR
- [ ] Referral program performance
- [ ] Loyalty program engagement

### 17.7 Financial Reports

#### Reports Available
- [ ] Revenue report
- [ ] Profit margin report
- [ ] Tax collected report
- [ ] Refund report
- [ ] Payment method distribution
- [ ] Transaction fees

### 17.8 Custom Reports

- [ ] Create custom reports
- [ ] Select metrics
- [ ] Select dimensions
- [ ] Add filters
- [ ] Save report
- [ ] Schedule report

---

## 18. Content Management

### 18.1 Static Pages

#### Features
- [ ] Create new page
- [ ] Edit page content
- [ ] Delete page
- [ ] Page URL slug
- [ ] SEO settings
- [ ] Publish/Unpublish

#### Default Pages
- About Us
- Contact Us
- Privacy Policy
- Terms and Conditions
- Return Policy
- Shipping Policy
- FAQ

#### Page Editor
- [ ] Rich text editor
- [ ] Image upload
- [ ] Video embed
- [ ] HTML mode
- [ ] Preview

### 18.2 FAQ Management

#### Features
- [ ] Create FAQ categories
- [ ] Add FAQ questions
- [ ] Edit FAQs
- [ ] Delete FAQs
- [ ] Reorder FAQs
- [ ] Search FAQs

### 18.3 Email Templates

#### Templates
- [ ] Welcome email
- [ ] Order confirmation
- [ ] Order shipped
- [ ] Order delivered
- [ ] Order cancelled
- [ ] Payment confirmation
- [ ] Password reset
- [ ] Review request
- [ ] Promotional email

#### Template Editor
- [ ] Visual editor
- [ ] HTML editor
- [ ] Variable insertion
- [ ] Preview
- [ ] Test send

### 18.4 App Configuration

#### General Settings
- [ ] App name
- [ ] App logo
- [ ] App favicon
- [ ] Primary color
- [ ] Secondary color
- [ ] Contact email
- [ ] Contact phone
- [ ] Social media links

---

## 19. Settings & Configuration

### 19.1 General Settings

| Setting | Description |
|---------|-------------|
| Store Name | Business name |
| Store Logo | Brand logo |
| Store Email | Contact email |
| Store Phone | Contact phone |
| Store Address | Business address |
| Timezone | Business timezone |
| Date Format | Date display format |
| Time Format | Time display format |

### 19.2 Currency Settings

| Setting | Description |
|---------|-------------|
| Default Currency | Primary currency |
| Currency Symbol | Symbol position |
| Decimal Places | Decimal precision |
| Thousand Separator | Number formatting |
| Supported Currencies | Multi-currency |
| Exchange Rates | Conversion rates |

### 19.3 Tax Settings

| Setting | Description |
|---------|-------------|
| Enable Tax | Tax calculation on/off |
| Tax Inclusive | Price includes tax |
| Default Tax Rate | Standard tax % |
| Tax Classes | Different tax rates |
| Tax Rules | Category-wise tax |
| GST Number | Business GST |
| Tax Display | Show tax in cart |

### 19.4 Shipping Settings

| Setting | Description |
|---------|-------------|
| Free Shipping Threshold | Minimum for free shipping |
| Default Shipping Rate | Standard rate |
| Express Shipping Rate | Express rate |
| Shipping Zones | Zone configuration |
| Weight-based Rates | Rate by weight |
| Carrier Integration | Carrier APIs |
| Restricted Pincodes | Non-serviceable areas |
| Delivery Time | Estimated days |

### 19.5 Payment Settings

| Setting | Description |
|---------|-------------|
| Enabled Methods | Active payment methods |
| Razorpay Settings | API credentials |
| Stripe Settings | API credentials |
| COD Settings | COD configuration |
| Wallet Settings | Wallet configuration |
| Payment Instructions | Method-wise instructions |

### 19.6 Order Settings

| Setting | Description |
|---------|-------------|
| Order Number Prefix | ORD- |
| Order Number Format | Sequential/Random |
| Minimum Order Value | Minimum cart total |
| Maximum Order Value | Maximum cart total |
| Auto-confirm Orders | Auto confirmation |
| Cancellation Policy | Cancellation rules |
| Return Window | Days for return |

### 19.7 Notification Settings

| Setting | Description |
|---------|-------------|
| FCM Server Key | Push notification key |
| Email SMTP | SMTP configuration |
| SMS Gateway | SMS API credentials |
| WhatsApp API | WhatsApp credentials |
| Notification Events | Event toggles |

### 19.8 Security Settings

| Setting | Description |
|---------|-------------|
| Session Timeout | Inactivity timeout |
| Max Login Attempts | Before lockout |
| Lockout Duration | Lockout period |
| Password Policy | Password requirements |
| Two-Factor Auth | 2FA settings |
| IP Whitelist | Allowed IPs |

---

## 20. Staff Management

### 20.1 Staff Listing

#### Features
- [ ] Display all staff in table
- [ ] Search by name, email
- [ ] Filter by role
- [ ] Filter by status
- [ ] Sort by name, date
- [ ] Pagination

#### Table Columns
| Column | Description |
|--------|-------------|
| Avatar | Profile picture |
| Name | Staff name |
| Email | Email address |
| Role | Assigned role |
| Status | Active/Inactive |
| Last Login | Last activity |
| Actions | Edit, Delete |

### 20.2 Add/Edit Staff

#### Fields
- [ ] Full name (required)
- [ ] Email (required, unique)
- [ ] Phone number
- [ ] Avatar upload
- [ ] Role selection (required)
- [ ] Additional permissions
- [ ] Active status
- [ ] Force password change
- [ ] Two-factor authentication

### 20.3 Staff Actions

- [ ] Add staff member
- [ ] Edit staff details
- [ ] Change staff role
- [ ] Reset staff password
- [ ] Activate/Deactivate staff
- [ ] Delete staff member
- [ ] View staff activity

### 20.4 Staff Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Staff ID |
| email | string | Login email |
| name | string | Full name |
| phone | string | Phone number |
| avatar | string | Profile picture |
| roleId | string | Role reference |
| roleName | string | Role name |
| permissions | array | Direct permissions |
| isActive | boolean | Active status |
| isSuperAdmin | boolean | Super admin |
| twoFactorEnabled | boolean | 2FA enabled |
| mustChangePassword | boolean | Force change |
| lastLoginAt | timestamp | Last login |
| lastLoginIp | string | Last IP |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 21. Role & Permission Management

### 21.1 Role Listing

#### Features
- [ ] Display all roles
- [ ] View role permissions
- [ ] Staff count per role
- [ ] System role indicator

### 21.2 Add/Edit Role

#### Fields
- [ ] Role name (required)
- [ ] Role description
- [ ] Permission assignment

### 21.3 Permission Matrix

#### Modules and Actions
| Module | View | Create | Edit | Delete | Special |
|--------|------|--------|------|--------|---------|
| Dashboard | ✓ | - | - | - | Export |
| Products | ✓ | ✓ | ✓ | ✓ | Import, Export |
| Categories | ✓ | ✓ | ✓ | ✓ | - |
| Brands | ✓ | ✓ | ✓ | ✓ | - |
| Inventory | ✓ | - | ✓ | - | Adjust |
| Orders | ✓ | - | ✓ | - | Cancel, Refund |
| Customers | ✓ | - | ✓ | ✓ | Suspend, Impersonate |
| Coupons | ✓ | ✓ | ✓ | ✓ | - |
| Flash Sales | ✓ | ✓ | ✓ | ✓ | - |
| Banners | ✓ | ✓ | ✓ | ✓ | - |
| Reviews | ✓ | - | ✓ | ✓ | Moderate |
| Support | ✓ | - | ✓ | - | Assign, Close |
| Notifications | ✓ | ✓ | - | - | Send |
| Loyalty | ✓ | - | ✓ | - | Adjust |
| Reports | ✓ | - | - | - | Export |
| Content | ✓ | ✓ | ✓ | ✓ | - |
| Settings | ✓ | - | ✓ | - | - |
| Staff | ✓ | ✓ | ✓ | ✓ | - |
| Roles | ✓ | ✓ | ✓ | ✓ | - |
| Activity Logs | ✓ | - | - | - | Export |

### 21.4 Default Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| Super Admin | Full access | All permissions |
| Store Manager | Manage store | All except staff/settings |
| Inventory Manager | Manage products | Products, Categories, Inventory |
| Order Manager | Process orders | Orders, Customers |
| Marketing Manager | Marketing tasks | Coupons, Flash Sales, Banners |
| Support Agent | Customer support | Support, limited Customers |
| Content Editor | Manage content | Banners, Content |
| Viewer | View only | View all, no actions |

### 21.5 Role Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Role ID |
| name | string | Role name |
| description | string | Description |
| permissions | map | Permission matrix |
| isSystemRole | boolean | Cannot delete |
| staffCount | number | Staff with role |
| createdBy | string | Creator ID |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update |

---

## 22. Activity Logs

### 22.1 Log Listing

#### Features
- [ ] Display all logs
- [ ] Search by description
- [ ] Filter by staff member
- [ ] Filter by module
- [ ] Filter by action type
- [ ] Filter by date range
- [ ] Sort by date
- [ ] Pagination
- [ ] Export logs

#### Table Columns
| Column | Description |
|--------|-------------|
| Date/Time | Action timestamp |
| Staff | Who performed |
| Action | Action type |
| Module | Affected module |
| Description | Action description |
| IP Address | Actor's IP |

### 22.2 Log Detail

- [ ] Full action details
- [ ] Previous values
- [ ] New values
- [ ] Changed fields
- [ ] Related entity

### 22.3 Action Types

| Action | Description |
|--------|-------------|
| create | Created new entity |
| update | Updated entity |
| delete | Deleted entity |
| view | Viewed entity |
| login | Staff login |
| logout | Staff logout |
| export | Exported data |
| import | Imported data |
| approve | Approved item |
| reject | Rejected item |
| assign | Assigned to staff |
| status_change | Changed status |

### 22.4 Activity Log Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | string | Log ID |
| staffId | string | Staff ID |
| staffName | string | Staff name |
| staffEmail | string | Staff email |
| action | string | Action type |
| module | string | Affected module |
| entityType | string | Entity type |
| entityId | string | Entity ID |
| entityName | string | Entity name |
| description | string | Action description |
| oldValue | map | Previous state |
| newValue | map | New state |
| changes | array | Changed fields |
| ipAddress | string | IP address |
| userAgent | string | Browser/device |
| createdAt | timestamp | Action time |

---

## 23. Data Models

### 23.1 All Admin Data Models Summary

| Model | Collection | Purpose |
|-------|------------|---------|
| Staff | staff | Admin users |
| Role | roles | Staff roles |
| Permission | (embedded) | Access permissions |
| ActivityLog | activity_logs | Audit trail |
| Product | products | Product catalog |
| Category | categories | Product categories |
| Brand | brands | Product brands |
| Inventory | (embedded) | Stock management |
| StockMovement | stock_movements | Stock history |
| Order | orders | Customer orders |
| Payment | payments | Transactions |
| Customer | users | Customer accounts |
| Coupon | coupons | Discount codes |
| FlashSale | flash_sales | Flash sales |
| Banner | banners | Promotional banners |
| Review | reviews | Product reviews |
| SupportTicket | support_tickets | Support tickets |
| Notification | notifications | Sent notifications |
| LoyaltyAccount | loyalty_accounts | Loyalty program |
| DailyAnalytics | analytics/daily | Daily stats |
| AppConfig | app_config | App settings |
| Page | pages | Static pages |
| FAQ | faqs | FAQ items |
| EmailTemplate | email_templates | Email templates |

---

## 24. Screen Specifications

### 24.1 Admin Panel Screens (35 Screens)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 1 | Login | /login | Admin authentication |
| 2 | Forgot Password | /forgot-password | Password reset |
| 3 | Dashboard | /dashboard | Overview & stats |
| 4 | Products List | /products | All products |
| 5 | Add Product | /products/add | Create product |
| 6 | Edit Product | /products/:id/edit | Modify product |
| 7 | Categories List | /categories | All categories |
| 8 | Add/Edit Category | /categories/form | Category form |
| 9 | Brands List | /brands | All brands |
| 10 | Add/Edit Brand | /brands/form | Brand form |
| 11 | Inventory | /inventory | Stock management |
| 12 | Stock History | /inventory/history | Movement history |
| 13 | Orders List | /orders | All orders |
| 14 | Order Detail | /orders/:id | Single order |
| 15 | Customers List | /customers | All customers |
| 16 | Customer Detail | /customers/:id | Single customer |
| 17 | Coupons List | /coupons | All coupons |
| 18 | Add/Edit Coupon | /coupons/form | Coupon form |
| 19 | Flash Sales List | /flash-sales | All flash sales |
| 20 | Add/Edit Flash Sale | /flash-sales/form | Flash sale form |
| 21 | Banners List | /banners | All banners |
| 22 | Add/Edit Banner | /banners/form | Banner form |
| 23 | Reviews List | /reviews | All reviews |
| 24 | Review Detail | /reviews/:id | Single review |
| 25 | Support Tickets | /support | All tickets |
| 26 | Ticket Detail | /support/:id | Single ticket |
| 27 | Notifications | /notifications | Send notifications |
| 28 | Loyalty Program | /loyalty | Loyalty management |
| 29 | Reports | /reports | Analytics reports |
| 30 | Pages | /content/pages | Static pages |
| 31 | FAQs | /content/faqs | FAQ management |
| 32 | Settings | /settings | App configuration |
| 33 | Staff List | /staff | All staff |
| 34 | Add/Edit Staff | /staff/form | Staff form |
| 35 | Roles | /roles | Role management |
| 36 | Activity Logs | /logs | Audit trail |

---

## 25. UI/UX Requirements

### 25.1 Layout Structure

#### Desktop Layout (1024px+)
- Fixed sidebar navigation (collapsible)
- Top header with search, notifications, profile
- Main content area
- Breadcrumb navigation

#### Tablet Layout (768px - 1023px)
- Collapsible sidebar (drawer)
- Top header
- Full-width content

#### Mobile Layout (< 768px)
- Bottom navigation or hamburger menu
- Full-width content
- Simplified tables (card view)

### 25.2 Navigation Structure

```
├── Dashboard
├── Catalog
│   ├── Products
│   ├── Categories
│   └── Brands
├── Inventory
│   ├── Stock Overview
│   └── Stock History
├── Sales
│   ├── Orders
│   └── Payments
├── Customers
│   ├── All Customers
│   └── Segments
├── Marketing
│   ├── Coupons
│   ├── Flash Sales
│   └── Banners
├── Reviews
├── Support
├── Notifications
├── Loyalty
├── Reports
│   ├── Sales Reports
│   ├── Product Reports
│   ├── Customer Reports
│   └── Inventory Reports
├── Content
│   ├── Pages
│   ├── FAQs
│   └── Email Templates
├── Settings
│   ├── General
│   ├── Payments
│   ├── Shipping
│   ├── Tax
│   └── Notifications
├── Staff
│   ├── All Staff
│   └── Roles
└── Activity Logs
```

### 25.3 Color Scheme

| Element | Light Theme | Dark Theme |
|---------|-------------|------------|
| Primary | #2563EB | #3B82F6 |
| Background | #F9FAFB | #111827 |
| Surface | #FFFFFF | #1F2937 |
| Text Primary | #111827 | #F9FAFB |
| Text Secondary | #6B7280 | #9CA3AF |
| Border | #E5E7EB | #374151 |
| Success | #10B981 | #34D399 |
| Warning | #F59E0B | #FBBF24 |
| Error | #EF4444 | #F87171 |
| Info | #3B82F6 | #60A5FA |

### 25.4 Component Library

#### Required Components
- AppBar with search and actions
- Sidebar navigation
- Data table with sorting, filtering, pagination
- Form inputs (text, select, checkbox, radio, switch)
- Date picker and date range picker
- Rich text editor
- File upload (single and multiple)
- Image upload with preview
- Modal dialogs
- Confirmation dialogs
- Toast notifications
- Loading skeletons
- Empty states
- Error states
- Stat cards
- Charts (line, bar, pie, area)
- Badges and chips
- Progress indicators
- Tooltips
- Dropdown menus
- Tabs
- Accordions
- Breadcrumbs
- Pagination
- Search input with suggestions

### 25.5 Responsive Tables

#### Desktop
- Full table with all columns
- Inline actions

#### Tablet
- Scrollable table
- Hidden less important columns

#### Mobile
- Card-based view
- Expandable details
- Action menu

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial admin panel requirements |

---

## Document References

| Document | Purpose |
|----------|---------|
| ecommerce_requirements.md | User app requirements |
| ecommerce_technical.md | Technical specifications |
| firebase_schema.md | Database schema |
| phase_plan.md | Development timeline |

---

*This document serves as the complete reference for Admin Panel development. All features, screens, and data models are specified for end-to-end implementation.*
