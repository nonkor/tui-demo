import { Locator } from '@playwright/test';
import { AvailabilityAwarePage } from './availability-aware.page';

export class SearchResultsPage extends AvailabilityAwarePage {
    public readonly resultsList: Locator;
    public readonly hotels: Locator;

    constructor(page: AvailabilityAwarePage['page']) {
        super(page);
        this.resultsList = this.page.locator('[data-test-id="search-results-list"]');
        this.hotels = this.page.locator('[data-test-id="hotel-name"]:visible');
    }

    protected getResultIndicator(): Locator {
        return this.resultsList;
    }

    async gotoHotel(index: number = 0) {
        await this.hotels.nth(index).click();
    }

    async getHotelName(index: number = 0): Promise<string> {
        return (await this.hotels.nth(index).innerText()).trim();
    }
}
