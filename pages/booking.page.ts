import { Locator, Page } from '@playwright/test';
import { AvailabilityAwarePage } from './availability-aware.page';

export class BookingPage extends AvailabilityAwarePage {
    public readonly confirmButton: Locator;

    constructor(page: Page) {
        super(page);
        this.confirmButton = this.page.getByLabel('progressbar navigation').getByText('Boek Nu', { exact: true });
    }

    async isBookingAvailable(): Promise<boolean> {
        return await this.isContentAvailable(this.confirmButton);
    }

    async confirmBooking() {
        await this.confirmButton.click();
    }
}
