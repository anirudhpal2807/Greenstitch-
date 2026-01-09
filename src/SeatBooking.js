import React, { useState, useEffect } from 'react';
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
const STORAGE_KEY = 'greenstitch_booked_seats';
const ROWS = 8;
const SEATS_PER_ROW = 10;

/**
 * Initialize seats with default AVAILABLE status
 * @returns {Array} Initial seats array
 */
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

/**
 * Load seats from localStorage
 * @returns {Array|null} Seats array if found in localStorage, null otherwise
 */
const loadSeatsFromStorage = () => {
    try {
        const storedSeats = localStorage.getItem(STORAGE_KEY);
        if (storedSeats) {
            return JSON.parse(storedSeats);
        }
    } catch (error) {
        console.error('Error loading seats from localStorage:', error);
    }
    return null;
};

/**
 * Save seats to localStorage
 * Persists all seat statuses (including BOOKED) across refreshes
 * @param {Array} seatsToSave - Seats array to save
 */
const saveSeatsToStorage = (seatsToSave) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seatsToSave));
    } catch (error) {
        console.error('Error saving seats to localStorage:', error);
    }
};

const SeatBooking = () => {

    // Initialize state - try to load from localStorage first, otherwise use default
    const [seats, setSeats] = useState(() => {
        const storedSeats = loadSeatsFromStorage();
        // Validate stored seats structure before using
        if (storedSeats && Array.isArray(storedSeats) && storedSeats.length === ROWS) {
            // Check if each row is a valid array
            const isValid = storedSeats.every(row => Array.isArray(row) && row.length === SEATS_PER_ROW);
            if (isValid) {
                return storedSeats;
            }
        }
        // Fallback to default initialization if stored data is invalid
        return initializeSeats();
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Validate and fix seats structure on mount
    useEffect(() => {
        if (!seats || !Array.isArray(seats) || seats.length !== ROWS) {
            setSeats(initializeSeats());
            return;
        }
        // Check if each row is valid
        const isValid = seats.every(row => Array.isArray(row) && row.length === SEATS_PER_ROW);
        if (!isValid) {
            setSeats(initializeSeats());
        }
    }, []); // Run only once on mount

    // Save seats to localStorage whenever seats state changes
    // This ensures BOOKED seats are persisted across page refreshes
    useEffect(() => {
        if (seats && Array.isArray(seats)) {
            saveSeatsToStorage(seats);
        }
    }, [seats]); // Run whenever seats state changes

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
        if (!seats || !Array.isArray(seats)) return 0;
        let count = 0;
        seats.forEach(row => {
            if (Array.isArray(row)) {
                row.forEach(seat => {
                    if (seat && seat.status === SEAT_STATUS.AVAILABLE) {
                        count++;
                    }
                });
            }
        });
        return count;
    };

    /**
     * Get count of selected seats
     * @returns {number} Count of seats with SELECTED status
     */
    const getSelectedCount = () => {
        if (!seats || !Array.isArray(seats)) return 0;
        let count = 0;
        seats.forEach(row => {
            if (Array.isArray(row)) {
                row.forEach(seat => {
                    if (seat && seat.status === SEAT_STATUS.SELECTED) {
                        count++;
                    }
                });
            }
        });
        return count;
    };

    /**
     * Get count of booked seats
     * @returns {number} Count of seats with BOOKED status
     */
    const getBookedCount = () => {
        if (!seats || !Array.isArray(seats)) return 0;
        let count = 0;
        seats.forEach(row => {
            if (Array.isArray(row)) {
                row.forEach(seat => {
                    if (seat && seat.status === SEAT_STATUS.BOOKED) {
                        count++;
                    }
                });
            }
        });
        return count;
    };
    /**
     * Calculate total price of all selected seats
     * Only SELECTED seats are counted, pricing is based on row type
     * @returns {number} Total price of all selected seats
     */
    const calculateTotalPrice = () => {
        if (!seats || !Array.isArray(seats)) return 0;
        let total = 0;
        seats.forEach((row, rowIndex) => {
            if (Array.isArray(row)) {
                row.forEach(seat => {
                    if (seat && seat.status === SEAT_STATUS.SELECTED) {
                        // Get price based on row and add to total
                        total += getSeatPrice(rowIndex);
                    }
                });
            }
        });
        return total;
    };

    /**
     * Check if selecting a seat would break the continuity rule
     * Rule: Cannot leave AVAILABLE seat isolated between SELECTED/BOOKED seats
     * Pattern NOT allowed: [Selected/Booked] [Available] [Selected/Booked]
     * Exception: Gaps are allowed ONLY if caused by BOOKED seats (not AVAILABLE)
     * @param {number} row - Row index (0-based)
     * @param {number} seat - Seat index within the row (0-based)
     * @returns {string|null} Error message if rule would be broken, null otherwise
     */
    const validateSeatContinuity = (row, seat) => {
        // Safety check: ensure seats array is valid
        if (!seats || !Array.isArray(seats) || !seats[row] || !Array.isArray(seats[row]) || !seats[row][seat]) {
            return null;
        }

        const rowSeats = seats[row];
        const currentStatus = rowSeats[seat].status;

        // Only validate when selecting (AVAILABLE → SELECTED)
        // Deselecting (SELECTED → AVAILABLE) is always allowed
        if (currentStatus !== SEAT_STATUS.AVAILABLE) {
            return null;
        }

        // Find the nearest SELECTED or BOOKED seat to the left
        let leftBoundary = -1;
        let leftStatus = null;
        for (let i = seat - 1; i >= 0; i--) {
            const status = rowSeats[i].status;
            if (status === SEAT_STATUS.SELECTED || status === SEAT_STATUS.BOOKED) {
                leftBoundary = i;
                leftStatus = status;
                break;
            }
        }

        // Find the nearest SELECTED or BOOKED seat to the right
        let rightBoundary = rowSeats.length;
        let rightStatus = null;
        for (let i = seat + 1; i < rowSeats.length; i++) {
            const status = rowSeats[i].status;
            if (status === SEAT_STATUS.SELECTED || status === SEAT_STATUS.BOOKED) {
                rightBoundary = i;
                rightStatus = status;
                break;
            }
        }

        // If we have boundaries on both sides, check for isolated AVAILABLE seats
        if (leftBoundary !== -1 && rightBoundary !== rowSeats.length) {
            // Check all seats between left and right boundaries (excluding the seat we're selecting)
            let hasAvailableBetween = false;
            let allBetweenAreBooked = true;
            
            for (let i = leftBoundary + 1; i < rightBoundary; i++) {
                if (i === seat) continue; // Skip the seat we're trying to select
                
                const seatStatus = rowSeats[i].status;
                
                if (seatStatus === SEAT_STATUS.AVAILABLE) {
                    hasAvailableBetween = true;
                    allBetweenAreBooked = false;
                    break; // Found an AVAILABLE seat, no need to check further
                } else if (seatStatus === SEAT_STATUS.SELECTED) {
                    // If there's a SELECTED seat between boundaries, it's not a gap
                    allBetweenAreBooked = false;
                }
                // If seatStatus is BOOKED, we continue checking
            }

            // Rule: Pattern [Selected/Booked] [Available] [Selected/Booked] is NOT allowed
            // Exception: Gaps are allowed ONLY if ALL seats between are BOOKED
            if (hasAvailableBetween) {
                // Found AVAILABLE seat(s) between boundaries - this violates the rule
                // Pattern: [Selected/Booked] [Available] [Selected/Booked] is NOT allowed
                return 'Cannot leave an available seat isolated between selected/booked seats';
            }
            
            // If all seats between are BOOKED, it's allowed (gap due to booked seats)
            // This case is handled by the above check - if hasAvailableBetween is false, we allow it
        }

        // Additional check: After selecting this seat, will it create isolated AVAILABLE seats?
        // Check between this seat and nearest SELECTED seat on left
        if (leftBoundary !== -1 && leftStatus === SEAT_STATUS.SELECTED) {
            for (let i = leftBoundary + 1; i < seat; i++) {
                if (rowSeats[i].status === SEAT_STATUS.AVAILABLE) {
                    // This AVAILABLE seat would be isolated between SELECTED seats
                    return 'Cannot leave an available seat isolated between selected/booked seats';
                }
            }
        }

        // Check between this seat and nearest SELECTED seat on right
        if (rightBoundary !== rowSeats.length && rightStatus === SEAT_STATUS.SELECTED) {
            for (let i = seat + 1; i < rightBoundary; i++) {
                if (rowSeats[i].status === SEAT_STATUS.AVAILABLE) {
                    // This AVAILABLE seat would be isolated between SELECTED seats
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

        // Safety check: ensure seats array is valid
        if (!seats || !Array.isArray(seats) || !seats[row] || !Array.isArray(seats[row]) || !seats[row][seat]) {
            return;
        }

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

        // If selecting (AVAILABLE → SELECTED), validate booking limit and continuity rule
        if (seats[row][seat].status === SEAT_STATUS.AVAILABLE) {
            // Check booking limit first
            const currentSelectedCount = getSelectedCount();
            if (currentSelectedCount >= MAX_SEATS_PER_BOOKING) {
                setErrorMessage(`Maximum ${MAX_SEATS_PER_BOOKING} seats can be selected at a time`);
                return; // Don't allow selection
            }

            // Validate continuity rule
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

    /**
     * Handle booking of selected seats
     * Validates that selected seats count does not exceed maximum limit
     * Shows confirmation modal before proceeding
     */
    const handleBookSeats = () => {
        // Clear any previous error messages
        setErrorMessage('');

        const selectedCount = getSelectedCount();

        // Validate booking limit
        if (selectedCount > MAX_SEATS_PER_BOOKING) {
            setErrorMessage(`Cannot book more than ${MAX_SEATS_PER_BOOKING} seats at a time. Please deselect some seats.`);
            return; // Prevent booking
        }

        if (selectedCount === 0) {
            return; // No seats to book
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    /**
     * Confirm booking and convert SELECTED seats to BOOKED
     */
    const confirmBooking = () => {
        // Convert all SELECTED seats to BOOKED
        const newSeats = seats.map(rowSeats =>
            rowSeats.map(seat => {
                if (seat.status === SEAT_STATUS.SELECTED) {
                    return {
                        ...seat,
                        status: SEAT_STATUS.BOOKED
                    };
                }
                return seat;
            })
        );

        setSeats(newSeats);
        setShowConfirmModal(false);
        setErrorMessage(''); // Clear any error messages
    };

    /**
     * Cancel booking confirmation
     */
    const cancelBooking = () => {
        setShowConfirmModal(false);
    };

    /**
     * Clear all selected seats (convert SELECTED to AVAILABLE)
     * BOOKED seats remain unchanged
     */
    const handleClearSelection = () => {
        // Clear any error messages
        setErrorMessage('');

        // Convert all SELECTED seats to AVAILABLE, keep BOOKED seats unchanged
        const newSeats = seats.map(rowSeats =>
            rowSeats.map(seat => {
                if (seat.status === SEAT_STATUS.SELECTED) {
                    return {
                        ...seat,
                        status: SEAT_STATUS.AVAILABLE
                    };
                }
                // Keep BOOKED and AVAILABLE seats unchanged
                return seat;
            })
        );

        setSeats(newSeats);
    };

    /**
     * Reset entire system to initial state
     * - All seats → AVAILABLE
     * - Clear localStorage
     * - Reset counters & price (automatic via state update)
     */
    const handleReset = () => {
        // Clear any error messages
        setErrorMessage('');

        // Close confirmation modal if open
        setShowConfirmModal(false);

        // Clear localStorage
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }

        // Reset all seats to AVAILABLE status
        const resetSeats = initializeSeats();
        setSeats(resetSeats);
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
                {seats && Array.isArray(seats) ? seats.map((row, rowIndex) => {
                    if (!Array.isArray(row)) return null;
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
                }) : <div>Loading seats...</div>}
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

            {/* Booking Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="modal-overlay"
                    data-testid="booking-confirm-modal"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={cancelBooking}
                >
                    <div
                        className="modal-content"
                        data-testid="booking-confirm-content"
                        style={{
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '8px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Confirm Booking</h2>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '8px 0', fontSize: '16px' }}>
                                <strong>Number of Seats:</strong> {getSelectedCount()}
                            </p>
                            <p style={{ margin: '8px 0', fontSize: '16px' }}>
                                <strong>Total Price:</strong> ₹{calculateTotalPrice()}
                            </p>
                        </div>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            Are you sure you want to proceed with this booking?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-cancel"
                                data-testid="booking-cancel-button"
                                onClick={cancelBooking}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-confirm"
                                data-testid="booking-confirm-button"
                                onClick={confirmBooking}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4caf50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatBooking;
