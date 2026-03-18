# Firebase Backend - Complete Schema & Structure Documentation

## Overview

**Project:** E-Commerce Flutter Application
**Backend Services:** Firebase
**Database:** Cloud Firestore
**Storage:** Firebase Storage
**Authentication:** Firebase Authentication
**Functions:** Cloud Functions for Firebase
**Analytics:** Firebase Analytics
**Crash Reporting:** Firebase Crashlytics

---

## Table of Contents

1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Authentication Configuration](#2-authentication-configuration)
3. [Firestore Database Schema](#3-firestore-database-schema)
4. [Collection References](#4-collection-references)
5. [Document Relationships](#5-document-relationships)
6. [Firebase Storage Structure](#6-firebase-storage-structure)
7. [Cloud Functions](#7-cloud-functions)
8. [Security Rules](#8-security-rules)
9. [Indexes](#9-indexes)
10. [Data Models](#10-data-models)

---

## 1. Firebase Project Setup

### 1.1 Required Firebase Services

| Service | Purpose | Required |
|---------|---------|----------|
| Authentication | User authentication | Yes |
| Cloud Firestore | Database | Yes |
| Firebase Storage | File storage | Yes |
| Cloud Functions | Backend logic | Yes |
| Cloud Messaging | Push notifications | Yes |
| Analytics | User analytics | Yes |
| Crashlytics | Crash reporting | Yes |
| Remote Config | Feature flags | Optional |
| App Check | Security | Recommended |

### 1.2 Project Configuration

| Environment | Project Name | Purpose |
|-------------|--------------|---------|
| Development | ecommerce-dev | Development testing |
| Staging | ecommerce-staging | Pre-production testing |
| Production | ecommerce-prod | Live application |

### 1.3 Firebase Console Setup Steps

1. Create Firebase project in Firebase Console
2. Enable required authentication providers
3. Create Firestore database (production mode)
4. Enable Firebase Storage
5. Enable Cloud Functions (requires Blaze plan)
6. Enable Cloud Messaging
7. Enable Analytics
8. Enable Crashlytics
9. Download configuration files (google-services.json, GoogleService-Info.plist)

---

## 2. Authentication Configuration

### 2.1 Authentication Providers

| Provider | Status | Configuration |
|----------|--------|---------------|
| Email/Password | Required | Enable in Firebase Console |
| Phone | Required | Enable, set SMS quota |
| Google | Required | Configure OAuth 2.0 credentials |
| Apple | Required (iOS) | Configure in Apple Developer account |
| Facebook | Optional | Configure Facebook App |

### 2.2 Authentication Settings

| Setting | Value |
|---------|-------|
| Email enumeration protection | Enabled |
| Password policy | Min 8 chars |
| Multi-factor authentication | Optional |
| Session duration | 30 days |
| Email verification | Required |

---

## 3. Firestore Database Schema

### 3.1 Collections Overview

```
firestore-root/
│
├── users/                      # User profiles
├── products/                   # Product catalog
├── categories/                 # Product categories
├── brands/                     # Brand information
├── carts/                      # Shopping carts
├── wishlists/                  # User wishlists
├── orders/                     # Order records
├── payments/                   # Payment transactions
├── reviews/                    # Product reviews
├── coupons/                    # Discount coupons
├── flash_sales/                # Flash sale campaigns
├── banners/                    # Homepage banners
├── notifications/              # User notifications
├── support_tickets/            # Customer support
├── loyalty_accounts/           # Loyalty program
├── app_config/                 # App configuration
├── staff/                      # Admin staff
├── roles/                      # Staff roles
├── activity_logs/              # Audit trail
└── analytics/                  # Analytics data
```

---

### 3.2 Users Collection

**Path:** `/users/{userId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | User ID (same as document ID) |
| email | string | Yes | User email address |
| phoneNumber | string | No | Phone with country code |
| displayName | string | Yes | User's full name |
| photoUrl | string | No | Profile picture URL |
| isEmailVerified | boolean | Yes | Email verification status |
| isPhoneVerified | boolean | Yes | Phone verification status |
| role | string | Yes | user, vendor, admin |
| status | string | Yes | active, suspended, deleted |
| fcmTokens | array | No | Push notification tokens |
| linkedProviders | array | Yes | Auth providers linked |
| defaultAddressId | string | No | Default shipping address |
| defaultPaymentMethod | string | No | Preferred payment method |
| createdAt | timestamp | Yes | Account creation time |
| updatedAt | timestamp | Yes | Last update time |
| lastLoginAt | timestamp | No | Last login timestamp |
| metadata | map | No | Additional user data |

**Subcollections:**

#### /users/{userId}/addresses/{addressId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Address ID |
| fullName | string | Yes | Recipient name |
| phoneNumber | string | Yes | Contact phone |
| addressLine1 | string | Yes | Street address |
| addressLine2 | string | No | Apt, suite, etc. |
| city | string | Yes | City name |
| state | string | Yes | State/province |
| postalCode | string | Yes | ZIP/postal code |
| country | string | Yes | Country code |
| latitude | number | No | Geo latitude |
| longitude | number | No | Geo longitude |
| type | string | Yes | home, office, other |
| isDefault | boolean | Yes | Default address flag |
| landmark | string | No | Nearby landmark |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

#### /users/{userId}/preferences/{prefId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| language | string | Yes | Preferred language (en, hi) |
| currency | string | Yes | Preferred currency (INR, USD) |
| pushNotifications | boolean | Yes | Push notification setting |
| emailNotifications | boolean | Yes | Email notification setting |
| smsNotifications | boolean | Yes | SMS notification setting |
| themeMode | string | Yes | light, dark, system |
| biometricEnabled | boolean | Yes | Biometric login enabled |
| updatedAt | timestamp | Yes | Last update |

#### /users/{userId}/devices/{deviceId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| deviceId | string | Yes | Unique device ID |
| deviceName | string | Yes | Device model name |
| platform | string | Yes | ios, android, web |
| osVersion | string | No | Operating system version |
| appVersion | string | No | App version |
| fcmToken | string | No | Push token for device |
| lastActiveAt | timestamp | Yes | Last activity time |
| createdAt | timestamp | Yes | First login on device |

---

### 3.3 Products Collection

**Path:** `/products/{productId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Product ID |
| name | string | Yes | Product name |
| description | string | Yes | Full description |
| shortDescription | string | No | Brief description |
| sku | string | Yes | Stock keeping unit |
| categoryId | string | Yes | Primary category |
| subCategoryId | string | No | Sub-category |
| brandId | string | No | Brand reference |
| tags | array | No | Search tags |
| basePrice | number | Yes | Regular price |
| salePrice | number | No | Discounted price |
| costPrice | number | No | Cost for margin calc |
| currency | string | Yes | Price currency |
| stockQuantity | number | Yes | Available stock |
| lowStockThreshold | number | Yes | Low stock alert level |
| trackInventory | boolean | Yes | Track stock flag |
| allowBackorder | boolean | Yes | Allow backorders |
| status | string | Yes | active, draft, archived |
| type | string | Yes | simple, variable, bundle |
| weight | number | No | Product weight (kg) |
| dimensions | map | No | length, width, height (cm) |
| images | array | Yes | Image objects array |
| videoUrl | string | No | Product video URL |
| specifications | array | No | Spec key-value pairs |
| isFeatured | boolean | Yes | Featured product flag |
| isNewArrival | boolean | Yes | New arrival flag |
| averageRating | number | Yes | Average review rating |
| totalReviews | number | Yes | Total review count |
| totalSold | number | Yes | Total units sold |
| searchKeywords | array | No | Search optimization |
| seoMetadata | map | No | SEO title, description |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |
| publishedAt | timestamp | No | Publish date |

**Subcollections:**

#### /products/{productId}/variants/{variantId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Variant ID |
| sku | string | Yes | Variant SKU |
| name | string | Yes | Variant name (Red - Large) |
| attributes | map | Yes | {color: red, size: L} |
| price | number | Yes | Variant price |
| salePrice | number | No | Variant sale price |
| stockQuantity | number | Yes | Variant stock |
| images | array | No | Variant-specific images |
| isDefault | boolean | Yes | Default variant flag |
| isActive | boolean | Yes | Variant active status |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

#### /products/{productId}/reviews/{reviewId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Review ID |
| userId | string | Yes | Reviewer user ID |
| userName | string | Yes | Reviewer name |
| userAvatar | string | No | Reviewer avatar |
| orderId | string | No | Order reference |
| isVerifiedPurchase | boolean | Yes | Verified buyer flag |
| rating | number | Yes | Rating 1-5 |
| title | string | No | Review title |
| content | string | Yes | Review text |
| images | array | No | Review images |
| videoUrl | string | No | Review video |
| helpfulCount | number | Yes | Helpful votes |
| notHelpfulCount | number | Yes | Not helpful votes |
| status | string | Yes | pending, approved, rejected |
| moderationNote | string | No | Admin note |
| sellerReply | map | No | Seller response |
| attributeRatings | map | No | {quality: 4, value: 5} |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.4 Categories Collection

**Path:** `/categories/{categoryId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Category ID |
| name | string | Yes | Category name |
| slug | string | Yes | URL-friendly name |
| description | string | No | Category description |
| imageUrl | string | No | Category image |
| bannerUrl | string | No | Category banner |
| iconUrl | string | No | Category icon |
| parentId | string | No | Parent category ID |
| level | number | Yes | Hierarchy level (0=root) |
| path | array | Yes | Ancestor IDs array |
| sortOrder | number | Yes | Display order |
| isActive | boolean | Yes | Active status |
| isFeatured | boolean | Yes | Featured on home |
| productCount | number | Yes | Products in category |
| filters | array | No | Available filters |
| seoMetadata | map | No | SEO title, description |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.5 Brands Collection

**Path:** `/brands/{brandId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Brand ID |
| name | string | Yes | Brand name |
| slug | string | Yes | URL-friendly name |
| description | string | No | Brand description |
| logoUrl | string | No | Brand logo |
| bannerUrl | string | No | Brand banner |
| websiteUrl | string | No | Official website |
| isActive | boolean | Yes | Active status |
| isFeatured | boolean | Yes | Featured brand |
| productCount | number | Yes | Products from brand |
| sortOrder | number | Yes | Display order |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.6 Carts Collection

**Path:** `/carts/{cartId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Cart ID |
| userId | string | No | User ID (null for guest) |
| guestId | string | No | Guest session ID |
| status | string | Yes | active, converted, abandoned |
| appliedCouponCode | string | No | Applied coupon |
| appliedCouponId | string | No | Coupon document ID |
| subtotal | number | Yes | Items total |
| discount | number | Yes | Discount amount |
| taxAmount | number | Yes | Tax amount |
| shippingEstimate | number | Yes | Estimated shipping |
| total | number | Yes | Grand total |
| itemCount | number | Yes | Total items |
| currency | string | Yes | Cart currency |
| notes | string | No | Cart notes |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |
| expiresAt | timestamp | No | Cart expiry (guest) |
| lastActivityAt | timestamp | Yes | Last activity |

**Subcollections:**

#### /carts/{cartId}/items/{itemId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Item ID |
| productId | string | Yes | Product reference |
| variantId | string | No | Variant reference |
| productName | string | Yes | Product name snapshot |
| variantName | string | No | Variant name snapshot |
| sku | string | Yes | SKU snapshot |
| imageUrl | string | Yes | Product image |
| unitPrice | number | Yes | Price per unit |
| originalPrice | number | No | Original price |
| quantity | number | Yes | Item quantity |
| maxQuantity | number | Yes | Stock limit |
| totalPrice | number | Yes | Line total |
| isAvailable | boolean | Yes | Stock availability |
| isSavedForLater | boolean | Yes | Save for later flag |
| customizations | map | No | Custom options |
| addedAt | timestamp | Yes | Added to cart time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.7 Wishlists Collection

**Path:** `/wishlists/{wishlistId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Wishlist ID |
| userId | string | Yes | Owner user ID |
| name | string | Yes | Wishlist name |
| description | string | No | Wishlist description |
| isDefault | boolean | Yes | Default wishlist |
| isPublic | boolean | Yes | Public visibility |
| shareableLink | string | No | Share URL |
| itemCount | number | Yes | Total items |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

**Subcollections:**

#### /wishlists/{wishlistId}/items/{itemId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Item ID |
| productId | string | Yes | Product reference |
| variantId | string | No | Variant reference |
| productName | string | Yes | Product name snapshot |
| imageUrl | string | Yes | Product image |
| priceWhenAdded | number | Yes | Price at addition |
| currentPrice | number | Yes | Current price |
| isAvailable | boolean | Yes | Stock availability |
| note | string | No | Personal note |
| priority | number | No | Priority ranking |
| notifyOnPriceDrop | boolean | Yes | Price alert flag |
| notifyOnBackInStock | boolean | Yes | Stock alert flag |
| addedAt | timestamp | Yes | Added time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.8 Orders Collection

**Path:** `/orders/{orderId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Order ID |
| orderNumber | string | Yes | Display order number |
| userId | string | Yes | Customer user ID |
| status | string | Yes | Order status |
| paymentStatus | string | Yes | Payment status |
| shippingAddress | map | Yes | Delivery address |
| billingAddress | map | No | Billing address |
| shippingMethod | map | Yes | Shipping details |
| paymentMethod | string | Yes | Payment method used |
| paymentId | string | No | Payment document ID |
| subtotal | number | Yes | Items subtotal |
| shippingCost | number | Yes | Shipping charge |
| taxAmount | number | Yes | Tax amount |
| discount | number | Yes | Discount amount |
| couponCode | string | No | Applied coupon |
| total | number | Yes | Grand total |
| currency | string | Yes | Order currency |
| itemCount | number | Yes | Total items |
| giftMessage | string | No | Gift message |
| orderNotes | string | No | Customer notes |
| internalNotes | string | No | Admin notes |
| isGift | boolean | Yes | Gift order flag |
| isReturnable | boolean | Yes | Return eligible |
| returnDeadline | timestamp | No | Return by date |
| tracking | map | No | Tracking information |
| estimatedDelivery | timestamp | No | Expected delivery |
| createdAt | timestamp | Yes | Order placed time |
| updatedAt | timestamp | Yes | Last update |
| confirmedAt | timestamp | No | Confirmation time |
| processedAt | timestamp | No | Processing start |
| shippedAt | timestamp | No | Shipped time |
| deliveredAt | timestamp | No | Delivery time |
| cancelledAt | timestamp | No | Cancellation time |
| cancellationReason | string | No | Cancel reason |
| cancelledBy | string | No | user, admin, system |

**Order Status Values:**
- pending
- confirmed
- processing
- packed
- shipped
- out_for_delivery
- delivered
- cancelled
- returned
- refunded

**Subcollections:**

#### /orders/{orderId}/items/{itemId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Item ID |
| productId | string | Yes | Product reference |
| variantId | string | No | Variant reference |
| productName | string | Yes | Product name |
| variantName | string | No | Variant name |
| sku | string | Yes | SKU |
| imageUrl | string | Yes | Product image |
| unitPrice | number | Yes | Price per unit |
| quantity | number | Yes | Quantity ordered |
| totalPrice | number | Yes | Line total |
| status | string | Yes | Item status |
| isReviewed | boolean | Yes | Review submitted |
| returnRequest | map | No | Return details |
| createdAt | timestamp | Yes | Creation time |

#### /orders/{orderId}/timeline/{eventId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Event ID |
| status | string | Yes | Status at event |
| title | string | Yes | Event title |
| description | string | No | Event details |
| location | string | No | Location info |
| performedBy | string | No | User/system ID |
| performedByType | string | Yes | user, admin, system |
| createdAt | timestamp | Yes | Event time |

---

### 3.9 Payments Collection

**Path:** `/payments/{paymentId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Payment ID |
| orderId | string | Yes | Order reference |
| userId | string | Yes | User reference |
| amount | number | Yes | Payment amount |
| currency | string | Yes | Currency code |
| method | string | Yes | Payment method |
| status | string | Yes | Payment status |
| gatewayProvider | string | Yes | razorpay, stripe |
| gatewayOrderId | string | No | Gateway order ID |
| gatewayPaymentId | string | No | Gateway payment ID |
| gatewaySignature | string | No | Verification signature |
| gatewayResponse | map | No | Full gateway response |
| transactionId | string | No | Transaction reference |
| failureReason | string | No | Failure description |
| failureCode | string | No | Error code |
| refundedAmount | number | No | Amount refunded |
| refundId | string | No | Refund reference |
| metadata | map | No | Additional data |
| ipAddress | string | No | Payer IP address |
| userAgent | string | No | Browser/device info |
| retryCount | number | Yes | Retry attempts |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |
| completedAt | timestamp | No | Completion time |
| refundedAt | timestamp | No | Refund time |

**Payment Status Values:**
- pending
- processing
- authorized
- captured
- success
- failed
- cancelled
- refunded
- partially_refunded

**Payment Method Values:**
- card
- upi
- net_banking
- wallet
- cod
- emi
- bnpl
- store_credit

---

### 3.10 Reviews Collection (Global)

**Path:** `/reviews/{reviewId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Review ID |
| productId | string | Yes | Product reference |
| userId | string | Yes | Reviewer ID |
| userName | string | Yes | Reviewer name |
| userAvatar | string | No | Reviewer avatar |
| orderId | string | No | Order reference |
| orderItemId | string | No | Order item reference |
| isVerifiedPurchase | boolean | Yes | Verified buyer |
| rating | number | Yes | Rating 1-5 |
| title | string | No | Review title |
| content | string | Yes | Review content |
| pros | array | No | Positive points |
| cons | array | No | Negative points |
| images | array | No | Review images |
| videoUrl | string | No | Review video |
| helpfulCount | number | Yes | Helpful votes |
| notHelpfulCount | number | Yes | Not helpful votes |
| reportCount | number | Yes | Report count |
| status | string | Yes | pending, approved, rejected |
| moderationNote | string | No | Moderator note |
| sellerReply | map | No | Seller response |
| attributeRatings | map | No | Category ratings |
| isEdited | boolean | Yes | Edited flag |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |
| approvedAt | timestamp | No | Approval time |

---

### 3.11 Coupons Collection

**Path:** `/coupons/{couponId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Coupon ID |
| code | string | Yes | Coupon code (unique) |
| title | string | Yes | Display title |
| description | string | No | Full description |
| discountType | string | Yes | percentage, fixed, free_shipping, bogo |
| discountValue | number | Yes | Discount amount |
| maxDiscount | number | No | Maximum discount cap |
| minOrderValue | number | Yes | Minimum order required |
| usageLimit | number | No | Total usage limit |
| usedCount | number | Yes | Times used |
| perUserLimit | number | No | Per user limit |
| applicableCategories | array | No | Category IDs |
| applicableProducts | array | No | Product IDs |
| excludedProducts | array | No | Excluded product IDs |
| applicableUserIds | array | No | Specific users |
| isFirstOrderOnly | boolean | Yes | First order only |
| isActive | boolean | Yes | Active status |
| startDate | timestamp | Yes | Valid from |
| endDate | timestamp | Yes | Valid until |
| termsAndConditions | string | No | T&C text |
| createdBy | string | Yes | Creator admin ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

**Discount Type Values:**
- percentage
- fixed_amount
- free_shipping
- buy_x_get_y

---

### 3.12 Flash Sales Collection

**Path:** `/flash_sales/{saleId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Sale ID |
| title | string | Yes | Sale title |
| description | string | No | Sale description |
| bannerUrl | string | No | Banner image |
| startTime | timestamp | Yes | Sale start |
| endTime | timestamp | Yes | Sale end |
| isActive | boolean | Yes | Active status |
| totalProducts | number | Yes | Product count |
| createdBy | string | Yes | Creator admin ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

**Subcollections:**

#### /flash_sales/{saleId}/items/{itemId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Item ID |
| productId | string | Yes | Product reference |
| variantId | string | No | Variant reference |
| originalPrice | number | Yes | Regular price |
| salePrice | number | Yes | Flash sale price |
| discountPercent | number | Yes | Discount percentage |
| stockLimit | number | Yes | Sale stock limit |
| soldCount | number | Yes | Units sold |
| sortOrder | number | Yes | Display order |
| isActive | boolean | Yes | Item active |
| createdAt | timestamp | Yes | Creation time |

---

### 3.13 Banners Collection

**Path:** `/banners/{bannerId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Banner ID |
| title | string | Yes | Banner title |
| subtitle | string | No | Banner subtitle |
| imageUrl | string | Yes | Banner image |
| mobileImageUrl | string | No | Mobile-specific image |
| linkType | string | Yes | product, category, brand, url, none |
| linkValue | string | No | Link destination |
| position | string | Yes | home_top, home_middle, category, etc. |
| sortOrder | number | Yes | Display order |
| isActive | boolean | Yes | Active status |
| startDate | timestamp | No | Display from |
| endDate | timestamp | No | Display until |
| viewCount | number | Yes | Impression count |
| clickCount | number | Yes | Click count |
| createdBy | string | Yes | Creator admin ID |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.14 Notifications Collection

**Path:** `/notifications/{userId}/items/{notificationId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Notification ID |
| type | string | Yes | Notification type |
| title | string | Yes | Notification title |
| body | string | Yes | Notification body |
| imageUrl | string | No | Notification image |
| data | map | No | Additional payload |
| deepLink | string | No | In-app deep link |
| isRead | boolean | Yes | Read status |
| isPushed | boolean | Yes | Push sent flag |
| priority | string | Yes | high, normal, low |
| createdAt | timestamp | Yes | Creation time |
| readAt | timestamp | No | Read time |
| expiresAt | timestamp | No | Expiry time |

**Notification Type Values:**
- order_placed
- order_confirmed
- order_shipped
- order_delivered
- order_cancelled
- payment_success
- payment_failed
- price_drop
- back_in_stock
- promotional
- flash_sale
- cart_abandoned
- review_reminder
- loyalty_points
- referral_reward
- system_announcement

---

### 3.15 Support Tickets Collection

**Path:** `/support_tickets/{ticketId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Ticket ID |
| ticketNumber | string | Yes | Display number |
| userId | string | Yes | Customer ID |
| userName | string | Yes | Customer name |
| userEmail | string | Yes | Customer email |
| orderId | string | No | Related order |
| subject | string | Yes | Ticket subject |
| category | string | Yes | Ticket category |
| priority | string | Yes | low, medium, high, urgent |
| status | string | Yes | Ticket status |
| assignedAgentId | string | No | Assigned staff |
| assignedAgentName | string | No | Staff name |
| tags | array | No | Ticket tags |
| lastMessageAt | timestamp | Yes | Last message time |
| lastMessageBy | string | Yes | Last responder |
| responseCount | number | Yes | Total responses |
| satisfactionRating | number | No | CSAT rating 1-5 |
| feedback | string | No | Customer feedback |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |
| resolvedAt | timestamp | No | Resolution time |
| closedAt | timestamp | No | Closure time |
| firstResponseAt | timestamp | No | First response time |

**Ticket Category Values:**
- order_issue
- payment_issue
- product_query
- return_refund
- delivery_issue
- account_issue
- technical_issue
- feedback
- other

**Ticket Status Values:**
- open
- in_progress
- waiting_on_customer
- waiting_on_third_party
- resolved
- closed
- reopened

**Subcollections:**

#### /support_tickets/{ticketId}/messages/{messageId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Message ID |
| senderId | string | Yes | Sender ID |
| senderName | string | Yes | Sender name |
| senderType | string | Yes | user, agent, system |
| content | string | Yes | Message content |
| attachments | array | No | File attachments |
| isInternal | boolean | Yes | Internal note flag |
| createdAt | timestamp | Yes | Send time |

---

### 3.16 Loyalty Accounts Collection

**Path:** `/loyalty_accounts/{userId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| currentPoints | number | Yes | Available points |
| lifetimePoints | number | Yes | Total earned |
| redeemedPoints | number | Yes | Total redeemed |
| tier | string | Yes | bronze, silver, gold, platinum |
| tierProgress | number | Yes | Progress to next tier |
| tierExpiryDate | timestamp | No | Tier expiry |
| referralCode | string | Yes | Unique referral code |
| referralCount | number | Yes | Successful referrals |
| referralEarnings | number | Yes | Points from referrals |
| lastEarnedAt | timestamp | No | Last earn time |
| lastRedeemedAt | timestamp | No | Last redeem time |
| createdAt | timestamp | Yes | Enrollment time |
| updatedAt | timestamp | Yes | Last update |

**Subcollections:**

#### /loyalty_accounts/{userId}/transactions/{transactionId}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Transaction ID |
| type | string | Yes | earned, redeemed, expired, bonus, referral, adjustment |
| points | number | Yes | Points (+ or -) |
| balance | number | Yes | Balance after |
| description | string | Yes | Transaction description |
| orderId | string | No | Related order |
| referredUserId | string | No | Referred user |
| expiresAt | timestamp | No | Points expiry |
| createdAt | timestamp | Yes | Transaction time |

---

### 3.17 App Config Collection

**Path:** `/app_config/{configId}`

#### /app_config/general

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appName | string | Yes | Application name |
| appVersion | string | Yes | Current version |
| minAppVersion | string | Yes | Minimum required |
| maintenanceMode | boolean | Yes | Maintenance flag |
| maintenanceMessage | string | No | Maintenance message |
| contactEmail | string | Yes | Support email |
| contactPhone | string | Yes | Support phone |
| websiteUrl | string | No | Website URL |
| socialLinks | map | No | Social media URLs |
| defaultCurrency | string | Yes | Default currency |
| supportedCurrencies | array | Yes | Available currencies |
| defaultLanguage | string | Yes | Default language |
| supportedLanguages | array | Yes | Available languages |
| updatedAt | timestamp | Yes | Last update |

#### /app_config/payment_settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabledMethods | array | Yes | Active payment methods |
| codEnabled | boolean | Yes | COD available |
| codMinOrder | number | No | COD minimum order |
| codMaxOrder | number | No | COD maximum order |
| codExtraCharge | number | No | COD handling fee |
| razorpayEnabled | boolean | Yes | Razorpay active |
| stripeEnabled | boolean | Yes | Stripe active |
| walletEnabled | boolean | Yes | Wallet active |
| emiEnabled | boolean | Yes | EMI active |
| updatedAt | timestamp | Yes | Last update |

#### /app_config/shipping_settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| freeShippingThreshold | number | No | Free shipping minimum |
| defaultShippingRate | number | Yes | Standard shipping |
| expressShippingRate | number | No | Express shipping |
| estimatedDeliveryDays | number | Yes | Standard delivery days |
| expressDeliveryDays | number | No | Express delivery days |
| shippingZones | array | No | Shipping zones config |
| restrictedPincodes | array | No | Non-serviceable areas |
| updatedAt | timestamp | Yes | Last update |

#### /app_config/tax_settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taxEnabled | boolean | Yes | Tax calculation on |
| defaultTaxRate | number | Yes | Default tax % |
| taxIncludedInPrice | boolean | Yes | Tax inclusive pricing |
| gstEnabled | boolean | Yes | GST enabled |
| gstNumber | string | No | Business GST |
| taxRules | array | No | Category tax rules |
| updatedAt | timestamp | Yes | Last update |

#### /app_config/loyalty_settings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Loyalty program on |
| pointsPerCurrency | number | Yes | Points per ₹ spent |
| pointsValue | number | Yes | ₹ value per point |
| minRedemption | number | Yes | Min points to redeem |
| maxRedemptionPercent | number | Yes | Max % payable by points |
| referralBonus | number | Yes | Points for referral |
| reviewBonus | number | Yes | Points for review |
| birthdayBonus | number | Yes | Birthday points |
| tierThresholds | map | Yes | Tier point requirements |
| tierMultipliers | map | Yes | Tier earn multipliers |
| updatedAt | timestamp | Yes | Last update |

---

### 3.18 Staff Collection

**Path:** `/staff/{staffId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Staff ID |
| email | string | Yes | Staff email |
| name | string | Yes | Full name |
| phone | string | No | Phone number |
| avatar | string | No | Profile picture |
| roleId | string | Yes | Role reference |
| roleName | string | Yes | Role name |
| permissions | array | Yes | Permission list |
| isActive | boolean | Yes | Active status |
| isSuperAdmin | boolean | Yes | Super admin flag |
| lastLoginAt | timestamp | No | Last login |
| lastLoginIp | string | No | Last login IP |
| createdBy | string | Yes | Creator admin |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

---

### 3.19 Roles Collection

**Path:** `/roles/{roleId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Role ID |
| name | string | Yes | Role name |
| description | string | No | Role description |
| permissions | map | Yes | Module permissions |
| isSystemRole | boolean | Yes | Cannot delete |
| staffCount | number | Yes | Staff with role |
| createdBy | string | Yes | Creator admin |
| createdAt | timestamp | Yes | Creation time |
| updatedAt | timestamp | Yes | Last update |

**Permissions Structure:**

```
permissions: {
  dashboard: [view],
  products: [view, create, edit, delete],
  categories: [view, create, edit, delete],
  orders: [view, edit, cancel, refund],
  customers: [view, edit, delete],
  inventory: [view, manage],
  coupons: [view, create, edit, delete],
  flash_sales: [view, create, edit, delete],
  banners: [view, create, edit, delete],
  reviews: [view, moderate, respond],
  support: [view, respond, assign, close],
  reports: [view, export],
  settings: [view, manage],
  staff: [view, create, edit, delete],
  roles: [view, create, edit, delete]
}
```

---

### 3.20 Activity Logs Collection

**Path:** `/activity_logs/{logId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Log ID |
| staffId | string | Yes | Staff who acted |
| staffName | string | Yes | Staff name |
| staffEmail | string | Yes | Staff email |
| action | string | Yes | Action performed |
| module | string | Yes | Module affected |
| entityType | string | Yes | Entity type |
| entityId | string | Yes | Entity ID |
| entityName | string | No | Entity name |
| oldValue | map | No | Previous state |
| newValue | map | No | New state |
| changes | array | No | Changed fields |
| ipAddress | string | No | Actor IP |
| userAgent | string | No | Browser/device |
| createdAt | timestamp | Yes | Action time |

**Action Values:**
- create
- update
- delete
- view
- login
- logout
- export
- import
- approve
- reject
- assign

---

### 3.21 Analytics Collection

**Path:** `/analytics/{docId}`

#### /analytics/daily_stats/{date}

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | Yes | YYYY-MM-DD |
| totalOrders | number | Yes | Orders placed |
| totalRevenue | number | Yes | Revenue generated |
| averageOrderValue | number | Yes | AOV |
| totalUsers | number | Yes | Registered users |
| newUsers | number | Yes | New registrations |
| activeUsers | number | Yes | Active users |
| totalProducts | number | Yes | Active products |
| productsViewed | number | Yes | Product views |
| cartAdditions | number | Yes | Add to cart events |
| checkoutStarted | number | Yes | Checkout starts |
| checkoutCompleted | number | Yes | Successful orders |
| conversionRate | number | Yes | Conversion % |
| cartAbandonmentRate | number | Yes | Abandonment % |
| topProducts | array | Yes | Top selling products |
| topCategories | array | Yes | Top categories |
| revenueByPayment | map | Yes | Revenue by method |
| ordersByStatus | map | Yes | Orders by status |
| createdAt | timestamp | Yes | Generation time |

---

## 4. Collection References

### 4.1 Reference Map

| Source Collection | Reference Field | Target Collection | Relationship |
|-------------------|-----------------|-------------------|--------------|
| users | - | - | Root |
| products | categoryId | categories | Many-to-One |
| products | subCategoryId | categories | Many-to-One |
| products | brandId | brands | Many-to-One |
| products/reviews | userId | users | Many-to-One |
| products/reviews | orderId | orders | Many-to-One |
| categories | parentId | categories | Self-reference |
| carts | userId | users | Many-to-One |
| carts/items | productId | products | Many-to-One |
| carts/items | variantId | products/variants | Many-to-One |
| wishlists | userId | users | Many-to-One |
| wishlists/items | productId | products | Many-to-One |
| orders | userId | users | Many-to-One |
| orders | paymentId | payments | One-to-One |
| orders/items | productId | products | Many-to-One |
| payments | orderId | orders | One-to-One |
| payments | userId | users | Many-to-One |
| reviews | productId | products | Many-to-One |
| reviews | userId | users | Many-to-One |
| reviews | orderId | orders | Many-to-One |
| coupons | createdBy | staff | Many-to-One |
| flash_sales/items | productId | products | Many-to-One |
| banners | createdBy | staff | Many-to-One |
| support_tickets | userId | users | Many-to-One |
| support_tickets | orderId | orders | Many-to-One |
| support_tickets | assignedAgentId | staff | Many-to-One |
| loyalty_accounts | userId | users | One-to-One |
| loyalty_accounts/transactions | orderId | orders | Many-to-One |
| staff | roleId | roles | Many-to-One |
| activity_logs | staffId | staff | Many-to-One |

---

## 5. Document Relationships

### 5.1 User Relationships

```
User
├── Addresses (subcollection)
├── Preferences (subcollection)
├── Devices (subcollection)
├── Cart (reference)
├── Wishlists (query by userId)
├── Orders (query by userId)
├── Reviews (query by userId)
├── Notifications (subcollection)
├── Support Tickets (query by userId)
└── Loyalty Account (same ID)
```

### 5.2 Product Relationships

```
Product
├── Variants (subcollection)
├── Reviews (subcollection)
├── Category (reference)
├── SubCategory (reference)
├── Brand (reference)
├── Cart Items (query by productId)
├── Wishlist Items (query by productId)
├── Order Items (query by productId)
└── Flash Sale Items (query by productId)
```

### 5.3 Order Relationships

```
Order
├── Items (subcollection)
├── Timeline (subcollection)
├── User (reference)
├── Payment (reference)
├── Shipping Address (embedded)
├── Support Tickets (query by orderId)
└── Reviews (query by orderId)
```

---

## 6. Firebase Storage Structure

### 6.1 Storage Buckets

```
storage-root/
│
├── products/
│   └── {productId}/
│       ├── images/
│       │   ├── main.jpg
│       │   ├── main_thumb.jpg
│       │   ├── gallery_1.jpg
│       │   ├── gallery_1_thumb.jpg
│       │   └── ...
│       └── videos/
│           └── demo.mp4
│
├── categories/
│   └── {categoryId}/
│       ├── image.jpg
│       ├── banner.jpg
│       └── icon.png
│
├── brands/
│   └── {brandId}/
│       ├── logo.png
│       └── banner.jpg
│
├── users/
│   └── {userId}/
│       └── avatar.jpg
│
├── reviews/
│   └── {reviewId}/
│       ├── image_1.jpg
│       ├── image_2.jpg
│       └── video.mp4
│
├── banners/
│   └── {bannerId}/
│       ├── desktop.jpg
│       └── mobile.jpg
│
├── support/
│   └── {ticketId}/
│       └── attachments/
│           └── {fileName}
│
├── invoices/
│   └── {orderId}/
│       └── invoice.pdf
│
└── app/
    ├── logo.png
    ├── logo_dark.png
    ├── favicon.ico
    └── assets/
        └── ...
```

### 6.2 Storage Rules

| Path | Read | Write | Max Size |
|------|------|-------|----------|
| /products/{productId}/** | Public | Admin | 10MB |
| /categories/** | Public | Admin | 5MB |
| /brands/** | Public | Admin | 5MB |
| /users/{userId}/** | Owner | Owner | 5MB |
| /reviews/{reviewId}/** | Public | Owner | 10MB |
| /banners/** | Public | Admin | 5MB |
| /support/{ticketId}/** | Owner, Staff | Owner, Staff | 10MB |
| /invoices/{orderId}/** | Owner, Staff | System | 2MB |
| /app/** | Public | Admin | 5MB |

### 6.3 Image Specifications

| Type | Format | Max Size | Dimensions |
|------|--------|----------|------------|
| Product Main | JPEG/PNG | 5MB | 1200x1200 |
| Product Thumbnail | JPEG | 100KB | 300x300 |
| Product Gallery | JPEG/PNG | 5MB | 1200x1200 |
| Category Image | JPEG/PNG | 2MB | 800x800 |
| Category Banner | JPEG | 3MB | 1920x600 |
| Brand Logo | PNG | 1MB | 400x400 |
| User Avatar | JPEG/PNG | 2MB | 500x500 |
| Review Image | JPEG/PNG | 5MB | 1200x1200 |
| Banner Desktop | JPEG | 3MB | 1920x600 |
| Banner Mobile | JPEG | 2MB | 800x800 |

---

## 7. Cloud Functions

### 7.1 Authentication Triggers

| Function | Trigger | Purpose |
|----------|---------|---------|
| onUserCreated | auth.user().onCreate | Create user doc, loyalty account, send welcome email |
| onUserDeleted | auth.user().onDelete | Clean up user data, anonymize orders |

### 7.2 Firestore Triggers

| Function | Trigger | Purpose |
|----------|---------|---------|
| onOrderCreated | orders/{orderId}.onCreate | Generate order number, send confirmation, update stock |
| onOrderUpdated | orders/{orderId}.onUpdate | Send status notification, update timeline |
| onPaymentCreated | payments/{paymentId}.onCreate | Log payment, trigger order confirmation |
| onPaymentUpdated | payments/{paymentId}.onUpdate | Handle payment status changes |
| onReviewCreated | reviews/{reviewId}.onCreate | Moderate, update product rating, award points |
| onProductUpdated | products/{productId}.onUpdate | Update search index, sync variants |
| onCartUpdated | carts/{cartId}.onUpdate | Validate stock, recalculate totals |
| onCouponUsed | orders/{orderId}.onCreate | Increment coupon usage count |

### 7.3 HTTPS Callable Functions

| Function | Purpose | Parameters |
|----------|---------|------------|
| createPaymentOrder | Create payment gateway order | cartId, paymentMethod |
| verifyPayment | Verify payment signature | paymentId, signature |
| processRefund | Process refund | orderId, amount, reason |
| validateCoupon | Validate coupon code | code, cartTotal, userId |
| generateInvoice | Generate PDF invoice | orderId |
| sendNotification | Send push notification | userId, title, body, data |
| calculateShipping | Calculate shipping cost | addressId, cartId |
| checkStock | Check product availability | productId, variantId, quantity |
| applyLoyaltyPoints | Apply points to order | orderId, points |
| submitSupportTicket | Create support ticket | subject, category, message |

### 7.4 Scheduled Functions

| Function | Schedule | Purpose |
|----------|----------|---------|
| cleanupExpiredCarts | Daily 2:00 AM | Remove expired guest carts |
| sendAbandonedCartReminders | Every 6 hours | Send cart abandonment emails |
| expireLoyaltyPoints | Daily 1:00 AM | Expire old points |
| generateDailyAnalytics | Daily 12:00 AM | Calculate daily stats |
| checkLowStock | Every hour | Send low stock alerts |
| sendPriceDropAlerts | Every 4 hours | Notify price drops |
| sendBackInStockAlerts | Every hour | Notify back in stock |
| updateFlashSaleStatus | Every minute | Start/end flash sales |
| cleanupOldNotifications | Weekly | Remove old notifications |

### 7.5 HTTP Functions (Webhooks)

| Function | Purpose | Provider |
|----------|---------|----------|
| razorpayWebhook | Handle Razorpay events | Razorpay |
| stripeWebhook | Handle Stripe events | Stripe |
| shiprocketWebhook | Handle shipping updates | Shiprocket |

---

## 8. Security Rules

### 8.1 Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isStaff() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }
    
    function getStaffData() {
      return get(/databases/$(database)/documents/staff/$(request.auth.uid)).data;
    }
    
    function hasPermission(module, action) {
      return isStaff() && 
        action in getStaffData().permissions[module];
    }
    
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin() || hasPermission('customers', 'view');
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin() || hasPermission('customers', 'edit');
      allow delete: if isAdmin() || hasPermission('customers', 'delete');
      
      match /addresses/{addressId} {
        allow read, write: if isOwner(userId);
      }
      
      match /preferences/{prefId} {
        allow read, write: if isOwner(userId);
      }
      
      match /devices/{deviceId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Products Collection
    match /products/{productId} {
      allow read: if true;
      allow create: if hasPermission('products', 'create');
      allow update: if hasPermission('products', 'edit');
      allow delete: if hasPermission('products', 'delete');
      
      match /variants/{variantId} {
        allow read: if true;
        allow write: if hasPermission('products', 'edit');
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update: if isOwner(resource.data.userId) || hasPermission('reviews', 'moderate');
        allow delete: if isAdmin();
      }
    }
    
    // Categories Collection
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if hasPermission('categories', 'create') || 
                     hasPermission('categories', 'edit') || 
                     hasPermission('categories', 'delete');
    }
    
    // Brands Collection
    match /brands/{brandId} {
      allow read: if true;
      allow write: if hasPermission('products', 'edit');
    }
    
    // Carts Collection
    match /carts/{cartId} {
      allow read: if isOwner(resource.data.userId) || 
                    resource.data.guestId == request.auth.token.guestId;
      allow create: if true;
      allow update: if isOwner(resource.data.userId) || 
                      resource.data.guestId == request.auth.token.guestId;
      allow delete: if isOwner(resource.data.userId) || isAdmin();
      
      match /items/{itemId} {
        allow read, write: if isOwner(get(/databases/$(database)/documents/carts/$(cartId)).data.userId);
      }
    }
    
    // Wishlists Collection
    match /wishlists/{wishlistId} {
      allow read: if isOwner(resource.data.userId) || resource.data.isPublic == true;
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
      
      match /items/{itemId} {
        allow read: if isOwner(get(/databases/$(database)/documents/wishlists/$(wishlistId)).data.userId) ||
                      get(/databases/$(database)/documents/wishlists/$(wishlistId)).data.isPublic == true;
        allow write: if isOwner(get(/databases/$(database)/documents/wishlists/$(wishlistId)).data.userId);
      }
    }
    
    // Orders Collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) || hasPermission('orders', 'view');
      allow create: if isAuthenticated();
      allow update: if hasPermission('orders', 'edit');
      allow delete: if false;
      
      match /items/{itemId} {
        allow read: if isOwner(get(/databases/$(database)/documents/orders/$(orderId)).data.userId) ||
                      hasPermission('orders', 'view');
        allow write: if hasPermission('orders', 'edit');
      }
      
      match /timeline/{eventId} {
        allow read: if isOwner(get(/databases/$(database)/documents/orders/$(orderId)).data.userId) ||
                      hasPermission('orders', 'view');
        allow write: if hasPermission('orders', 'edit');
      }
    }
    
    // Payments Collection
    match /payments/{paymentId} {
      allow read: if isOwner(resource.data.userId) || hasPermission('orders', 'view');
      allow create: if isAuthenticated();
      allow update: if false;
      allow delete: if false;
    }
    
    // Reviews Collection (Global)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || hasPermission('reviews', 'moderate');
      allow delete: if isAdmin();
    }
    
    // Coupons Collection
    match /coupons/{couponId} {
      allow read: if isAuthenticated();
      allow write: if hasPermission('coupons', 'create') || 
                     hasPermission('coupons', 'edit') || 
                     hasPermission('coupons', 'delete');
    }
    
    // Flash Sales Collection
    match /flash_sales/{saleId} {
      allow read: if true;
      allow write: if hasPermission('flash_sales', 'create') || 
                     hasPermission('flash_sales', 'edit') || 
                     hasPermission('flash_sales', 'delete');
      
      match /items/{itemId} {
        allow read: if true;
        allow write: if hasPermission('flash_sales', 'edit');
      }
    }
    
    // Banners Collection
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if hasPermission('banners', 'create') || 
                     hasPermission('banners', 'edit') || 
                     hasPermission('banners', 'delete');
    }
    
    // Notifications Collection
    match /notifications/{userId}/items/{notificationId} {
      allow read: if isOwner(userId);
      allow create: if false;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Support Tickets Collection
    match /support_tickets/{ticketId} {
      allow read: if isOwner(resource.data.userId) || hasPermission('support', 'view');
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || hasPermission('support', 'respond');
      allow delete: if false;
      
      match /messages/{messageId} {
        allow read: if isOwner(get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId) ||
                      hasPermission('support', 'view');
        allow create: if isOwner(get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId) ||
                        hasPermission('support', 'respond');
        allow update, delete: if false;
      }
    }
    
    // Loyalty Accounts Collection
    match /loyalty_accounts/{userId} {
      allow read: if isOwner(userId);
      allow write: if false;
      
      match /transactions/{transactionId} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
    }
    
    // App Config Collection
    match /app_config/{configId} {
      allow read: if true;
      allow write: if hasPermission('settings', 'manage');
    }
    
    // Staff Collection
    match /staff/{staffId} {
      allow read: if isStaff() || isAdmin();
      allow write: if hasPermission('staff', 'create') || 
                     hasPermission('staff', 'edit') || 
                     hasPermission('staff', 'delete');
    }
    
    // Roles Collection
    match /roles/{roleId} {
      allow read: if isStaff();
      allow write: if hasPermission('roles', 'create') || 
                     hasPermission('roles', 'edit') || 
                     hasPermission('roles', 'delete');
    }
    
    // Activity Logs Collection
    match /activity_logs/{logId} {
      allow read: if isAdmin() || hasPermission('reports', 'view');
      allow create: if isStaff();
      allow update, delete: if false;
    }
    
    // Analytics Collection
    match /analytics/{docId} {
      allow read: if hasPermission('reports', 'view');
      allow write: if false;
      
      match /{subDoc=**} {
        allow read: if hasPermission('reports', 'view');
        allow write: if false;
      }
    }
  }
}
```

### 8.2 Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isStaff() {
      return isAuthenticated() && 
        firestore.exists(/databases/(default)/documents/staff/$(request.auth.uid));
    }
    
    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 10 * 1024 * 1024;
    }
    
    function isValidVideo() {
      return request.resource.contentType.matches('video/.*') &&
             request.resource.size < 50 * 1024 * 1024;
    }
    
    function isValidPdf() {
      return request.resource.contentType == 'application/pdf' &&
             request.resource.size < 5 * 1024 * 1024;
    }
    
    // Products
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if isStaff() && (isValidImage() || isValidVideo());
    }
    
    // Categories
    match /categories/{categoryId}/{allPaths=**} {
      allow read: if true;
      allow write: if isStaff() && isValidImage();
    }
    
    // Brands
    match /brands/{brandId}/{allPaths=**} {
      allow read: if true;
      allow write: if isStaff() && isValidImage();
    }
    
    // Users
    match /users/{userId}/{allPaths=**} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) && isValidImage();
    }
    
    // Reviews
    match /reviews/{reviewId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && (isValidImage() || isValidVideo());
    }
    
    // Banners
    match /banners/{bannerId}/{allPaths=**} {
      allow read: if true;
      allow write: if isStaff() && isValidImage();
    }
    
    // Support
    match /support/{ticketId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Invoices
    match /invoices/{orderId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    // App Assets
    match /app/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 9. Indexes

### 9.1 Composite Indexes Required

| Collection | Fields | Query Type |
|------------|--------|------------|
| products | categoryId (ASC), status (ASC), createdAt (DESC) | Collection |
| products | status (ASC), isFeatured (ASC), createdAt (DESC) | Collection |
| products | status (ASC), isNewArrival (ASC), createdAt (DESC) | Collection |
| products | status (ASC), averageRating (DESC) | Collection |
| products | status (ASC), basePrice (ASC) | Collection |
| products | status (ASC), basePrice (DESC) | Collection |
| products | status (ASC), totalSold (DESC) | Collection |
| products | brandId (ASC), status (ASC), createdAt (DESC) | Collection |
| orders | userId (ASC), createdAt (DESC) | Collection |
| orders | userId (ASC), status (ASC), createdAt (DESC) | Collection |
| orders | status (ASC), createdAt (DESC) | Collection |
| reviews | productId (ASC), status (ASC), createdAt (DESC) | Collection |
| reviews | productId (ASC), status (ASC), rating (DESC) | Collection |
| reviews | userId (ASC), createdAt (DESC) | Collection |
| coupons | isActive (ASC), endDate (ASC) | Collection |
| coupons | code (ASC) | Collection |
| banners | position (ASC), isActive (ASC), sortOrder (ASC) | Collection |
| support_tickets | userId (ASC), status (ASC), createdAt (DESC) | Collection |
| support_tickets | assignedAgentId (ASC), status (ASC), createdAt (DESC) | Collection |
| support_tickets | status (ASC), priority (DESC), createdAt (ASC) | Collection |
| notifications/{userId}/items | isRead (ASC), createdAt (DESC) | Collection Group |
| activity_logs | staffId (ASC), createdAt (DESC) | Collection |
| activity_logs | module (ASC), createdAt (DESC) | Collection |

### 9.2 Single Field Indexes

| Collection | Field | Order |
|------------|-------|-------|
| products | sku | ASC |
| products | searchKeywords | ARRAY_CONTAINS |
| products | tags | ARRAY_CONTAINS |
| categories | slug | ASC |
| categories | parentId | ASC |
| brands | slug | ASC |
| coupons | code | ASC |
| orders | orderNumber | ASC |
| support_tickets | ticketNumber | ASC |
| users | email | ASC |
| users | phoneNumber | ASC |
| staff | email | ASC |

---

## 10. Data Models

### 10.1 Enum Values Reference

#### User Role
- user
- vendor
- admin

#### User Status
- active
- suspended
- pending_verification
- deleted

#### Product Status
- active
- draft
- archived

#### Product Type
- simple
- variable
- bundle

#### Address Type
- home
- office
- other

#### Order Status
- pending
- confirmed
- processing
- packed
- shipped
- out_for_delivery
- delivered
- cancelled
- returned
- refunded

#### Payment Status
- pending
- processing
- authorized
- captured
- success
- failed
- cancelled
- refunded
- partially_refunded

#### Payment Method
- card
- upi
- net_banking
- wallet
- cod
- emi
- bnpl
- store_credit

#### Review Status
- pending
- approved
- rejected

#### Coupon Discount Type
- percentage
- fixed_amount
- free_shipping
- buy_x_get_y

#### Banner Link Type
- product
- category
- brand
- url
- none

#### Notification Type
- order_placed
- order_confirmed
- order_shipped
- order_delivered
- order_cancelled
- payment_success
- payment_failed
- price_drop
- back_in_stock
- promotional
- flash_sale
- cart_abandoned
- review_reminder
- loyalty_points
- referral_reward
- system_announcement

#### Ticket Category
- order_issue
- payment_issue
- product_query
- return_refund
- delivery_issue
- account_issue
- technical_issue
- feedback
- other

#### Ticket Priority
- low
- medium
- high
- urgent

#### Ticket Status
- open
- in_progress
- waiting_on_customer
- waiting_on_third_party
- resolved
- closed
- reopened

#### Loyalty Tier
- bronze
- silver
- gold
- platinum

#### Loyalty Transaction Type
- earned
- redeemed
- expired
- bonus
- referral
- adjustment

#### Activity Log Action
- create
- update
- delete
- view
- login
- logout
- export
- import
- approve
- reject
- assign

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial Firebase schema documentation |

---

*This document serves as the complete reference for Firebase backend implementation including Firestore schemas, Storage structure, Cloud Functions, Security Rules, and all data models.*
