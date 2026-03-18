# E-Commerce Flutter Application - Requirements Document

## Project Overview

**Project Name:** [Your App Name]
**Platform:** Flutter (iOS, Android, Web, Desktop)
**Target Audience:** [Define your target users]

---

## Table of Contents

1. [User App Features](#1-user-app-features)
2. [Admin Panel Features](#2-admin-panel-features)
3. [Data Model Requirements](#3-data-model-requirements)
4. [Screen List](#4-screen-list)

---

## 1. User App Features

### 1.1 Authentication Module

#### Core Features
- [ ] Email/Password registration and login
- [ ] Phone number authentication with OTP
- [ ] Social login (Google, Apple, Facebook)
- [ ] Guest browsing mode (limited features)
- [ ] Password reset via email
- [ ] Email verification flow
- [ ] Session management with auto-logout
- [ ] Biometric authentication (fingerprint/face ID)

#### Advanced Features
- [ ] Two-factor authentication (2FA)
- [ ] Device management (view/remove logged-in devices)
- [ ] Login activity history
- [ ] Account linking (connect multiple auth providers)
- [ ] Progressive profiling (collect info gradually)

---

### 1.2 User Profile Management

#### Core Features
- [ ] View and edit profile information
- [ ] Profile picture upload/change
- [ ] Multiple shipping addresses (CRUD operations)
- [ ] Set default shipping/billing address
- [ ] Phone number management
- [ ] Account deletion request

#### Advanced Features
- [ ] Address auto-complete with Google Places API
- [ ] Address validation
- [ ] Profile completion progress indicator
- [ ] Preference settings (language, currency, notifications)
- [ ] Dark/Light theme toggle
- [ ] Export personal data (GDPR compliance)

---

### 1.3 Product Catalog

#### Core Features
- [ ] Browse products with grid/list view toggle
- [ ] Category-based navigation (multi-level categories)
- [ ] Product detail page with images, description, specifications
- [ ] Image gallery with zoom and swipe functionality
- [ ] Product variants (size, color, material)
- [ ] Stock availability indicator
- [ ] Price display with discount/sale price
- [ ] Related/similar products section
- [ ] Recently viewed products

#### Advanced Features
- [ ] 360° product view
- [ ] AR product preview (try before buy)
- [ ] Product comparison (compare up to 4 products)
- [ ] Size guide/chart
- [ ] Product videos
- [ ] Dynamic pricing based on quantity
- [ ] Bundle products/combos
- [ ] Pre-order products
- [ ] Back-in-stock notifications
- [ ] Product Q&A section
- [ ] Share product via social/messaging apps

---

### 1.4 Search & Filters

#### Core Features
- [ ] Text search with autocomplete suggestions
- [ ] Search history (recent searches)
- [ ] Filter by category
- [ ] Filter by price range (slider)
- [ ] Filter by brand
- [ ] Filter by rating
- [ ] Filter by availability
- [ ] Sort options (price, popularity, newest, rating)
- [ ] Clear all filters option

#### Advanced Features
- [ ] Voice search
- [ ] Image search (visual search)
- [ ] Barcode/QR code scanner search
- [ ] Trending searches
- [ ] Search within category
- [ ] Multi-select filters
- [ ] Filter by attributes (size, color, material)
- [ ] Save search filters as preset
- [ ] Search analytics (popular searches)
- [ ] Fuzzy search / typo tolerance
- [ ] Search synonyms handling

---

### 1.5 Shopping Cart

#### Core Features
- [ ] Add/remove products to cart
- [ ] Update quantity
- [ ] Cart item count badge on icon
- [ ] Cart summary (subtotal, taxes, shipping estimate)
- [ ] Apply coupon/promo code
- [ ] Save for later functionality
- [ ] Move to wishlist from cart
- [ ] Clear entire cart
- [ ] Cart persistence across sessions

#### Advanced Features
- [ ] Guest cart (sync on login)
- [ ] Cart abandonment recovery
- [ ] Stock validation before checkout
- [ ] Price change alerts (if price changed since adding)
- [ ] Estimated delivery date per item
- [ ] Gift wrap option per item
- [ ] Multiple carts (regular, subscription)
- [ ] Share cart with others
- [ ] Cart expiry for limited stock items
- [ ] Minimum order value enforcement

---

### 1.6 Wishlist

#### Core Features
- [ ] Add/remove products from wishlist
- [ ] View wishlist with product details
- [ ] Move to cart from wishlist
- [ ] Wishlist item count
- [ ] Price drop alerts
- [ ] Back in stock alerts

#### Advanced Features
- [ ] Multiple wishlists (create, rename, delete)
- [ ] Share wishlist publicly or via link
- [ ] Wishlist privacy settings
- [ ] Wishlist collaboration (gift registry)
- [ ] Priority/notes on wishlist items
- [ ] Wishlist analytics

---

### 1.7 Checkout Process

#### Core Features
- [ ] Address selection/addition
- [ ] Shipping method selection
- [ ] Payment method selection
- [ ] Order summary review
- [ ] Terms and conditions acceptance
- [ ] Place order confirmation
- [ ] Order success page with details

#### Advanced Features
- [ ] Express checkout (one-click buy)
- [ ] Guest checkout
- [ ] Split shipment options
- [ ] Gift message/card
- [ ] Schedule delivery date/time
- [ ] Delivery instructions
- [ ] GST/Tax invoice option
- [ ] Bulk/wholesale checkout flow
- [ ] Checkout progress indicator
- [ ] Address validation at checkout
- [ ] Real-time shipping rate calculation
- [ ] Order limit per user (for flash sales)

#### Checkout Flow States
- Cart → Address → Shipping → Payment → Review → Processing → Success/Failed

---

### 1.8 Payment Integration

#### Core Features
- [ ] Credit/Debit card payment
- [ ] UPI payment (Razorpay/PhonePe/GPay)
- [ ] Net banking
- [ ] Wallet payment (Paytm, etc.)
- [ ] Cash on Delivery (COD)
- [ ] Payment status handling (success/failure/pending)
- [ ] Retry failed payments

#### Advanced Features
- [ ] EMI options (card-based EMI)
- [ ] Buy Now Pay Later (BNPL)
- [ ] Wallet balance (in-app wallet)
- [ ] Store credits
- [ ] Split payment (multiple methods)
- [ ] International payments (Stripe)
- [ ] Saved cards management
- [ ] Auto-debit for subscriptions
- [ ] Payment receipts/invoices
- [ ] Refund to original payment method

---

### 1.9 Order Management

#### Core Features
- [ ] Order history list
- [ ] Order detail view
- [ ] Order status tracking
- [ ] Order timeline/progress
- [ ] Download invoice
- [ ] Reorder (add same items to cart)
- [ ] Cancel order (if eligible)
- [ ] Return/refund request

#### Advanced Features
- [ ] Real-time order tracking (map view)
- [ ] Delivery partner details
- [ ] Live tracking with ETA
- [ ] Order modification (before shipping)
- [ ] Partial cancellation
- [ ] Delivery feedback/rating
- [ ] Order notifications (push/SMS/email)
- [ ] Order support chat
- [ ] Subscription orders
- [ ] Order history search/filter

---

### 1.10 Reviews & Ratings

#### Core Features
- [ ] View product reviews
- [ ] Submit review (rating + text)
- [ ] Upload review images/videos
- [ ] Edit/delete own reviews
- [ ] Review helpfulness voting
- [ ] Filter reviews by rating
- [ ] Sort reviews (newest, helpful, rating)

#### Advanced Features
- [ ] Verified purchase badge
- [ ] Review prompts after delivery
- [ ] Review incentives (coins/coupons)
- [ ] Review moderation status
- [ ] Seller response to reviews
- [ ] Review questions (structured feedback)
- [ ] Review summary/highlights (AI-generated)
- [ ] Review search

---

### 1.11 Notifications

#### Core Features
- [ ] Push notifications
- [ ] In-app notification center
- [ ] Notification history
- [ ] Mark as read/unread
- [ ] Delete notifications
- [ ] Notification preferences (by type)

#### Advanced Features
- [ ] Rich notifications (images, actions)
- [ ] Deep linking from notifications
- [ ] Scheduled notifications
- [ ] Location-based notifications
- [ ] Notification grouping/channels
- [ ] Silent notifications for data sync
- [ ] Email notifications
- [ ] SMS notifications
- [ ] WhatsApp notifications

#### Notification Types
- Order Update, Order Delivered
- Payment Confirmed, Payment Failed
- Price Drop Alert, Back In Stock Alert
- Promotional Offer, Flash Sale
- Abandoned Cart, Review Reminder
- New Arrival, Wishlist Update
- Referral Reward, Wallet Credit
- System Announcement

---

### 1.12 Offers & Promotions

#### Core Features
- [ ] Homepage banners/carousels
- [ ] Deal of the day section
- [ ] Category-wise offers
- [ ] Coupon code application
- [ ] View available coupons
- [ ] Discount badge on products

#### Advanced Features
- [ ] Flash sales with countdown timer
- [ ] Limited stock offers
- [ ] First order discount
- [ ] Referral rewards
- [ ] Loyalty points program
- [ ] Spin the wheel / Gamification
- [ ] Scratch cards
- [ ] Combo offers / BOGO
- [ ] Personalized offers
- [ ] Geo-targeted offers

---

### 1.13 Customer Support

#### Core Features
- [ ] FAQ section
- [ ] Help center articles
- [ ] Contact us form
- [ ] Email support
- [ ] Phone support

#### Advanced Features
- [ ] Live chat support
- [ ] Chatbot (AI-powered)
- [ ] Ticket system
- [ ] Order-specific support
- [ ] Video call support
- [ ] Screen sharing
- [ ] WhatsApp support
- [ ] Community forum
- [ ] Knowledge base search
- [ ] Support rating/feedback

---

### 1.14 Loyalty & Rewards

#### Core Features
- [ ] Points balance display
- [ ] Earn points on purchase
- [ ] Redeem points at checkout
- [ ] Points history
- [ ] Points expiry notification

#### Advanced Features
- [ ] Tiered membership (Bronze, Silver, Gold, Platinum)
- [ ] Tier benefits display
- [ ] Points multiplier events
- [ ] Referral program
- [ ] Review rewards
- [ ] Birthday rewards
- [ ] Anniversary rewards
- [ ] Exclusive member sales
- [ ] Points transfer
- [ ] Partner rewards integration

---

## 2. Admin Panel Features

### 2.1 Dashboard

#### Core Features
- [ ] Sales overview (today, week, month, year)
- [ ] Revenue charts and graphs
- [ ] Order statistics
- [ ] Active users count
- [ ] Low stock alerts
- [ ] Recent orders list
- [ ] Top selling products
- [ ] Quick action buttons

#### Advanced Features
- [ ] Real-time sales ticker
- [ ] Customizable dashboard widgets
- [ ] Export reports (PDF, Excel)
- [ ] Comparison with previous period
- [ ] Revenue by category
- [ ] Revenue by payment method
- [ ] Geographic sales map
- [ ] Conversion funnel analytics
- [ ] Customer acquisition metrics
- [ ] Cohort analysis
- [ ] Predictive analytics

#### Dashboard Metrics Required
- Sales Metrics: Today/Week/Month/Year Sales, Average Order Value, Total Orders by status
- User Metrics: Total Users, New Users Today, Active Users, Guest Users
- Product Metrics: Total Products, Active Products, Out of Stock, Low Stock
- Other Metrics: Conversion Rate, Cart Abandonment Rate, Return Rate, Pending Reviews, Open Tickets

---

### 2.2 Product Management

#### Core Features
- [ ] Add new product
- [ ] Edit product details
- [ ] Delete/archive product
- [ ] Bulk product upload (CSV/Excel)
- [ ] Product image management
- [ ] Set product variants
- [ ] Manage product categories
- [ ] Set pricing (base, sale, cost)
- [ ] Inventory management
- [ ] Product status toggle

#### Advanced Features
- [ ] Product duplication
- [ ] Bulk edit products
- [ ] Import/export products
- [ ] Product scheduling (publish date)
- [ ] SEO settings per product
- [ ] Product bundling
- [ ] Cross-sell / upsell configuration
- [ ] Product templates
- [ ] Barcode generation
- [ ] Multi-warehouse inventory
- [ ] Product approval workflow
- [ ] Version history

---

### 2.3 Category Management

#### Core Features
- [ ] Create/edit/delete categories
- [ ] Multi-level category hierarchy
- [ ] Category image upload
- [ ] Category ordering
- [ ] Enable/disable categories
- [ ] Assign products to categories

#### Advanced Features
- [ ] Category banners
- [ ] Category-specific filters
- [ ] Category SEO settings
- [ ] Category commission rates (for marketplace)
- [ ] Category-wise tax rules
- [ ] Bulk category operations

---

### 2.4 Order Management

#### Core Features
- [ ] View all orders with filters
- [ ] Order detail view
- [ ] Update order status
- [ ] Print order invoice/packing slip
- [ ] Search orders
- [ ] Filter by status, date, payment method

#### Advanced Features
- [ ] Bulk status update
- [ ] Order assignment to staff
- [ ] Order notes (internal)
- [ ] Split order
- [ ] Merge orders
- [ ] Fraud detection flags
- [ ] Order editing (before processing)
- [ ] Automatic order assignment
- [ ] Order priority management
- [ ] SLA tracking
- [ ] Export orders

---

### 2.5 Customer Management

#### Core Features
- [ ] View all customers
- [ ] Customer detail view
- [ ] Search customers
- [ ] Customer order history
- [ ] Disable/enable customer account
- [ ] Reset customer password

#### Advanced Features
- [ ] Customer segmentation
- [ ] Customer groups/tags
- [ ] Customer lifetime value
- [ ] Customer communication history
- [ ] Send targeted notifications
- [ ] Import/export customers
- [ ] Customer notes
- [ ] Merge duplicate customers
- [ ] Customer login as (impersonation for support)
- [ ] Customer activity log

---

### 2.6 Inventory Management

#### Core Features
- [ ] Stock level overview
- [ ] Update stock quantities
- [ ] Low stock alerts configuration
- [ ] Stock movement history
- [ ] Out of stock management

#### Advanced Features
- [ ] Multi-warehouse support
- [ ] Stock transfer between warehouses
- [ ] Stock adjustment with reasons
- [ ] Stock forecasting
- [ ] Automatic reorder points
- [ ] Supplier management
- [ ] Purchase order creation
- [ ] Batch/lot tracking
- [ ] Serial number tracking
- [ ] Inventory valuation reports
- [ ] Stock audit

---

### 2.7 Coupon & Promotion Management

#### Core Features
- [ ] Create/edit/delete coupons
- [ ] Set discount type and value
- [ ] Set validity period
- [ ] Usage limits
- [ ] Minimum order requirement
- [ ] Product/category restrictions

#### Advanced Features
- [ ] Auto-generate coupon codes
- [ ] Bulk coupon creation
- [ ] Coupon analytics
- [ ] Flash sale management
- [ ] Banner management
- [ ] Promotional email integration
- [ ] Referral program management
- [ ] Loyalty program configuration
- [ ] A/B testing promotions

---

### 2.8 Payment Management

#### Core Features
- [ ] View all transactions
- [ ] Transaction details
- [ ] Payment status overview
- [ ] Refund processing
- [ ] Payment gateway configuration

#### Advanced Features
- [ ] Payout management (for marketplace)
- [ ] Commission tracking
- [ ] Payment reconciliation
- [ ] Chargeback management
- [ ] Payment method analytics
- [ ] Automatic refund rules
- [ ] Installment tracking

---

### 2.9 Shipping Management

#### Core Features
- [ ] Shipping zone configuration
- [ ] Flat rate shipping setup
- [ ] Free shipping rules
- [ ] Shipping carrier integration
- [ ] Generate shipping labels

#### Advanced Features
- [ ] Weight-based shipping rates
- [ ] Dimension-based shipping
- [ ] Real-time carrier rates
- [ ] Multi-carrier comparison
- [ ] Shipping rules engine
- [ ] Delivery slot management
- [ ] Pickup points configuration
- [ ] International shipping rules
- [ ] Shipping analytics

---

### 2.10 Review Management

#### Core Features
- [ ] View all reviews
- [ ] Approve/reject reviews
- [ ] Respond to reviews
- [ ] Filter by rating/status

#### Advanced Features
- [ ] Bulk moderation
- [ ] Auto-moderation rules
- [ ] Review analytics
- [ ] Sentiment analysis
- [ ] Fake review detection
- [ ] Review import

---

### 2.11 Content Management

#### Core Features
- [ ] Homepage banner management
- [ ] Static pages (About, Contact, etc.)
- [ ] FAQ management
- [ ] App configuration (logo, colors)
- [ ] Footer links

#### Advanced Features
- [ ] Page builder (drag-drop)
- [ ] Blog management
- [ ] Email template customization
- [ ] Push notification templates
- [ ] Localization management
- [ ] A/B testing content
- [ ] Scheduled content publishing

---

### 2.12 Reports & Analytics

#### Core Features
- [ ] Sales reports
- [ ] Product reports (best sellers, low performing)
- [ ] Customer reports
- [ ] Order reports
- [ ] Inventory reports

#### Advanced Features
- [ ] Custom report builder
- [ ] Scheduled report emails
- [ ] Real-time analytics dashboard
- [ ] Funnel analysis
- [ ] Cohort retention analysis
- [ ] Attribution reports
- [ ] Customer behavior analysis
- [ ] Search analytics
- [ ] Export to multiple formats
- [ ] Comparison reports

---

### 2.13 Settings & Configuration

#### Core Features
- [ ] Store information
- [ ] Currency settings
- [ ] Tax configuration
- [ ] Email settings (SMTP)
- [ ] Payment gateway settings
- [ ] Notification settings

#### Advanced Features
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Tax automation rules
- [ ] Invoice customization
- [ ] API key management
- [ ] Webhook configuration
- [ ] Backup management
- [ ] Maintenance mode
- [ ] Rate limiting configuration
- [ ] Security settings

---

### 2.14 Staff Management

#### Core Features
- [ ] Add/edit/remove staff
- [ ] Role-based access control
- [ ] Staff activity log
- [ ] Password management

#### Advanced Features
- [ ] Custom role creation
- [ ] Granular permissions
- [ ] Staff performance metrics
- [ ] Two-factor authentication
- [ ] IP whitelisting
- [ ] Session management
- [ ] Audit trail

#### Permission Categories Required
- Dashboard: View Dashboard
- Products: View, Create, Edit, Delete Products
- Orders: View, Edit, Cancel Orders, Process Refunds
- Customers: View, Edit, Delete Customers
- Inventory: View, Manage Inventory
- Marketing: View/Manage Coupons, Manage Promotions
- Reports: View Reports, Export Reports
- Settings: View Settings, Manage Settings, Manage Staff, Manage Roles

---

## 3. Data Model Requirements

### 3.1 User Data Models

#### User
- User ID, Email, Phone Number, Display Name, Photo URL
- Created At, Last Login At timestamps
- Email Verified status, Phone Verified status
- FCM Token for push notifications
- List of linked authentication providers
- User Role (customer, vendor, admin)
- Account Status (active, suspended, pending verification, deleted)
- Additional metadata as needed

#### Address
- Address ID, User ID, Full Name, Phone Number
- Address Line 1, Address Line 2, City, State, Postal Code, Country
- Latitude/Longitude coordinates
- Address Type (home, office, other)
- Is Default flag, Landmark
- Created At, Updated At timestamps

#### User Preferences
- User ID, Language, Currency
- Push/Email/SMS notification preferences
- Theme Mode preference
- Biometric enabled status

---

### 3.2 Product Data Models

#### Product
- Product ID, Name, Description, Short Description, SKU
- Category ID, Sub-Category ID, Brand ID
- Tags list
- Base Price, Sale Price, Cost Price
- Stock Quantity, Low Stock Threshold
- Track Inventory flag, Allow Backorder flag
- Product Status (active, draft, archived)
- Product Type (simple, variable, bundle)
- List of Variants, List of Images, List of Specifications
- Weight, Dimensions (length, width, height)
- Video URL, Is Featured flag, Is New Arrival flag
- Average Rating, Total Reviews, Total Sold count
- Created At, Updated At timestamps
- SEO Metadata

#### Product Variant
- Variant ID, Product ID, SKU, Name
- Attributes map (color, size, etc.)
- Price, Sale Price, Stock Quantity
- Images list, Is Default flag

#### Category
- Category ID, Name, Description, Image URL
- Parent ID (for subcategories), Level (0 for root)
- Sort Order, Is Active flag, Product Count
- List of subcategories

#### Brand
- Brand ID, Name, Logo URL, Description
- Is Active flag, Product Count

---

### 3.3 Cart & Wishlist Data Models

#### Cart
- Cart ID, User ID (null for guest), Guest ID
- List of Cart Items
- Applied Coupon Code
- Subtotal, Discount, Tax Amount, Shipping Estimate, Total
- Created At, Updated At, Expires At timestamps

#### Cart Item
- Item ID, Product ID, Variant ID
- Product Name, Variant Name, Image URL
- Unit Price, Original Price
- Quantity, Max Quantity (stock limit)
- Total Price, Is Available flag
- Is Saved For Later flag
- Customizations map
- Added At timestamp

#### Wishlist
- Wishlist ID, User ID, Name
- List of Wishlist Items
- Is Public flag, Shareable Link
- Created At, Updated At timestamps

#### Wishlist Item
- Item ID, Product ID, Variant ID
- Price When Added, Current Price
- Note, Priority
- Notify On Price Drop flag
- Notify On Back In Stock flag
- Added At timestamp

---

### 3.4 Order Data Models

#### Order
- Order ID, Order Number, User ID
- Order Status (pending, confirmed, processing, packed, shipped, out for delivery, delivered, cancelled, returned, refunded)
- List of Order Items
- Shipping Address, Billing Address
- Shipping Method, Payment details
- Subtotal, Shipping Cost, Tax Amount, Discount, Coupon Code, Total
- Gift Message, Order Notes
- Created At, Confirmed At, Shipped At, Delivered At, Cancelled At timestamps
- Cancellation Reason
- Order Timeline events
- Tracking Info
- Is Returnable flag, Return Deadline

#### Order Item
- Item ID, Product ID, Variant ID
- Product Name, Variant Name, Image URL
- Unit Price, Quantity, Total Price
- Item Status
- Is Reviewed flag
- Return Request (if any)

#### Tracking Info
- Tracking Number, Carrier, Tracking URL
- List of Tracking Events
- Current Location, Estimated Delivery datetime

---

### 3.5 Payment Data Models

#### Payment
- Payment ID, Order ID, User ID
- Amount, Currency
- Payment Method (card, UPI, net banking, wallet, COD, EMI, BNPL, store credit)
- Payment Status (pending, processing, success, failed, cancelled, refunded, partially refunded)
- Transaction ID, Gateway Order ID, Gateway Payment ID, Gateway Signature
- Gateway Response data
- Failure Reason
- Created At, Completed At timestamps
- Retry Count

---

### 3.6 Review Data Models

#### Review
- Review ID, Product ID, User ID, User Name, User Avatar
- Order ID (for verification)
- Is Verified Purchase flag
- Rating (1-5), Title, Content
- Images list, Video URL
- Helpful Count, Not Helpful Count
- Review Status (pending, approved, rejected)
- Moderation Note
- Seller Reply (if any)
- Attribute Ratings map (quality, value, etc.)
- Created At, Updated At timestamps

---

### 3.7 Notification Data Models

#### Notification
- Notification ID, User ID
- Notification Type
- Title, Body, Image URL
- Data payload, Deep Link URL
- Is Read flag
- Created At, Read At timestamps

---

### 3.8 Promotion Data Models

#### Coupon
- Coupon ID, Code, Title, Description
- Discount Type (percentage, fixed amount, free shipping, buy X get Y)
- Discount Value, Max Discount, Min Order Value
- Usage Limit, Used Count, Per User Limit
- Applicable Categories list, Applicable Products list
- Excluded Products list, Applicable User IDs list
- Start Date, End Date
- Is Active flag, Is First Order Only flag
- Terms and Conditions

#### Flash Sale
- Flash Sale ID, Title, Banner Image
- Start Time, End Time
- List of Flash Sale Items
- Is Active flag

#### Flash Sale Item
- Product ID, Sale Price
- Stock Limit, Sold Count

#### Banner
- Banner ID, Title, Image URL
- Link Type (product, category, URL, none)
- Link Value
- Sort Order, Is Active flag
- Start Date, End Date

---

### 3.9 Support Data Models

#### Support Ticket
- Ticket ID, Ticket Number, User ID
- Order ID (if applicable)
- Subject
- Ticket Category (order issue, payment issue, product query, return/refund, account issue, technical issue, feedback, other)
- Ticket Priority (low, medium, high, urgent)
- Ticket Status (open, in progress, waiting on customer, resolved, closed)
- List of Messages
- Assigned Agent ID
- Created At, Updated At, Resolved At timestamps
- Satisfaction Rating, Feedback

#### Ticket Message
- Message ID, Sender ID, Sender Type (user, agent, system)
- Content, Attachments list
- Created At timestamp

---

### 3.10 Loyalty Data Models

#### Loyalty Account
- Account ID, User ID
- Current Points, Lifetime Points
- Loyalty Tier (bronze, silver, gold, platinum)
- Points To Next Tier
- Tier Expiry Date
- List of Points Transactions
- Referral Code, Referral Count

#### Points Transaction
- Transaction ID
- Transaction Type (earned, redeemed, expired, bonus, referral)
- Points amount
- Description, Order ID (if applicable)
- Created At, Expires At timestamps

---

### 3.11 Search Data Models

#### Search Filters
- Query string
- Category IDs list, Brand IDs list
- Min Price, Max Price, Min Rating
- In Stock flag
- Sizes list, Colors list
- Custom Attributes map
- Sort Option (relevance, price low-high, price high-low, newest, popularity, rating, discount)
- Page number, Limit per page

---

### 3.12 Admin Data Models

#### Staff
- Staff ID, Name, Email, Phone
- Role ID, Permissions list
- Is Active flag
- Last Login At, Created At timestamps

#### Role
- Role ID, Name, Description
- Permissions map (module: list of permissions)
- Is System Role flag (cannot be deleted)

#### Activity Log
- Log ID, Staff ID, Action Type
- Module, Entity ID, Entity Type
- Old Value, New Value
- IP Address, User Agent
- Created At timestamp

---

## 4. Screen List

### 4.1 User App Screens (43 Screens)

| # | Screen Name | Description |
|---|-------------|-------------|
| 1 | Splash Screen | App loading screen with logo |
| 2 | Onboarding Screens | 3-4 slides introducing app features |
| 3 | Login Screen | Email/phone login with social options |
| 4 | Register Screen | New user registration form |
| 5 | OTP Verification Screen | Phone number verification |
| 6 | Forgot Password Screen | Password reset flow |
| 7 | Home Screen | Main screen with bottom navigation |
| 8 | Category Listing Screen | All categories display |
| 9 | Product Listing Screen | Products grid/list view |
| 10 | Product Detail Screen | Full product information |
| 11 | Search Screen | Search input with suggestions |
| 12 | Search Results Screen | Search results with filters |
| 13 | Filter/Sort Bottom Sheet | Filter and sort options |
| 14 | Cart Screen | Shopping cart view |
| 15 | Wishlist Screen | Saved products list |
| 16 | Checkout - Address Selection | Choose shipping address |
| 17 | Checkout - Add/Edit Address | Address form |
| 18 | Checkout - Shipping Method | Shipping options |
| 19 | Checkout - Payment Selection | Payment method choice |
| 20 | Checkout - Order Review | Final review before payment |
| 21 | Payment Processing Screen | Payment in progress |
| 22 | Order Success Screen | Order confirmation |
| 23 | Order Failed Screen | Payment failure handling |
| 24 | Orders List Screen | Order history |
| 25 | Order Detail Screen | Single order details |
| 26 | Order Tracking Screen | Live order tracking |
| 27 | Profile Screen | User profile overview |
| 28 | Edit Profile Screen | Profile editing form |
| 29 | Address Management Screen | Manage saved addresses |
| 30 | Change Password Screen | Password update |
| 31 | Notifications Screen | Notification center |
| 32 | Settings Screen | App settings |
| 33 | Help & Support Screen | Support options |
| 34 | FAQ Screen | Frequently asked questions |
| 35 | Contact Us Screen | Contact form |
| 36 | Chat Support Screen | Live chat interface |
| 37 | Write Review Screen | Review submission form |
| 38 | Coupons Screen | Available coupons list |
| 39 | Loyalty/Rewards Screen | Points and rewards |
| 40 | Referral Screen | Referral program |
| 41 | About Us Screen | Company information |
| 42 | Terms & Conditions Screen | Legal terms |
| 43 | Privacy Policy Screen | Privacy information |

### 4.2 Admin Panel Screens (23 Screens)

| # | Screen Name | Description |
|---|-------------|-------------|
| 1 | Login Screen | Admin authentication |
| 2 | Dashboard | Overview and analytics |
| 3 | Products List | All products table |
| 4 | Add/Edit Product | Product form |
| 5 | Categories List | Category management |
| 6 | Add/Edit Category | Category form |
| 7 | Orders List | All orders table |
| 8 | Order Detail | Single order management |
| 9 | Customers List | All customers table |
| 10 | Customer Detail | Customer profile and history |
| 11 | Inventory Management | Stock management |
| 12 | Coupons List | All coupons table |
| 13 | Add/Edit Coupon | Coupon form |
| 14 | Flash Sales | Flash sale management |
| 15 | Banner Management | Homepage banners |
| 16 | Reviews Management | Review moderation |
| 17 | Support Tickets | Customer tickets |
| 18 | Reports Dashboard | Analytics overview |
| 19 | Sales Reports | Detailed sales data |
| 20 | Settings | App configuration |
| 21 | Staff Management | Staff accounts |
| 22 | Role Management | Roles and permissions |
| 23 | Activity Logs | Audit trail |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial requirements document |

---

*This document contains all functional requirements for the e-commerce application. For technical specifications, refer to the Technical Requirements document.*
