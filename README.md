# Neighbourhood Bike Hub

A responsive front-end prototype for a sustainable residential cycling project in Gotland, Sweden.

## Included features

- Home page and bicycle availability summary
- Sample fleet: three normal bicycles, one electric bicycle and one cargo bicycle
- Resident demo login, registration and approval workflow
- Free booking flow for all bicycle types
- Date/time selection, configurable booking duration and overlap prevention per bicycle
- Personal upcoming bookings and cancellation
- Electric bicycle battery status
- Repair station equipment status and safety guides
- Maintenance issue reports with reference numbers
- Administrator demo dashboard for fleet, bookings, reports, resident approval, booking limits and usage summaries
- CSV export for booking records
- Proposed Bronze, Silver and Gold Bike-Friendly rating
- QR landing page at `#qr`
- Browser-local persistence via `localStorage`

## Demo accounts

**Resident**
- Email: `resident@example.com`
- Password: `BikeHub123`

**Administrator**
- Email: `admin@bikehub.demo`
- Password: `AdminHub123`

These are demonstration credentials only. Do not use real passwords or real resident data.

## Publish with GitHub Pages

1. Download and extract the ZIP package.
2. Create a repository on GitHub, e.g. `neighbourhood-bike-hub`.
3. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then save.
7. Wait for GitHub Pages to publish the site. The public address appears in the Pages settings.

For the physical hub QR code, create a QR code that points to the published address followed by `#qr`. Replace/configure this URL if your deployment address changes.

## Prototype limitations

- This is a static front-end prototype. User accounts, bookings, bicycle status, equipment status and reports are stored in the current browser using localStorage.
- Data is not shared between residents or devices and can be cleared by the browser.
- Authentication and role restrictions are client-side demonstration logic, not real security. The admin route is not protected against a technically skilled visitor.
- Booking overlap checks run in the browser, not on a server. They cannot prevent conflicts between different devices.
- Reports are not sent to a housing provider. Selected photos are not uploaded or stored.
- No live key/lock system, email notifications or housing-provider integration is connected.
- For real deployment, use a backend/database, server-side booking validation, secure authentication/authorization, resident privacy controls, safe image upload and a maintenance notification workflow.
- Images and fonts load from Unsplash and Google Fonts and require an internet connection.
- The Bronze/Silver/Gold rating is a proposed project framework, not an official Energicentrum Gotland certification.

## QR page

The QR landing page is available at `#qr` and links directly to booking, repair instructions, reporting and hub information.
