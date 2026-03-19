import { Page, Locator } from '@playwright/test';

export class HotelPage {
    public readonly page: Page;
    public readonly hotelTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.hotelTitle = this.page.getByRole('heading', { level: 1 });
    }

    async bookNow() {
        const continueButton = this.page.getByText('Verder', { exact: true });
        await continueButton.click();
    }
}
