import { createItListPage, createItFormPage } from './itCrudFactory';
import { itMaintenanceConfig } from './itModuleConfigs';

const MaintenanceList = createItListPage(itMaintenanceConfig);
const MaintenanceForm = createItFormPage(itMaintenanceConfig);

export { MaintenanceList as Maintenance, MaintenanceForm };

export default MaintenanceList;
