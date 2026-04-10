# Monk Health - 75 Hard Tracker

A lightweight, web-based daily habit tracker built to monitor progress for the **75 Hard Challenge**. It features a daily task checklist, motivational quotes, streak counting, and Google Sheets integration to seamlessly log your daily achievements.

## Features

- **Simple Authentication:** Basic login gateway to keep your dashboard private.
- **Dashboard & Quotes:** Dynamic daily motivational quotes and current date formatting.
- **75 Hard Progress Tracker:** Automatically calculates and displays your current day out of 75 based on when you started.
- **Daily Checklist:** Track the following daily habits:
  - NoFap
  - Diet/Meals
  - Exercise
  - Study
  - Reading
- **Food Eaten Log:** Keep track of your daily meals, timings, sources, and hunger levels with dynamic pricing fields for takeaways/restaurants.
- **Google Sheets Sync:** Submits your daily logs directly to a Google Sheet using Google Apps Script.
- **Local Backup:** Saves your daily logs and calculates your streak using the browser's `localStorage`, acting as a fallback if the Google Sheets submission fails.

## Tech Stack

- HTML / CSS (Vanilla)
- JavaScript (Vanilla)
- Google Apps Script (Backend for Google Sheets integration)

## Getting Started

1. **Clone the repository** (or download the files):
   ```bash
   git clone <your-github-repo-url>
   ```
2. **Open the App:** Simply open `index.html` in any modern web browser. 

## Setting up Google Sheets Sync

To save data to Google Sheets:
1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script** and write a `doPost(e)` function to append the incoming JSON payload to your sheet.
3. Deploy the script as a **Web App** (Access: "Anyone").
4. Copy the Web App URL and replace the `APPS_SCRIPT_URL` variable at the top of `script.js`.

## License

Personal project - feel free to fork and modify for your own health tracking needs!
