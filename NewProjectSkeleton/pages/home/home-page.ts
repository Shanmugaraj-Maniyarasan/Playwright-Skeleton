import { Page, Locator } from '@playwright/test';

export class HomePage {
  private readonly page: Page;
  private readonly startFlowLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startFlowLink = page.getByRole('link', { name: 'Start Flow' });
  }

  async startMainFlow() {
    await this.startFlowLink.click();
  }
}
