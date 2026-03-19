import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { HotelPage } from '../pages/hotel.page';
import { BookingPage } from '../pages/booking.page';
import { PassengerDetailsPage } from '../pages/passenger-details.page';

type PageFixtures = {
	homePage: HomePage;
	searchResultsPage: SearchResultsPage;
	hotelPage: HotelPage;
	bookingPage: BookingPage;
	passengerDetailsPage: PassengerDetailsPage;
};

export const test = base.extend<PageFixtures>({
	homePage: async ({ page }, use) => {
		const homePage = new HomePage(page);
		await use(homePage);
	},

	searchResultsPage: async ({ page }, use) => {
		const searchResultsPage = new SearchResultsPage(page);
		await use(searchResultsPage);
	},

	hotelPage: async ({ page }, use) => {
		const hotelPage = new HotelPage(page);
		await use(hotelPage);
	},

	bookingPage: async ({ page }, use) => {
		const bookingPage = new BookingPage(page);
		await use(bookingPage);
	},

	passengerDetailsPage: async ({ page }, use) => {
		const passengerDetailsPage = new PassengerDetailsPage(page);
		await use(passengerDetailsPage);
	}

});

export { expect };
