import { Page, Locator, expect } from '@playwright/test';
import { AvailabilityAwarePage } from './availability-aware.page';

export class PassengerDetailsPage extends AvailabilityAwarePage {
    public readonly heading: Locator;
    public readonly continueButton: Locator;
    public readonly firstNameInput: Locator;
    public readonly lastNameInput: Locator;
    public readonly streetInput: Locator;
    public readonly houseNumberInput: Locator;
    public readonly postalCodeInput: Locator;
    public readonly cityInput: Locator;
    public readonly emailInput: Locator;
    public readonly phoneInput: Locator;

    public readonly firstNameError: Locator;
    public readonly lastNameError: Locator;
    public readonly genderError: Locator;
    public readonly birthDateError: Locator;
    public readonly streetError: Locator;
    public readonly houseNumberError: Locator;
    public readonly postalCodeError: Locator;
    public readonly cityError: Locator;
    public readonly emailError: Locator;
    public readonly phoneError: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = this.page.getByRole('heading', { level: 1 }).filter({ hasText: 'Persoonsgegevens' });
        this.continueButton = this.page.getByText('Verder naar betalen');
        this.firstNameInput = this.page.getByRole('textbox', { name: 'Eerste voornaam' }).first();
        this.lastNameInput = this.page.getByRole('textbox', { name: 'Achternaam' }).first();
        this.streetInput = this.page.getByRole('textbox', { name: 'Straatnaam' });
        this.houseNumberInput = this.page.getByRole('textbox', { name: 'Huisnummer' });
        this.postalCodeInput = this.page.getByRole('textbox', { name: 'Postcode' });
        this.cityInput = this.page.getByRole('textbox', { name: 'Woonplaats' });
        this.emailInput = this.page.getByRole('textbox', { name: 'E-mailadres' });
        this.phoneInput = this.page.getByRole('textbox', { name: 'Mobiel telefoonnummer' }).first();

        this.firstNameError = this.firstNameInput.locator('..').getByRole('alert');
        this.lastNameError = this.lastNameInput.locator('..').getByRole('alert');
        this.genderError = this.page.getByText('Selecteer een geslacht').first();
        this.birthDateError = this.page.getByText('Voer de geboortedatum als volgt in: DD/MM/JJJJ').first();
        this.streetError = this.streetInput.locator('..').getByRole('alert');
        this.houseNumberError = this.houseNumberInput.locator('..').getByRole('alert');
        this.postalCodeError = this.postalCodeInput.locator('..').getByRole('alert');
        this.cityError = this.cityInput.locator('..').getByRole('alert');
        this.emailError = this.emailInput.locator('..').getByRole('alert');
        this.phoneError = this.phoneInput.locator('..').getByRole('alert').first();
    }

    async isBookingAvailable(): Promise<boolean> {
        return await this.isContentAvailable(this.heading);
    }

    async triggerValidationErrors() {
        await this.continueButton.click();
    }

    async assertRequiredFieldValidationErrors() {
        await expect(this.firstNameError).toContainText('Vul de voornaam in (volgens paspoort)');
        await expect(this.lastNameError).toContainText('Vul de achternaam in (volgens paspoort)');
        await expect(this.genderError).toContainText('Selecteer een geslacht');
        await expect(this.birthDateError).toContainText('Voer de geboortedatum als volgt in: DD/MM/JJJJ');
        await expect(this.streetError).toContainText('Vul de straatnaam in');
        await expect(this.houseNumberError).toContainText('Vul het huisnummer in');
        await expect(this.postalCodeError).toContainText('Vul de postcode in');
        await expect(this.cityError).toContainText('Vul de woonplaats in');
        await expect(this.phoneError).toContainText('Vul het telefoonnummer in');
        await expect(this.emailError).toContainText('Vul het e-mailadres in');
    }

    async fillInvalidContactDetails() {
        await this.postalCodeInput.fill('12');
        await this.phoneInput.fill('123');
        await this.emailInput.fill('invalid-email');
    }

    async assertInvalidContactDetailsValidationErrors() {
        await expect(this.postalCodeError).toBeVisible();
        await expect(this.postalCodeError).toContainText('Vul een geldige postcode in.');
        await expect(this.phoneError).toBeVisible();
        await expect(this.phoneError).toContainText('Vul het juiste telefoonnummer in');
        await expect(this.emailError).toBeVisible();
        await expect(this.emailError).toContainText('Vul een geldig e-mailadres in');
    }

    async proceedToPayment() {
        await this.continueButton.click();
    }
}
