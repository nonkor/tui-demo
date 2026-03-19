import { Locator, Page } from '@playwright/test';
import { skipWithWarning } from '../tests/helpers/skip-warning';

export abstract class AvailabilityAwarePage {
    protected static readonly DEFAULT_UNAVAILABLE_MESSAGE =
        'The selected accommodation is no longer available. Rerun the test to continue with passenger-details validations.';

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

    protected abstract getResultIndicator(): Locator;

    async isLoaded(): Promise<boolean> {
        const loaded = await this.isContentAvailable(this.getResultIndicator());
        if (!loaded) {
            await skipWithWarning((this.constructor as typeof AvailabilityAwarePage).DEFAULT_UNAVAILABLE_MESSAGE);
        }
        return loaded;
    }
}
