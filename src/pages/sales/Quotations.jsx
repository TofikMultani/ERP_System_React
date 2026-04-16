import { createSalesListPage, createSalesFormPage } from './salesCrudFactory';
import { quotationsConfig } from './salesModuleConfigs';

const QuotationsList = createSalesListPage(quotationsConfig);
const QuotationsForm = createSalesFormPage(quotationsConfig);

export { QuotationsList as Quotations, QuotationsForm };

export default QuotationsList;
