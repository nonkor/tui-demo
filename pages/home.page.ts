import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    public readonly page: Page;

    private readonly cookiesAcceptButton: Locator;
    private readonly approveButton: Locator;

    private readonly departureInput: Locator;
    private readonly departureList: Locator;

    private readonly destinationInput: Locator;
    private readonly destinationListToggle: Locator;
    private readonly destinationsList: Locator;
    private readonly destinationsRegion: Locator;

    private readonly dateListToggle: Locator;
    private readonly dateList: Locator;

    // Dynamic locators
    private readonly departureOptions = async (): Promise<Locator> => {
        await expect(this.departureList).toBeVisible();
        const options = this.departureList.locator('li > label[role="checkbox"]');
        await expect(options.first()).toBeVisible();
        return options;
    };

    private readonly destinationCountries = async (): Promise<Locator> => {
        await expect(this.destinationsList).toBeVisible();
        const countries = this.destinationsList.locator('[aria-label]:not(.DestinationsList__disabled)');
        await expect(countries.first()).toBeVisible();
        return countries;
    };

    private readonly destinationOptions = async (): Promise<Locator> => {
        await expect(this.destinationsRegion).toBeVisible();
        const options = this.destinationsRegion.getByRole('checkbox');
        await expect(options.first()).toBeVisible();
        return options;
    };

    private readonly dateOptions = async (): Promise<Locator> => {
        await expect(this.dateList).toBeVisible();
        const table = this.dateList.locator('.SelectLegacyDate__calendar > table');
        await expect(table).toBeVisible();
        return this.dateList.locator('td.SelectLegacyDate__available');
    };

    constructor(page: Page) {
        this.page = page;
        this.cookiesAcceptButton = this.page.getByRole('button', { name: 'Accepteer cookies' });
        this.approveButton = this.page.locator('button:visible', { hasText: 'Opslaan' }).last();

        this.departureInput = this.page.locator('[data-test-id="airport-input"]');
        this.departureList = this.page.locator('[aria-label="airport list"]');

        this.destinationInput = this.page.locator('[data-test-id="destination-input"]');
        this.destinationListToggle = this.destinationInput
            .locator('..')
            .getByText('Lijst', { exact: true });
        this.destinationsList = this.page.locator('.DestinationsList__destinationListContainer');
        this.destinationsRegion = this.page.getByRole('region', { name: 'destinations' });

        this.dateListToggle = this.page.locator('[data-test-id="departure-date-input"]');
        this.dateList = this.page.locator('.SelectLegacyDate__datePickerContainer');
    }

    private async clickRandomItem(items: Locator, emptyMessage: string) {
        const count = await items.count();

        if (count === 0) { throw new Error(emptyMessage); }

        const randomIndex = Math.floor(Math.random() * count);
        await items.nth(randomIndex).click();
    }

    private async clickApproveButton() {
        await this.approveButton.click();
    }

    async goto() {
        await this.page.goto('https://www.tui.nl/h/nl');
    }

    async acceptCookies() {
        await this.cookiesAcceptButton.click();
    }

    async selectRandomDeparture() {
        await this.departureInput.click();

        const options = await this.departureOptions();
        await this.clickRandomItem(options, 'No available date was found');

        await this.clickApproveButton();
    }

    async selectRandomDestination() {
        await this.destinationListToggle.click();

        const countries = await this.destinationCountries();
        await this.clickRandomItem(countries, 'No destination countries were found');

        const destinationOptions = await this.destinationOptions();
        await this.clickRandomItem(destinationOptions, 'No destination options were found');

        await this.clickApproveButton();
    }

    async selectRandomDates() {
        await this.dateListToggle.click();

        const dateOptions = await this.dateOptions();

        // Dates are rendered dynamically after the calendar appears
        // Wait up to 5s for at least one available date cell; if none appear, skip later in the spec
        await dateOptions.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

        const availableDatesCount = await dateOptions.count();

        if (availableDatesCount === 0) {
            return false;
        }

        await this.clickRandomItem(dateOptions, 'No date options were found');

        await this.clickApproveButton();

        return true;
    }

    async selectTravelers({ adults, children }: { adults: number; children: number }) {
        const travelersInput = this.page.locator('[data-test-id="rooms-and-guest-input"]');
        await travelersInput.click();

        const adultsInput = this.page.locator('[aria-label="adult select"] select');
        await expect(adultsInput).toHaveValue(adults.toString());

        const childrenInput = this.page.locator('[aria-label="child select"] select');
        await expect(childrenInput).toHaveValue('0');
        await childrenInput.selectOption(children.toString());
        await expect(childrenInput).toHaveValue(children.toString());

        const childrenAgeInput = this.page.locator('[aria-label="age select"] select');
        await childrenAgeInput.selectOption('5');

        await this.clickApproveButton();
    }

    async selectDuration(duration: string) {
        const durationInput = this.page.locator('[data-test-id="duration-input"] select');
        await durationInput.selectOption(duration.toString());
        await expect(durationInput).toHaveValue(duration.toString());
    }

    async doSearch() {
        const searchButton = this.page.locator('[data-test-id="search-button"]');
        await searchButton.click();
    }
}
