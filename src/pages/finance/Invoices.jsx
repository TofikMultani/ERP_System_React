import { createFinanceListPage, createFinanceFormPage } from './financeCrudFactory';
import { financeIncomeConfig } from './financeModuleConfigs';

const FinanceIncomeList = createFinanceListPage(financeIncomeConfig);
const FinanceIncomeForm = createFinanceFormPage(financeIncomeConfig);

export { FinanceIncomeList as FinanceIncome, FinanceIncomeForm };

export default FinanceIncomeList;
