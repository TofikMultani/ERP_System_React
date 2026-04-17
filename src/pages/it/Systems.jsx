import { createItListPage, createItFormPage } from './itCrudFactory';
import { itSystemsConfig } from './itModuleConfigs';

const SystemsList = createItListPage(itSystemsConfig);
const SystemsForm = createItFormPage(itSystemsConfig);

export { SystemsList as Systems, SystemsForm };

export default SystemsList;
