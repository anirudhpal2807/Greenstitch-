# Quick Demo Script - GreenStitch Seat Booking (5 Min)

## Opening (20 sec)
Hi! Main aapko GreenStitch Seat Booking System dikhata hoon. Ye React app hai jisme 12 tasks implement kiye. Main step-by-step explain karta hoon.

## Problem & Solution (40 sec)
Assignment mein 8x10 seat grid tha - 80 seats total. Main tasks the:
- Pricing by rows (Premium ₹1000, Standard ₹750, Economy ₹500)
- Seat selection with validation
- Continuity rule - isolated seats prevent karna
- Real-time counters aur price calculation
- Booking with confirmation
- localStorage persistence

**Main approach:** React Hooks use kiye, pure JavaScript, no external libraries.

## Key Functions (1 min)

**1. Pricing Function:**
```javascript
getSeatPrice(row) {
  if (row 0-2) return 1000;  // Premium
  if (row 3-5) return 750;   // Standard  
  if (row 6-7) return 500;   // Economy
}
```

**2. Selection Handler:**
`handleSeatClick()` - AVAILABLE ↔ SELECTED toggle, BOOKED seats protected.

**3. Continuity Validation:**
`validateSeatContinuity()` - Left-right boundaries find karke isolated seats check karta hai.

**4. Count Functions:**
`getAvailableCount()`, `getSelectedCount()`, `getBookedCount()` - Real-time counts.

**5. Price Calculation:**
`calculateTotalPrice()` - Selected seats ka total based on row pricing.

**6. Persistence:**
`loadSeatsFromStorage()` / `saveSeatsToStorage()` - localStorage integration.

## Task Breakdown (2 min)

**Tasks 1-2:** Pricing setup aur selection toggle. Simple - constants define kiye, click handler banaya.

**Task 3:** Continuity rule - yeh tricky thi. Algorithm: left-right SELECTED/BOOKED seats find karo, phir beech mein AVAILABLE check karo. Agar isolated seat mila, error show karo.

**Tasks 4-5:** Counters aur pricing. Functions banaye jo seats array iterate karke counts calculate karte hain. Real-time updates React state se automatically.

**Tasks 6-7:** Booking limit (max 8 seats) aur confirmation modal. Validation dono jagah - selection time aur booking time. Modal mein seats count aur total price dikhaya.

**Tasks 8-9:** localStorage persistence aur control buttons. useEffect se auto-save/load. Clear Selection aur Reset All handlers.

**Tasks 10-12:** Code cleanup, safety checks, documentation. README aur TECHNICAL_NOTES files create kiye.

## Challenges Solved (30 sec)

**Issue 1:** Continuity rule complex thi.
**Fix:** Boundary detection algorithm - efficient aur accurate.

**Issue 2:** localStorage corruption se errors.
**Fix:** Validation har level par - initialization, mount, aur functions mein.

**Issue 3:** Real-time updates maintain karna.
**Fix:** React state management - automatic re-renders on state change.

## Live Demo (1 min)

Ab main features dikhata hoon:

1. **Seat Selection** - Click karke select/deselect
2. **Counters** - Available: 80, Selected: 0, Booked: 0 - real-time update
3. **Price** - Total automatically calculate ho raha hai
4. **Validation** - 8+ seats select karne par error
5. **Continuity** - Isolated seat select karne par error
6. **Booking** - Modal confirmation
7. **Persistence** - Refresh ke baad booked seats save

## Closing (30 sec)

**Summary:**
- 12 tasks complete
- Clean, maintainable code
- Full documentation
- Error handling
- Production-ready

**Key Learnings:**
- React Hooks mastery
- State management
- localStorage integration
- Complex validation logic
- User experience focus

Thank you! Questions?

---

## Speaking Tips:
- Natural pace - don't rush
- Pause after key points
- Show code when explaining functions
- Demonstrate features live
- Be confident!

**Total: ~5 minutes**

