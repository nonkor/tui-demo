import { Page, Locator, expect } from '@playwright/test';
import { skipWithWarning } from '../tests/helpers/skip-warning';

export class HomePage {
    private static readonly NO_AVAILABLE_DATES_WARNING =
        'No departure date slots were available for the selected route. Rerun the test to continue with passenger-details validations.';

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
    private readonly dateCalendarTable: Locator;

    private readonly travelersInput: Locator;
    private readonly adultsInput: Locator;
    private readonly childrenInput: Locator;
    private readonly childrenAgeInput: Locator;
    private readonly durationInput: Locator;
    private readonly searchButton: Locator;

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
        await expect(this.dateCalendarTable).toBeVisible();
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
        this.dateCalendarTable = this.dateList.locator('.SelectLegacyDate__calendar > table');

        this.travelersInput = this.page.locator('[data-test-id="rooms-and-guest-input"]');
        this.adultsInput = this.page.locator('[aria-label="adult select"] select');
        this.childrenInput = this.page.locator('[aria-label="child select"] select');
        this.childrenAgeInput = this.page.locator('[aria-label="age select"] select:visible');
        this.durationInput = this.page.locator('[data-test-id="duration-input"]');
        this.searchButton = this.page.locator('[data-test-id="search-button"]');
    }

    private async clickRandomItem(items: Locator, emptyMessage: string): Promise<string> {
        const count = await items.count();

        if (count === 0) { throw new Error(emptyMessage); }

        const randomIndex = Math.floor(Math.random() * count);
        const item = items.nth(randomIndex);
        const value = (await item.innerText()).trim()
        await item.click();
        return value;
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

    async selectRandomDeparture(): Promise<string> {
        await this.departureInput.click();

        const options = await this.departureOptions();
        const departure = await this.clickRandomItem(options, 'No available departure was found');

        await this.clickApproveButton();
        return departure;
    }

    async selectRandomDestination(): Promise<string> {
        await this.destinationListToggle.click();

        const countries = await this.destinationCountries();
        const country = await this.clickRandomItem(countries, 'No destination countries were found');

        const destinationOptions = await this.destinationOptions();
        const destination = await this.clickRandomItem(destinationOptions, 'No destination options were found');

        await this.clickApproveButton();
        return [country, destination].filter(Boolean).join(' / ');
    }

    async selectRandomDates(): Promise<string> {
        await this.dateListToggle.click();

        const dateOptions = await this.dateOptions();

        // Dates are rendered dynamically after the calendar appears
        // Wait up to 5s for at least one available date cell; if none appear, skip later in the spec
        await dateOptions.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

        const availableDatesCount = await dateOptions.count();

        if (availableDatesCount === 0) {
                    await skipWithWarning(HomePage.NO_AVAILABLE_DATES_WARNING);
        }

        await this.clickRandomItem(dateOptions, 'No date options were found');
        await this.clickApproveButton();

        return await this.dateListToggle.inputValue();
    }

    async selectTravelers({ adults, children }: { adults: number; children: number }): Promise<number> {
        await this.travelersInput.click();

        await expect(this.adultsInput).toHaveValue(adults.toString());

        await expect(this.childrenInput).toHaveValue('0');
        await this.childrenInput.selectOption(children.toString());
        await expect(this.childrenInput).toHaveValue(children.toString());


        await expect(this.childrenAgeInput).toBeVisible();

        const ageOptions = this.childrenAgeInput.locator('option');
        const optionCount = await ageOptions.count();
        const randomIndex = 1 + Math.floor(Math.random() * (optionCount - 1)); // exclude the first option which is usually a placeholder like "-"
        const randomAgeValue = (await ageOptions.nth(randomIndex).getAttribute('value')) as string;
        await this.childrenAgeInput.selectOption(randomAgeValue);
        await expect(this.childrenAgeInput).toHaveValue(randomAgeValue);
        const selectedChildAge = Number(randomAgeValue);

        await this.clickApproveButton();
        return selectedChildAge;
    }

    async selectDuration(duration: string) {
        await this.durationInput.selectOption(duration.toString());
        await expect(this.durationInput).toContainText(duration.toString());
    }

    async doSearch() {
        await this.searchButton.click();
    }
}
