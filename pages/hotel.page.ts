import { Page, Locator } from '@playwright/test';
import { AvailabilityAwarePage } from './availability-aware.page';

export class HotelPage extends AvailabilityAwarePage {
    public readonly page: Page;
    public readonly hotelTitle: Locator;
    public readonly continueButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.hotelTitle = this.page.getByRole('heading', { level: 1 });
        this.continueButton = this.page.getByText('Verder', { exact: true });
    }

    protected getResultIndicator(): Locator {
        return this.continueButton;
    }

    async bookNow() {
        await this.continueButton.click();
    }
}
