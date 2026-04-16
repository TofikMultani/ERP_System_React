import { createSalesListPage, createSalesFormPage } from './salesCrudFactory';
import { customersConfig } from './salesModuleConfigs';

const CustomersList = createSalesListPage(customersConfig);
const CustomersForm = createSalesFormPage(customersConfig);

export { CustomersList as Customers, CustomersForm };

export default CustomersList;

