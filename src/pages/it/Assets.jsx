import { createItListPage, createItFormPage } from './itCrudFactory';
import { itAssetsConfig } from './itModuleConfigs';

const AssetsList = createItListPage(itAssetsConfig);
const AssetsForm = createItFormPage(itAssetsConfig);

export { AssetsList as Assets, AssetsForm };

export default AssetsList;
