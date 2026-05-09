# Functional Documentation for Raphaaa Ecommerce Website

## Project Overview
- Project Name: Raphaaa Ecommerce Website
- Project Type: Role-based B2C Ecommerce + Admin Operations Platform
- Architecture: React frontend + Node/Express backend + MongoDB
- Primary Business Scope: Product catalog, shopping cart, checkout, online/COD payments, order lifecycle, offers, and website CMS settings
- Additional Operations Scope: Inventory, sales analytics, tasks, complaints, subscribers, and marketing broadcast

## Technology Stack
- Frontend: React, Vite, React Router, Redux Toolkit, TailwindCSS, Chart.js/Recharts
- Backend: Node.js, Express, Mongoose, JWT, Bcrypt, Node-Cron
- Database: MongoDB
- Payment: Razorpay + PayPal integration paths
- Media: Cloudinary uploads and hosted image assets
- Communication: Email services, SMS OTP, web push utilities
- Documents: PDF invoice support

## Current System Scale (From Codebase)
- Backend route modules: 33
- Backend models: 25
- Frontend pages/components: extensive user + admin dashboards with role-guarded paths

## Role Model
- Guest/Public
- Customer
- Admin
- Merchantise
- Delivery Boy
- Marketing

## Role-wise Module Access Matrix

| Module | Guest/Public | Customer | Admin | Merchantise | Delivery Boy | Marketing |
|---|---|---|---|---|---|---|
| Auth (Register/Login/Reset) | Yes | Yes | Yes | Yes | Yes | Yes |
| Product Browsing & Search | Yes | Yes | Yes | Yes | Yes | Yes |
| Cart & Checkout | Yes/Partial | Yes | Yes | Yes | Limited | Limited |
| Orders (Own) | No | Yes | Yes | Yes | Limited by ops | Limited by ops |
| Reviews & Ratings | View | Submit/View | Moderate/View | Moderate/View | No | No |
| Wishlist | No | Yes | Yes | Yes | No | No |
| Offers Showcase | Yes | Yes | Yes | Yes | Yes | Yes |
| Website CMS (Hero/About/Policy/Contact Settings) | View | View | Manage | Manage | No | Limited View |
| Admin Product Management | No | No | Full | Full | No | No |
| Admin Order Management | No | No | Full | Full | Operational access | Operational access |
| User Management | No | No | Full | Full (as configured) | No | No |
| Inventory Management | No | No | Yes | Yes | No | No |
| Sales/Revenue/Trend Analytics | No | No | Yes | Yes | No | No |
| Task Management | No | Limited personal | All | Primary | Limited | Limited |
| Campaign Tracker & Broadcast | No | No | Oversight | Limited | No | Full |
| Subscribers & Contact Messages | Submit | Submit/View own interactions | Full | Full | No | Full |
| Complaints | Submit | Submit/View | Handle | Handle | Limited | Limited |
| Meta Options / Catalog Config | No | No | Yes | Yes | No | No |
| Delivery Registration | Yes | N/A | Yes | Yes | Yes | No |

## Core Functional Modules

### 1. Authentication and User Account Module
- User registration, login, and JWT token issuance.
- Google login flow support.
- Forgot/reset password flows for users and admin-side reset utility.
- OTP-based mobile verification (`send-otp`, `verify-otp` flow).
- Profile update and role-aware session handling in frontend.

### 2. Role and Access Control Module
- Backend middleware: `protect`, `admin`, `adminOrMerchantise`, and generic `roleCheck(...)`.
- Frontend protected routes enforce role-based admin page access.
- Roles include operational variants beyond standard admin/customer.

### 3. Product Catalog Module
- Public product listing and product detail pages.
- Category/collection-specific pages (`CollectionPage`, exclusive drop pages).
- Admin/merchant product CRUD through admin product routes and UI.
- Meta options for configurable catalog attributes.

### 4. Cart and Wishlist Module
- Cart add/update/remove/fetch for shopping flow.
- Wishlist add/remove/list for authenticated users.
- Cart drawer and checkout components integrated with product pages.

### 5. Checkout and Order Module
- Checkout pipeline with address capture and order confirmation.
- Order placement and lifecycle management.
- Customer order history and order detail pages.
- Admin/ops order board with status updates and operational controls.

### 6. Payment Module
- Razorpay route integration for online payments.
- PayPal button component available in frontend.
- Payment webhook endpoint for server-side payment event handling.
- Payment status integration into order state progression.

### 7. Review and Feedback Module
- Product review submission flow, including order-linked review screens.
- Review management routes for retrieval and moderation.

### 8. Website CMS / Content Settings Module
- Hero content management.
- About content management.
- Contact settings management.
- Privacy policy content management.
- Public consumption of settings-driven content pages.

### 9. Offers and Promotion Module
- Offer creation, editing, listing, and showcase pages.
- Scheduled email/offer broadcasts through scheduler services.
- Offer lifecycle support across admin and storefront.

### 10. Campaign Tracking Module
- Marketing-only campaign CRUD endpoints.
- Public click tracking and pixel impression routes.
- Conversion tracking endpoint for campaign performance measurement.

### 11. Subscriber and Contact Module
- Newsletter/subscriber collection and subscriber list views.
- Contact form submission and admin inbox views.
- Marketing broadcast interface for targeted communication.

### 12. Complaint Management Module
- Complaint submission and processing routes.
- Suitable for customer grievance capture and internal response workflows.

### 13. Inventory and Sales Intelligence Module
- Inventory route set and admin pages.
- Sales trend analytics dashboard.
- Revenue reporting module for business monitoring.

### 14. Task and Internal Workflow Module
- Task creation, assignment-by-email, status update, and delete routes.
- Daily scheduler marks unresolved tasks as `not-completed` after configured cutoff.
- Supports internal team workflow for merchant/admin operations.

### 15. Collaboration and Exclusive Drops Module
- Collab settings and preview admin screens.
- Exclusive drop pages and detail pages for campaign-driven merchandise launches.

### 16. File Upload and Media Module
- Secure upload endpoints protected by auth + admin middleware.
- Cloudinary image upload and deletion support.
- Product and site media asset lifecycle handling.

### 17. Address Management Module
- User address CRUD endpoints and checkout address integration.
- Supports delivery information persistence for repeat ordering.

## Frontend Functional Areas

### A. Storefront (Public + Customer)
- Home, collections, product details, cart, checkout, order confirmation.
- Login/register/profile/update profile.
- Offers, exclusive drops, about/contact/privacy pages.
- Wishlist, order history, review submissions.

### B. Admin Portal (Role-Gated)
- Dashboard home and role-aware sidebar sections.
- Product management and product editing.
- Order management board.
- User management and hierarchy pages.
- Inventory, sales trends, revenue report.
- Website settings (hero/about/contact/privacy).
- Offers management and campaign tracker.
- Subscriber/contact monitoring and email scheduler.
- Task management and complaint handling.

## Key Backend Data Entities
- User
- Product
- Cart
- Checkout / Checkout1
- Order
- Payment
- Review
- Wishlist
- Offer
- Campaign
- Task
- Subscriber
- Contact / ContactSetting
- Complaint
- Hero
- About
- Policy
- MetaOption
- Collab

## Integration Summary
- Cloudinary: media upload/delete for product/site assets.
- Razorpay: payment initiation and verification/webhook processing.
- PayPal (frontend component support): alternate payment UX.
- Email services: welcome mails, marketing/offer broadcasts, transactional communication.
- SMS utility: OTP verification support.

## Operational Automation
- Task status auto-update scheduler (daily rule-based update).
- Scheduled promotional email trigger service.
- Health check endpoint and self-ping behavior for uptime on hosted platform.

## Security and Access Notes
- JWT-based authenticated API access for protected modules.
- Role-based middleware and frontend route guards are both used.
- Certain settings routes are implemented without explicit middleware and should be reviewed for stricter production hardening.

## Functional Summary
Raphaaa Ecommerce Website is a full-stack commerce platform combining customer shopping workflows with strong internal operational tooling. It supports multi-role administration (`admin`, `merchantise`, `marketing`, `delivery_boy`) and includes not only product-order-payment workflows but also campaign tracking, inventory intelligence, content management, and internal task governance.

## Document Metadata
- Document Type: Functional Documentation (Role-wise + Module-wise)
- Project: Raphaaa Ecommerce Website
- Prepared From: Current codebase snapshot in `/Projects/Raphaaa`
- Update Recommendation: Revise after any route, role, or module change
