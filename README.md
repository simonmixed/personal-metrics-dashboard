# Personal Metrics Dashboard

A React-based personal dashboard for tracking daily metrics including steps/miles walked and sleep data from Fitbit via Supabase.

## Features

### 📊 Step Tracker
- Half-arc gauge visualization with segmented progress indicator
- Manual input for miles walked
- 10-mile daily goal tracking
- Green fill indicates progress toward goal

### 😴 Sleep Metrics
Two separate widgets for sleep tracking:

1. **Hours Asleep**
   - Bar chart showing last 7 days of sleep
   - Today's value prominently displayed
   - Percentage change from previous day
   - Yellow dashed line showing overall average (all-time data)

2. **Time Awake**
   - Same visualization as Hours Asleep
   - Tracks awake time during sleep period
   - Pulls from `awake_minutes` field in Supabase

## Project Structure

```
personal-metrics-dashboard/
├── src/
│   ├── components/
│   │   ├── StepTracker.js         # Step tracking component
│   │   ├── StepTracker.css        # Step tracker styles
│   │   ├── SleepMetric.js         # Sleep metric component (reusable)
│   │   └── SleepMetric.css        # Sleep metric styles
│   ├── supabaseClient.js          # Supabase configuration
│   ├── App.js                     # Main app component
│   └── App.css                    # Global styles
├── .env                           # Environment variables (Supabase credentials)
└── package.json
```

## Setup & Installation

1. **Install dependencies (already done):**
   ```bash
   cd personal-metrics-dashboard
   npm install
   ```

2. **Environment variables:**
   The `.env` file is already configured with your Supabase credentials.

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Database Schema

The app expects the following Supabase table structure:

### `sleep_logs` table
- `date` (date): The date of the sleep record
- `total_minutes` (integer): Total minutes of sleep
- `awake_minutes` (integer): Minutes awake during sleep period

The app calculates:
- Hours asleep = (total_minutes - awake_minutes) / 60
- Time awake = awake_minutes / 60

## iOS Wrapper

To wrap this in a native iOS app:

1. **Build the React app for production:**
   ```bash
   npm run build
   ```

2. **Create a WKWebView in Swift:**
   - Load the `build` folder contents
   - Point the WebView to `index.html`
   - Enable JavaScript

3. **For live development:**
   - Point the WebView to `http://localhost:3000` during development
   - Use the production build for the final app

## Customization

### Change Step Goal
Edit `src/components/StepTracker.js` line 6:
```javascript
const goalMiles = 10; // Change this value
```

### Adjust Colors
- Step tracker green: `#5CC97A` in `StepTracker.js`
- Active bar blue: `#4285F4` in `SleepMetric.css`
- Average line yellow: `#FFC107` in `SleepMetric.css`

## Next Steps

You mentioned wanting to expand this dashboard. Here are some potential additions:
- Additional health metrics
- Data visualization improvements
- Local storage for step tracking persistence
- Historical data views
- Weekly/monthly summaries

---

## Create React App Default Info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

#### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm run build`
Builds the app for production to the `build` folder.
