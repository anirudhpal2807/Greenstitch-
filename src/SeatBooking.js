import React, { useState } from 'react';
import './SeatBooking.css';

const SEAT_STATUS = {
    AVAILABLE: 'available',
    SELECTED: 'selected',
    BOOKED: 'booked'
};

const SEAT_PRICES = {
    PREMIUM: 1000,  // Rows A-C (0-2)
    STANDARD: 750,  // Rows D-F (3-5)
    ECONOMY: 500    // Rows G-H (6-7)
};

const MAX_SEATS_PER_BOOKING = 8;

const SeatBooking = () => {
    const ROWS = 8;
    const SEATS_PER_ROW = 10;

    const initializeSeats = () => {
        const seats = [];
        for (let row = 0; row < ROWS; row++) {
            const rowSeats = [];
            for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
                rowSeats.push({
                    id: `${row}-${seat}`,
                    row: row,
                    seat: seat,
                    status: SEAT_STATUS.AVAILABLE
                });
            }
            seats.push(rowSeats);
        }
        return seats;
    };

    const [seats, setSeats] = useState(initializeSeats());
    const [errorMessage, setErrorMessage] = useState('');

    // TODO: Implement all required functionality below

    /**
     * Get seat price based on row index
     * @param {number} row - Row index (0-based)
     * @returns {number} Price for the seat in the given row
     */
    const getSeatPrice = (row) => {
        if (row >= 0 && row <= 2) {
            // Rows A-C (0-2) → Premium
            return SEAT_PRICES.PREMIUM;
        } else if (row >= 3 && row <= 5) {
            // Rows D-F (3-5) → Standard
            return SEAT_PRICES.STANDARD;
        } else if (row >= 6 && row <= 7) {
            // Rows G-H (6-7) → Economy
            return SEAT_PRICES.ECONOMY;
        }
        return 0; // Default fallback
    };
    /**
     * Get count of available seats
     * @returns {number} Count of seats with AVAILABLE status
     */
    const getAvailableCount = () => {
        let count = 0;
        seats.forEach(row => {
            row.forEach(seat => {
                if (seat.status === SEAT_STATUS.AVAILABLE) {
                    count++;
                }
            });
        });
        return count;
    };

    /**
     * Get count of selected seats
     * @returns {number} Count of seats with SELECTED status
     */
    const getSelectedCount = () => {
        let count = 0;
        seats.forEach(row => {
            row.forEach(seat => {
                if (seat.status === SEAT_STATUS.SELECTED) {
                    count++;
                }
            });
        });
        return count;
    };

    /**
     * Get count of booked seats
     * @returns {number} Count of seats with BOOKED status
     */
    const getBookedCount = () => {
        let count = 0;
        seats.forEach(row => {
            row.forEach(seat => {
                if (seat.status === SEAT_STATUS.BOOKED) {
                    count++;
                }
            });
        });
        return count;
    };
    /**
     * Calculate total price of all selected seats
     * Only SELECTED seats are counted, pricing is based on row type
     * @returns {number} Total price of all selected seats
     */
    const calculateTotalPrice = () => {
        let total = 0;
        seats.forEach((row, rowIndex) => {
            row.forEach(seat => {
                if (seat.status === SEAT_STATUS.SELECTED) {
                    // Get price based on row and add to total
                    total += getSeatPrice(rowIndex);
                }
            });
        });
        return total;
    };

    /**
     * Check if selecting a seat would break the continuity rule
     * Rule: Cannot have AVAILABLE seat between two SELECTED/BOOKED seats
     * Exception: Gap is allowed if middle seat is BOOKED
     * @param {number} row - Row index (0-based)
     * @param {number} seat - Seat index within the row (0-based)
     * @returns {string|null} Error message if rule would be broken, null otherwise
     */
    const validateSeatContinuity = (row, seat) => {
        const rowSeats = seats[row];
        const currentStatus = rowSeats[seat].status;

        // Only validate when selecting (AVAILABLE → SELECTED)
        // Deselecting (SELECTED → AVAILABLE) is always allowed
        if (currentStatus !== SEAT_STATUS.AVAILABLE) {
            return null;
        }

        // Find the leftmost SELECTED/BOOKED seat to the left
        let leftBoundary = -1;
        for (let i = seat - 1; i >= 0; i--) {
            const status = rowSeats[i].status;
            if (status === SEAT_STATUS.SELECTED || status === SEAT_STATUS.BOOKED) {
                leftBoundary = i;
                break;
            }
        }

        // Find the rightmost SELECTED/BOOKED seat to the right
        let rightBoundary = rowSeats.length;
        for (let i = seat + 1; i < rowSeats.length; i++) {
            const status = rowSeats[i].status;
            if (status === SEAT_STATUS.SELECTED || status === SEAT_STATUS.BOOKED) {
                rightBoundary = i;
                break;
            }
        }

        // If we have SELECTED/BOOKED seats on both sides, check for isolated AVAILABLE seats
        if (leftBoundary !== -1 && rightBoundary !== rowSeats.length) {
            // Check all seats between left and right boundaries (excluding the seat we're selecting)
            for (let i = leftBoundary + 1; i < rightBoundary; i++) {
                if (i !== seat && rowSeats[i].status === SEAT_STATUS.AVAILABLE) {
                    // Found an AVAILABLE seat that would be isolated between SELECTED/BOOKED seats
                    // Pattern: [SELECTED/BOOKED] ... [AVAILABLE] ... [SELECTED] ... [AVAILABLE] ... [SELECTED/BOOKED]
                    // This violates the rule
                    return 'Cannot leave an available seat isolated between selected/booked seats';
                }
            }
        }

        return null; // Validation passed
    };

    /**
     * Handle seat click to toggle between AVAILABLE and SELECTED
     * BOOKED seats cannot be changed
     * Validates continuity rule before allowing selection
     * @param {number} row - Row index (0-based)
     * @param {number} seat - Seat index within the row (0-based)
     */
    const handleSeatClick = (row, seat) => {
        // Clear any previous error messages
        setErrorMessage('');

        // Do not allow changes to booked seats
        if (seats[row][seat].status === SEAT_STATUS.BOOKED) {
            return;
        }

        // If deselecting (SELECTED → AVAILABLE), allow it
        if (seats[row][seat].status === SEAT_STATUS.SELECTED) {
            // Create a new seats array without mutating the existing state
            const newSeats = seats.map((rowSeats, rowIdx) => {
                if (rowIdx !== row) {
                    return rowSeats; // Return unchanged rows
                }
                // For the clicked row, create a new array with updated seat
                return rowSeats.map((seatItem, seatIdx) => {
                    if (seatIdx !== seat) {
                        return seatItem; // Return unchanged seats
                    }
                    // Toggle status: SELECTED → AVAILABLE
                    return {
                        ...seatItem,
                        status: SEAT_STATUS.AVAILABLE
                    };
                });
            });

            setSeats(newSeats);
            return;
        }

        // If selecting (AVAILABLE → SELECTED), validate continuity rule
        if (seats[row][seat].status === SEAT_STATUS.AVAILABLE) {
            const validationError = validateSeatContinuity(row, seat);
            if (validationError) {
                setErrorMessage(validationError);
                return; // Don't allow selection
            }

            // Create a new seats array without mutating the existing state
            const newSeats = seats.map((rowSeats, rowIdx) => {
                if (rowIdx !== row) {
                    return rowSeats; // Return unchanged rows
                }
                // For the clicked row, create a new array with updated seat
                return rowSeats.map((seatItem, seatIdx) => {
                    if (seatIdx !== seat) {
                        return seatItem; // Return unchanged seats
                    }
                    // Toggle status: AVAILABLE → SELECTED
                    return {
                        ...seatItem,
                        status: SEAT_STATUS.SELECTED
                    };
                });
            });

            setSeats(newSeats);
        }
    };

    const handleBookSeats = () => {
        // TODO: Implement booking logic
    };

    const handleClearSelection = () => {
        // TODO: Implement clear selection logic
    };

    const handleReset = () => {
        // TODO: Implement reset logic
    };

    return (
        <div
            className="seat-booking-container"
            id="seat-booking-container"
            data-testid="seat-booking-container"
        >
            <h1 data-testid="app-title">GreenStitch Seat Booking System</h1>

            {errorMessage && (
                <div className="error-message" data-testid="error-message" style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '12px',
                    margin: '16px auto',
                    borderRadius: '4px',
                    maxWidth: '600px',
                    textAlign: 'center',
                    border: '1px solid #ef5350'
                }}>
                    {errorMessage}
                </div>
            )}

            <div className="info-panel" data-testid="info-panel">
                <div className="info-item" data-testid="available-info">
                    <span className="info-label">Available:</span>
                    <span className="info-value" data-testid="available-count">
                        {getAvailableCount()}
                    </span>
                </div>
                <div className="info-item" data-testid="selected-info">
                    <span className="info-label">Selected:</span>
                    <span className="info-value" data-testid="selected-count">
                        {getSelectedCount()}
                    </span>
                </div>
                <div className="info-item" data-testid="booked-info">
                    <span className="info-label">Booked:</span>
                    <span className="info-value" data-testid="booked-count">
                        {getBookedCount()}
                    </span>
                </div>
            </div>

            <div className="legend" data-testid="legend">
                <div className="legend-item" data-testid="legend-available">
                    <div className="seat-demo available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item" data-testid="legend-selected">
                    <div className="seat-demo selected"></div>
                    <span>Selected</span>
                </div>
                <div className="legend-item" data-testid="legend-booked">
                    <div className="seat-demo booked"></div>
                    <span>Booked</span>
                </div>
            </div>

            <div className="seat-grid" data-testid="seat-grid">
                {seats.map((row, rowIndex) => {
                    const rowLabel = String.fromCharCode(65 + rowIndex);
                    return (
                        <div
                            key={rowIndex}
                            className="seat-row"
                            data-testid={`seat-row-${rowLabel}`}
                            data-row-index={rowIndex}
                        >
                            <div
                                className="row-label"
                                data-testid={`row-label-${rowLabel}`}
                            >
                                {rowLabel}
                            </div>
                            {row.map((seat, seatIndex) => (
                                <div
                                    key={seat.id}
                                    id={`seat-${seat.id}`}
                                    className={`seat ${seat.status}`}
                                    data-testid="seat"
                                    data-seat-id={seat.id}
                                    data-seat-row={rowLabel}
                                    data-seat-number={seatIndex + 1}
                                    data-seat-status={seat.status}
                                    onClick={() => handleSeatClick(rowIndex, seatIndex)}
                                >
                                    {seatIndex + 1}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="pricing-info" data-testid="pricing-info">
                <p data-testid="selected-total">
                    Selected Seats Total:{' '}
                    <strong data-testid="total-price">₹{calculateTotalPrice()}</strong>
                </p>
                <p className="price-note" data-testid="price-note">
                    Premium (A-C): ₹1000 | Standard (D-F): ₹750 | Economy (G-H): ₹500
                </p>
            </div>

            <div className="control-panel" data-testid="control-panel">
                <button
                    className="btn btn-book"
                    id="book-seats-button"
                    data-testid="book-seats-button"
                    onClick={handleBookSeats}
                    disabled={getSelectedCount() === 0}
                >
                    Book Selected Seats ({getSelectedCount()})
                </button>
                <button
                    className="btn btn-clear"
                    id="clear-selection-button"
                    data-testid="clear-selection-button"
                    onClick={handleClearSelection}
                    disabled={getSelectedCount() === 0}
                >
                    Clear Selection
                </button>
                <button
                    className="btn btn-reset"
                    id="reset-all-button"
                    data-testid="reset-all-button"
                    onClick={handleReset}
                >
                    Reset All
                </button>
            </div>
        </div>
    );
};

export default SeatBooking;
