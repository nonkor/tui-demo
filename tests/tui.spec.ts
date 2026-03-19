import { test, expect } from '../fixtures/base-fixtures';
import { skipWithWarning } from './helpers/skip-warning';

const HOTEL_INDEX = 0;
const NO_AVAILABLE_DATES_WARNING =
    'No departure date slots were available for the selected route. Rerun the test to continue with passenger-details validations.';
const BOOKING_UNAVAILABLE_WARNING =
    'The selected accommodation is no longer available. Rerun the test to continue with passenger-details validations.';

test.describe('TUI Demo', () => {
    test('allows booking with passenger-details validations', async ({ homePage, searchResultsPage, hotelPage, bookingPage, passengerDetailsPage }) => {
        await homePage.goto();
        await homePage.acceptCookies();
        await homePage.selectRandomDeparture();
        await homePage.selectRandomDestination();

        const hasAvailableDates = await homePage.selectRandomDates();
        await skipWithWarning(!hasAvailableDates, NO_AVAILABLE_DATES_WARNING);

        await homePage.selectTravelers({ adults: 2, children: 1 });
        await homePage.doSearch();

        await searchResultsPage.ensureBookingAvailable(BOOKING_UNAVAILABLE_WARNING);
        await expect
            .poll(async () => await searchResultsPage.hotels.count())
            .toBeGreaterThan(0);
        const hotelName = await searchResultsPage.getHotelName(HOTEL_INDEX);
        await searchResultsPage.gotoHotel(HOTEL_INDEX);

        await expect(hotelPage.hotelTitle).toContainText(hotelName)
        await hotelPage.bookNow();

        await bookingPage.ensureBookingAvailable(BOOKING_UNAVAILABLE_WARNING);
        await bookingPage.confirmBooking();

        await passengerDetailsPage.ensureBookingAvailable(BOOKING_UNAVAILABLE_WARNING);
        await passengerDetailsPage.triggerValidationErrors();
        await passengerDetailsPage.assertRequiredFieldValidationErrors();

        await passengerDetailsPage.fillInvalidContactDetails();
        await passengerDetailsPage.triggerValidationErrors();
        await passengerDetailsPage.assertInvalidContactDetailsValidationErrors();
    });
});
