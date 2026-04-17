import { createFinanceListPage, createFinanceFormPage } from './financeCrudFactory';
import { financePaymentsConfig } from './financeModuleConfigs';

const FinancePaymentsList = createFinanceListPage(financePaymentsConfig);
const FinancePaymentsForm = createFinanceFormPage(financePaymentsConfig);

export { FinancePaymentsList as FinancePayments, FinancePaymentsForm };

export default FinancePaymentsList;
