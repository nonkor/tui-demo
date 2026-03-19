import { Locator, Page } from '@playwright/test';
import { skipWithWarning } from '../tests/helpers/skip-warning';

export abstract class AvailabilityAwarePage {
    public readonly page: Page;
    protected readonly errorBanner: Locator;

    constructor(page: Page) {
        this.page = page;
        this.errorBanner = this.page.locator('#wrErrorBanner');
    }

    protected async isContentAvailable(contentLocator: Locator): Promise<boolean> {
        return await Promise.race([
            contentLocator.waitFor({ state: 'visible' }).then(() => true),
            this.errorBanner.waitFor({ state: 'visible' }).then(() => false)
        ]);
    }

    abstract isBookingAvailable(): Promise<boolean>;

    async ensureBookingAvailable(warningMessage: string): Promise<void> {
        const available = await this.isBookingAvailable();
        await skipWithWarning(!available, warningMessage);
    }
}
