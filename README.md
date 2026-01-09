# GreenStitch Seat Booking System

A modern, interactive seat booking application built with React. This system allows users to select, book, and manage seats with real-time pricing, validation, and persistence.

## Overview

The GreenStitch Seat Booking System is a frontend application that provides an intuitive interface for booking seats in a venue. The system features an 8x10 seat grid (8 rows, 10 seats per row) with dynamic pricing, validation rules, and local storage persistence.

## Features

### Core Functionality
- **Interactive Seat Selection**: Click to select/deselect seats with visual feedback
- **Real-time Pricing**: Dynamic price calculation based on seat row
- **Live Counters**: Real-time display of available, selected, and booked seats
- **Booking Confirmation**: Modal confirmation before finalizing bookings
- **Data Persistence**: Booked seats are saved to localStorage and persist across page refreshes

### Validation & Rules
- **Maximum Booking Limit**: Users can select up to 8 seats at a time
- **Seat Continuity Rule**: Prevents leaving isolated available seats between selected/booked seats
- **Booking Protection**: Booked seats cannot be modified or deselected

### User Controls
- **Clear Selection**: Deselect all selected seats (booked seats remain unchanged)
- **Reset All**: Complete system reset - clears all selections, bookings, and localStorage

## Pricing

Seat pricing is based on row location:

| Row Range | Category | Price per Seat |
|-----------|----------|---------------|
| A - C     | Premium  | ₹1,000        |
| D - F     | Standard | ₹750          |
| G - H     | Economy  | ₹500          |

### Pricing Examples
- 2 Premium seats (Row A): ₹2,000
- 3 Standard seats (Row D): ₹2,250
- 1 Economy seat (Row G): ₹500
- Mixed booking (1 Premium + 2 Standard): ₹2,500

## Continuity Rule

The system enforces a **Seat Continuity Rule** to prevent isolated available seats:

### Rule
**Not Allowed**: An AVAILABLE seat cannot be left between two SELECTED or BOOKED seats.

**Pattern**: `[SELECTED/BOOKED] [AVAILABLE] [SELECTED/BOOKED]` ❌

### Exception
Gaps are allowed if the middle seat is BOOKED:
**Pattern**: `[SELECTED/BOOKED] [BOOKED] [SELECTED/BOOKED]` ✅

### Examples

**Valid Selections:**
- `[AVAILABLE] [SELECTED] [SELECTED] [AVAILABLE]` ✅
- `[SELECTED] [BOOKED] [SELECTED]` ✅
- `[AVAILABLE] [AVAILABLE] [SELECTED]` ✅

**Invalid Selections:**
- `[SELECTED] [AVAILABLE] [SELECTED]` ❌
- `[BOOKED] [AVAILABLE] [SELECTED]` ❌
- `[SELECTED] [AVAILABLE] [BOOKED]` ❌

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd GreenStitch-Frontend-Assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - The application will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to the URL manually

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Run Tests

```bash
npm test
```

## Usage Guide

### Selecting Seats
1. Click on any **Available** (green) seat to select it
2. Selected seats turn **blue**
3. Click again to deselect
4. Maximum 8 seats can be selected at once

### Booking Seats
1. Select your desired seats
2. Review the total price displayed
3. Click **"Book Selected Seats"** button
4. Confirm the booking in the modal dialog
5. Booked seats turn **red** and cannot be changed

### Clearing Selection
- Click **"Clear Selection"** to deselect all selected seats
- Booked seats remain unchanged

### Resetting System
- Click **"Reset All"** to completely reset the system
- All seats return to Available status
- All bookings are cleared
- localStorage is cleared

## Technical Stack

- **React** 18.2.0
- **React DOM** 18.2.0
- **React Scripts** 5.0.1
- **CSS3** for styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Project Structure

```
GreenStitch-Frontend-Assessment/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── App.js
│   ├── SeatBooking.js      # Main component
│   ├── SeatBooking.css     # Component styles
│   ├── index.js            # Entry point
│   └── index.css            # Global styles
├── package.json
└── README.md
```

## License

This project is part of the GreenStitch Frontend Technical Assessment.

