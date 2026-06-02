import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  private readonly profileButton: Locator;
  private readonly profileLink: Locator;
  private readonly userPreferenceLink: Locator;
  private readonly themeToggle: Locator;
  private readonly changePasswordLink: Locator;
  private readonly currentPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly subscriptionPlansLink: Locator;
  private readonly firstServiceCard: Locator;
  private readonly firstCheckbox: Locator;
  private readonly subscribeButton: Locator;
  private readonly accountDropdown: Locator;
  private readonly occupationDropdown: Locator;
  private readonly acceptTermsCheckbox: Locator;
  private readonly completeSubscriptionButton: Locator;
  private readonly notificationAlertsLink: Locator;
  private readonly changePreferencesButton: Locator;
  private readonly updateButton: Locator;
  private readonly portfolioLink: Locator;
  private readonly faqsLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly helpLink: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.profileButton = page.getByRole('button', { name: 'Profile' });
    this.profileLink = page.getByRole('link', { name: 'Profile' });
    this.userPreferenceLink = page.getByRole('link', { name: 'User Preference' });
    this.themeToggle = page.locator('span').filter({ hasText: 'LightDark' }).getByRole('switch');
    this.changePasswordLink = page.getByRole('link', { name: 'Change Password' });
    this.currentPasswordInput = page.locator('input[name="currentPassword"]');
    this.newPasswordInput = page.locator('input[name="newPassword"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.subscriptionPlansLink = page.getByRole('link', { name: 'Subscription Plans' });
    this.firstServiceCard = page.locator('.col-span-4').first();
    this.firstCheckbox = page.getByRole('checkbox').first();
    this.subscribeButton = page.getByRole('button', { name: 'Subscribe to selected Service' });
    this.accountDropdown = page.getByRole('combobox', { name: /Account/i });
    this.occupationDropdown = page.getByRole('combobox', { name: /Occupation/i });
    this.acceptTermsCheckbox = page.getByRole('checkbox', { name: /I have read and accept/i });
    this.completeSubscriptionButton = page.getByRole('button', { name: 'Complete Subscription' });
    this.notificationAlertsLink = page.getByRole('link', { name: 'Notification Alerts' });
    this.changePreferencesButton = page.getByRole('button', { name: 'Change Preferences' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.portfolioLink = page.getByRole('link', { name: 'Portfolio' });
    this.faqsLink = page.getByRole('link', { name: 'FAQs' });
    this.contactUsLink = page.getByRole('link', { name: 'Contact Us' });
    this.helpLink = page.getByRole('link', { name: 'Help' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async openProfileMenu(): Promise<void> {
    await this.click(this.profileButton);
  }

  async openUserPreference(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.userPreferenceLink);
  }

  async toggleTheme(): Promise<void> {
    await this.click(this.themeToggle);
    await this.click(this.themeToggle);
  }

  async openChangePassword(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.changePasswordLink);
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.openChangePassword();
    await this.fill(this.currentPasswordInput, currentPassword);
    await this.fill(this.newPasswordInput, newPassword);
    await this.fill(this.confirmPasswordInput, confirmPassword);
    await this.click(this.submitButton);
  }

  async openSubscriptionPlans(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.subscriptionPlansLink);
  }

  async selectDropdownValue(dropdown: Locator, value: string): Promise<void> {
    await this.click(dropdown);
    await this.click(this.page.locator(`text=${value}`).first());
  }

  async subscribeToService(accountLabel: string, occupationLabel: string): Promise<void> {
    await this.openSubscriptionPlans();
    await this.click(this.firstServiceCard);
    await this.click(this.firstCheckbox);
    await this.click(this.subscribeButton);
    await this.selectDropdownValue(this.accountDropdown, accountLabel);
    await this.selectDropdownValue(this.occupationDropdown, occupationLabel);
    await this.click(this.acceptTermsCheckbox);
    await this.click(this.completeSubscriptionButton);
  }

  async openNotificationAlerts(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.notificationAlertsLink);
  }

  async updateNotificationPreferences(accountName: string): Promise<void> {
    await this.openNotificationAlerts();
    await this.selectDropdownValue(this.accountDropdown, accountName);
    await this.click(this.changePreferencesButton);
    await this.click(this.updateButton);
  }

  async openPortfolio(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.portfolioLink);
  }

  async selectPortfolioCell(value: string): Promise<void> {
    await this.click(this.page.locator(`text=${value}`).first());
  }

  async openFaqs(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.faqsLink);
  }

  async openFaqQuestion(question: string): Promise<void> {
    await this.click(this.page.locator(`text=${question}`));
  }

  async openContactUs(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.contactUsLink);
  }

  async openHelp(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.helpLink);
  }

  async logout(): Promise<void> {
    await this.openProfileMenu();
    await this.click(this.logoutLink);
  }
}
