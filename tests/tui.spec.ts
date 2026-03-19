import { test, expect } from '../fixtures/base-fixtures';

const HOTEL_INDEX = 0;

test.describe('TUI Demo', () => {
    test('allows booking with passenger-details validations', async ({ homePage, searchResultsPage, hotelPage, bookingPage, passengerDetailsPage }) => {
        type TestData = {
            departure: string;
            destination: string;
            date: string;
            adults: number;
            children: number;
            childAge: number;
            hotel: string;
        };

        const printTestData = (data: TestData) => {
            console.log('TEST DATA:\n' + JSON.stringify(data, null, 2));
        };

        await homePage.goto();
        await homePage.acceptCookies();
        const departure = await homePage.selectRandomDeparture();
        const destination = await homePage.selectRandomDestination();

        const selectedDate = await homePage.selectRandomDates();

        await homePage.selectDuration('2 nachten');
        const travelers = { adults: 2, children: 1 };
        const selectedChildAge = await homePage.selectTravelers(travelers);
        await homePage.doSearch();

        await searchResultsPage.isLoaded();
        await expect
            .poll(async () => await searchResultsPage.hotels.count())
            .toBeGreaterThan(0);
        const hotelName = await searchResultsPage.getHotelName(HOTEL_INDEX);
        await searchResultsPage.gotoHotel(HOTEL_INDEX);

        printTestData({
            departure,
            destination,
            date: selectedDate,
            adults: travelers.adults,
            children: travelers.children,
            childAge: selectedChildAge,
            hotel: hotelName,
        });

        await hotelPage.isLoaded();
        await expect(hotelPage.hotelTitle).toContainText(hotelName, { ignoreCase: true });
        await hotelPage.bookNow();

        await bookingPage.isLoaded();
        await bookingPage.confirmBooking();

        await passengerDetailsPage.isLoaded();
        await passengerDetailsPage.triggerValidationErrors();
        await passengerDetailsPage.assertRequiredFieldValidationErrors();

        await passengerDetailsPage.fillInvalidContactDetails();
        await passengerDetailsPage.triggerValidationErrors();
        await passengerDetailsPage.assertInvalidContactDetailsValidationErrors();
    });
});

