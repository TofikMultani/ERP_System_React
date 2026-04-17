import { createFinanceListPage, createFinanceFormPage } from './financeCrudFactory';
import { financeExpensesConfig } from './financeModuleConfigs';

const FinanceExpensesList = createFinanceListPage(financeExpensesConfig);
const FinanceExpensesForm = createFinanceFormPage(financeExpensesConfig);

export { FinanceExpensesList as FinanceExpenses, FinanceExpensesForm };

export default FinanceExpensesList;
