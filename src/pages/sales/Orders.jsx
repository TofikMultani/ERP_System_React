import { createSalesListPage, createSalesFormPage } from './salesCrudFactory';
import { ordersConfig } from './salesModuleConfigs';

const OrdersList = createSalesListPage(ordersConfig);
const OrdersForm = createSalesFormPage(ordersConfig);

export { OrdersList as Orders, OrdersForm };

export default OrdersList;
