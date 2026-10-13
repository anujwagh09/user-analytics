# User Analytics Application

A small full-stack app that tracks user interactions on a webpage and shows them in a dashboard.

- A **JavaScript tracking script** records `page_view` and `click` events.
- A **Node.js + Express API** receives and stores the events in **MongoDB**.
- A **React dashboard** shows every session, each visitor's journey, and a click heatmap per page.

## Live demo

> Fill these in after deploying. If you did not host the app, delete this section.

- Dashboard: `<dashboard link>`
- Backend / demo page: `<backend link>/demo/index.html`

Note: if the backend is on a free hosting tier, the first request after a period of inactivity can take 30 to 60 seconds.

## Screenshots
<img width="1722" height="793" alt="Screenshot 2026-10-13 112113" src="https://github.com/user-attachments/assets/0800ab89-8e75-4763-b4db-6fe7b30fc60b" />
<img width="1482" height="872" alt="Screenshot 2026-10-13 112123" src="https://github.com/user-attachments/assets/e9be3c84-4eea-4727-8a5c-c5bbec34befd" />
<img width="1397" height="932" alt="Screenshot 2026-10-13 112137" src="https://github.com/user-attachments/assets/314d3e02-fa52-4f92-875e-a3911e1b2f81" />
<img width="1285" height="891" alt="Screenshot 2026-10-13 112156" src="https://github.com/user-attachments/assets/ca4827e2-c5fc-4f10-86a4-2ec6515b7c95" />
<img width="1250" height="880" alt="image" src="https://github.com/user-attachments/assets/57cbce18-4bf7-474b-9555-994a584593d1" />

<!-- Add screenshots here, for example:
![Sessions view](docs/sessions.png)
![Heatmap view](docs/heatmap.png)
-->

## Features

- Tracking script that can be added to any page with one `<script>` tag
- Tracks `page_view` and `click` events
- Each event carries: `session_id`, event type, page URL, timestamp, and click x/y coordinates (clicks only)
- Session id stored in the browser's `localStorage`
- REST API to store events, list sessions with event counts, fetch a session's events, and fetch click data for a page
- Dashboard with:
  - **Sessions view**: all sessions with total events, search, and summary cards. Clicking a session shows its ordered user journey.
  - **Heatmap view**: choose a page URL and see click positions as dots, with dot size and intensity controls
  - Manual refresh and optional auto-refresh (every 5 seconds)

## Tech stack

| Part | Technology |
|---|---|
| Tracking script | Vanilla JavaScript (no dependencies) |
| Backend | Node.js, Express, Mongoose, cors, dotenv |
| Database | MongoDB |
| Dashboard | React (Vite), Tailwind CSS (CDN build) |

## Project structure

```
user-analytics/
├── backend/
│   ├── models/Event.js      # Mongoose schema for events
│   ├── routes/events.js     # API endpoints
│   ├── server.js            # Express app, MongoDB connection, serves tracker and demo
│   └── package.json
├── tracker/
│   └── tracker.js           # The script you add to a webpage
├── demo/
│   ├── index.html           # Demo page 1
│   └── about.html           # Demo page 2
├── dashboard/               # React dashboard (Vite)
│   ├── index.html
│   └── src/
│       ├── App.jsx          # Tabs, refresh, auto-refresh
│       ├── Sessions.jsx     # Sessions list and user journey
│       ├── Heatmap.jsx      # Click heatmap
│       └── api.js           # Calls to the backend API
└── README.md
```

## Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally on the default port (`mongodb://127.0.0.1:27017`), or a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend/`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/user_analytics
```

Start the server:

```bash
node server.js
```

You should see `MongoDB connected` and `Server running on http://localhost:5000`.

### 2. Dashboard

In a second terminal:

```bash
cd dashboard
npm install
npm run dev
```

Open the address it prints (normally http://localhost:5173).

By default the dashboard calls `http://localhost:5000`. To point it somewhere else, create `dashboard/.env` with:

```
VITE_API_URL=https://your-backend-url
```

### 3. Generate some data

1. Open http://localhost:5000/demo/index.html
2. Click around, then open the **About** page and click there too
3. Open the dashboard and check the **Sessions** and **Heatmap** tabs (use the Refresh button, or turn on Auto-refresh)

To simulate another visitor, open the demo page in an incognito window.

## Using the tracker on any page

Add one line to the page:

```html
<script src="http://localhost:5000/tracker.js"></script>
```

The script sends events to the same server it was loaded from.

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/events` | Store one event |
| GET | `/sessions` | List sessions with event counts |
| GET | `/sessions/:id/events` | All events of one session, ordered by time |
| GET | `/pages` | Distinct page URLs that have events |
| GET | `/heatmap?url=<page url>` | Click positions for one page |

### Event format

```json
{
  "session_id": "s_mgxyz123abc",
  "type": "click",
  "page_url": "http://localhost:5000/demo/index.html",
  "timestamp": "2026-10-13T05:30:00.000Z",
  "x": 120,
  "y": 340,
  "page_width": 1200,
  "page_height": 1500
}
```

- `type` is `page_view` or `click`
- `x`, `y`, `page_width` and `page_height` are only sent for clicks
- Invalid events (missing fields, unknown type, bad timestamp) are rejected with HTTP 400

### Example: sessions response

```json
[
  {
    "session_id": "s_mgxyz123abc",
    "total_events": 14,
    "clicks": 9,
    "first_seen": "2026-10-13T05:30:00.000Z",
    "last_seen": "2026-10-13T05:34:12.000Z"
  }
]
```

## How it works

1. The tracker creates a `session_id` the first time a browser loads a tracked page and keeps it in `localStorage`, so the same visitor keeps one session across pages.
2. On load it sends a `page_view`. On every click it sends a `click` with the click position.
3. The backend validates each event and saves it as a document in the `events` collection.
4. The dashboard reads from the API. Sessions are built with a MongoDB aggregation that groups events by `session_id`. The heatmap fetches all clicks for the selected page.
5. Heatmap dots are drawn at `x / page_width` and `y / page_height` as percentages, so the picture scales to any screen size.

## Database design

Events are stored in a single `events` collection:

| Field | Type | Notes |
|---|---|---|
| `session_id` | String | Required |
| `type` | String | `page_view` or `click` |
| `page_url` | String | Origin + path |
| `timestamp` | Date | Required |
| `x`, `y` | Number | Click only. Position on the full page |
| `page_width`, `page_height` | Number | Click only. Used to scale the heatmap |

Indexes:

- `{ session_id: 1, timestamp: 1 }` for fetching a session's events in order
- `{ type: 1, page_url: 1 }` for fetching a page's clicks

## Assumptions and trade-offs

- **Session definition:** a session is one browser's `localStorage` id. It does not expire after inactivity, and clearing browser storage starts a new session.
- **Page URL:** stored as origin + path, so query strings and hashes do not split one page into many.
- **Click coordinates:** stored as page coordinates (`pageX` / `pageY`) together with the page's width and height, so the heatmap can scale. Pages whose layout changes on small screens will show some drift in dot positions.
- **Heatmap background:** dots are drawn on a plain grid. The heatmap shows where people clicked, but not which element was under the click.
- **Timestamps:** taken from the visitor's browser clock. A production version would also store a server-side received time.
- **Single-page apps:** the tracker records a `page_view` when a page loads, not on in-app route changes.
- **Sending events:** events are sent one at a time for simplicity. Batching would reduce requests at higher traffic.
- **Security:** there is no authentication on the API or the dashboard, and CORS is open so the tracker works on any site. A real product would add API keys, rate limiting and a protected dashboard.
- **Tailwind:** loaded from its CDN script for simplicity. A production build would install it as a build dependency.
- **Live updates:** the dashboard polls when auto-refresh is on, instead of using WebSockets.

## Possible improvements

- Overlay heatmap dots on a screenshot of the page and record which element was clicked
- Add scroll and mouse-move tracking
- Session timeout (for example, 30 minutes of inactivity)
- Batch events and retry failed sends
- API keys per site, rate limiting, and dashboard login
- Date range filters and charts (events over time)
- Automated tests for the API

## Deploying (optional)

- **Database:** MongoDB Atlas free cluster. Allow network access and use its connection string as `MONGO_URI`.
- **Backend:** any Node host (for example Render). Root directory `backend`, build command `npm install`, start command `node server.js`, environment variable `MONGO_URI`.
- **Dashboard:** any static host (for example Vercel). Root directory `dashboard`, environment variable `VITE_API_URL` set to the backend URL (no trailing slash).
- Because the backend serves `tracker.js` and the demo pages, the hosted demo page works at `<backend url>/demo/index.html`.
