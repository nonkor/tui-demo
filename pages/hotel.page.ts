import { Page, Locator } from '@playwright/test';
import { AvailabilityAwarePage } from './availability-aware.page';

export class HotelPage extends AvailabilityAwarePage {
    public readonly page: Page;
    public readonly hotelTitle: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.hotelTitle = this.page.getByRole('heading', { level: 1 });
    }

    protected getResultIndicator(): Locator {
        return this.page.getByText('Verder', { exact: true });
    }

    async bookNow() {
        const continueButton = this.page.getByText('Verder', { exact: true });
        await continueButton.click();
    }
}
