# Technical Notes - GreenStitch Seat Booking System

## Architecture Overview

The application is built as a single-page React application using functional components and React Hooks. The main component `SeatBooking` manages all state and business logic.

## State Management

### State Variables
- **`seats`**: 2D array representing the seat grid (8 rows × 10 seats)
  - Each seat object: `{ id, row, seat, status }`
  - Status values: `'available'`, `'selected'`, `'booked'`
- **`errorMessage`**: String for displaying validation errors
- **`showConfirmModal`**: Boolean to control booking confirmation modal

### State Initialization
- On mount: Attempts to load seats from localStorage
- Fallback: Initializes with all seats as AVAILABLE if no stored data exists

## Data Persistence

### localStorage Implementation
- **Key**: `'greenstitch_booked_seats'`
- **Storage**: Complete seats array (JSON stringified)
- **Sync**: Automatic save on every state change via `useEffect`
- **Load**: On component mount via `useState` initializer

### Persistence Strategy
- Saves entire seat state (not just booked seats)
- Ensures all seat statuses are preserved
- Handles localStorage errors gracefully with try-catch blocks

## Core Functions

### Seat Management
1. **`initializeSeats()`**: Creates default seat grid with all AVAILABLE
2. **`getSeatPrice(row)`**: Returns price based on row index
   - Rows 0-2: Premium (₹1000)
   - Rows 3-5: Standard (₹750)
   - Rows 6-7: Economy (₹500)

### Count Functions
- **`getAvailableCount()`**: Counts seats with AVAILABLE status
- **`getSelectedCount()`**: Counts seats with SELECTED status
- **`getBookedCount()`**: Counts seats with BOOKED status
- **`calculateTotalPrice()`**: Sums prices of all SELECTED seats

### Validation Functions
- **`validateSeatContinuity(row, seat)`**: 
  - Checks if selecting a seat would violate continuity rule
  - Returns error message or null
  - Only validates when selecting (AVAILABLE → SELECTED)

### Event Handlers
- **`handleSeatClick(row, seat)`**: 
  - Toggles seat selection
  - Validates booking limit (max 8 seats)
  - Validates continuity rule
  - Prevents changes to BOOKED seats

- **`handleBookSeats()`**: 
  - Validates booking limit
  - Shows confirmation modal

- **`confirmBooking()`**: 
  - Converts SELECTED → BOOKED
  - Closes modal

- **`handleClearSelection()`**: 
  - Converts SELECTED → AVAILABLE
  - Preserves BOOKED seats

- **`handleReset()`**: 
  - Resets all seats to AVAILABLE
  - Clears localStorage
  - Resets all state

## Validation Rules

### Booking Limit Validation
- **Location**: `handleSeatClick` and `handleBookSeats`
- **Rule**: Maximum 8 seats can be selected
- **Error**: "Maximum 8 seats can be selected at a time"

### Continuity Rule Validation
- **Location**: `validateSeatContinuity` function
- **Rule**: Cannot leave AVAILABLE seat between SELECTED/BOOKED seats
- **Exception**: Gap allowed if middle seat is BOOKED
- **Error**: "Cannot leave an available seat isolated between selected/booked seats"

### Implementation Details
```javascript
// Continuity check algorithm:
1. Find leftmost SELECTED/BOOKED seat to the left
2. Find rightmost SELECTED/BOOKED seat to the right
3. If both exist, check for AVAILABLE seats between them
4. If AVAILABLE seat found → violation
```

## UI Components

### Seat Grid
- 8 rows (A-H) × 10 seats per row
- Visual states: Available (green), Selected (blue), Booked (red)
- Click handlers on each seat

### Info Panel
- Real-time counters for Available, Selected, Booked seats
- Updates automatically on state changes

### Pricing Info
- Displays total price of selected seats
- Shows pricing breakdown by row category

### Control Panel
- **Book Selected Seats**: Opens confirmation modal
- **Clear Selection**: Deselects all selected seats
- **Reset All**: Complete system reset

### Confirmation Modal
- Shows number of seats and total price
- Confirm/Cancel buttons
- Overlay click to close

## Error Handling

### localStorage Errors
- Try-catch blocks around all localStorage operations
- Console error logging for debugging
- Graceful fallback to default state

### Validation Errors
- Displayed in error message banner
- Cleared on next user action
- Non-blocking (doesn't crash application)

## Performance Considerations

### State Updates
- Immutable state updates using `map` functions
- No direct state mutation
- Efficient re-renders via React's reconciliation

### localStorage Sync
- Automatic save on every state change
- Debouncing not implemented (acceptable for this use case)
- JSON serialization overhead is minimal

## Code Organization

### File Structure
- **SeatBooking.js**: Main component (600+ lines)
  - Constants at top
  - Helper functions (outside component)
  - Component definition
  - Event handlers
  - JSX return

### Function Placement
- **Outside Component**: Pure utility functions
  - `initializeSeats()`
  - `loadSeatsFromStorage()`
  - `saveSeatsToStorage()`
- **Inside Component**: State-dependent functions
  - All handlers
  - Count functions
  - Validation functions

## Testing Considerations

### Testable Functions
- Pure functions (outside component) are easily testable
- State-dependent functions require React Testing Library
- localStorage operations can be mocked

### Test Scenarios
1. Seat selection/deselection
2. Booking limit validation
3. Continuity rule validation
4. Price calculation
5. Count functions
6. localStorage persistence
7. Reset functionality

## Known Limitations

1. **No Backend Integration**: All data stored locally
2. **No User Authentication**: Single-user system
3. **No Booking History**: Only current state persisted
4. **No Multi-device Sync**: localStorage is browser-specific
5. **No Undo/Redo**: No action history

## Future Enhancements

1. Backend API integration
2. User authentication
3. Booking history
4. Seat recommendations
5. Advanced filtering
6. Responsive design improvements
7. Accessibility enhancements (ARIA labels, keyboard navigation)

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage API required
- React 18+ features used

## Dependencies

- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **react-scripts**: 5.0.1

No external UI libraries used - pure React and CSS.

## Build Configuration

- **Create React App** boilerplate
- **ESLint** configuration included
- **Babel** transpilation
- **Webpack** bundling

## Deployment Notes

- Build output: `build/` folder
- Static files ready for deployment
- No server-side rendering required
- Can be deployed to:
  - Netlify
  - Vercel
  - GitHub Pages
  - Any static hosting service

