import { createBdd } from 'playwright-bdd';
import { LoginPage } from '@pages/login/login-page';
import { ExcelDataReader } from '@data-utils/excel-data-reader';
import type { LoginConfigRow, LoginUserRow } from '../types/login-data';

const { Given, When } = createBdd();

let loginPage: LoginPage;

// Load Excel once
const excelPath = 'test-data-excel/login-data.xlsx';
ExcelDataReader.loadExcelFile(excelPath);

const config = ExcelDataReader.getDataByKey('LoginData', 'dataKey', 'config') as LoginConfigRow;
const user1 = ExcelDataReader.getDataByKey('LoginData', 'dataKey', 'user1') as LoginUserRow;

Given('the application is open', async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.open(config.url);
});

When('I login as default user', async () => {
  await loginPage.login(user1.userName, user1.passWord);
});
