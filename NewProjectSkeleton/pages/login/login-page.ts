import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('#user');
    this.password = page.locator('#password');
    this.submit = page.locator('#loginButton');
  }

  async open(url: string) {
    await this.page.goto(url);
  }

  async login(userName: string, passWord: string) {
    await this.username.fill(userName);
    await this.password.fill(passWord);
    await this.submit.click();
  }
}
