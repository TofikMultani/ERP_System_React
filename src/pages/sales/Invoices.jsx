import { createSalesListPage, createSalesFormPage } from './salesCrudFactory';
import { invoicesConfig } from './salesModuleConfigs';

const InvoicesList = createSalesListPage(invoicesConfig);
const InvoicesForm = createSalesFormPage(invoicesConfig);

export { InvoicesList as Invoices, InvoicesForm };

export default InvoicesList;
