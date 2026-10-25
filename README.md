# Neighbourhood Bike Hub

A responsive, static demo website for a shared neighbourhood bike service. It uses plain HTML, CSS and JavaScript, so no build tools or package installation are needed.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

## Publish with GitHub Pages (recommended: automatic deployment)

1. Create a new repository on GitHub.
2. Upload **all files and folders** from this project, including the hidden `.github` folder and `.nojekyll`.
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment settings, select **GitHub Actions** as the source.
5. Make sure the default branch is `main`, then push/commit the files.
6. Open the **Actions** tab and wait for “Deploy Neighbourhood Bike Hub to GitHub Pages” to finish successfully.
7. The public website address will be shown in the workflow run and under **Settings → Pages**.

The included workflow deploys the repository root whenever changes are pushed to `main`. If you use a different default branch, edit `.github/workflows/pages.yml` to match it.

## What is included

- Responsive home page
- Standard bike, e-bike and cargo-bike example pricing
- First five confirmed bookings free per resident code
- Booking date, time, duration and basic overlap checks
- Booking confirmation and cancellation
- Resident booking lookup
- Repair-station equipment list and issue-report form
- Admin demo with fleet status, bookings, reports and reset
- Bronze / Silver / Gold housing-provider star-system explanation
- Local browser storage for demo data
- GitHub Pages deployment workflow

## Example prices

- Standard bike: 20 SEK / 2 hours
- E-bike: 60 SEK / 2 hours
- Cargo bike: 80 SEK / 2 hours

These are example prices for a concept demo, not confirmed local rates.

## Important: demo, not a production service

This is a **front-end prototype**. Bookings and reports are stored only in the current browser on the current device. GitHub Pages will publish the website files, but it will not provide a shared database or server.

The demo does **not** verify resident identity, secure the admin view, take payments, send email/SMS notifications, or control physical bike locks. Because the admin demo is not protected, do not enter real personal or sensitive information and do not treat it as a real booking service.

Before launching for real residents, add a backend/database, secure authentication and role-based permissions, input validation, privacy and retention controls, payment integration if needed, notifications, and a secure bike-access process.
