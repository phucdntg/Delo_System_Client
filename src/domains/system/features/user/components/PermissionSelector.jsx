import { Checkbox, Collapse, Spin } from 'antd';
import { useTranslate } from '@core/providers/TranslateProvider';

function PermissionSelector({
  permissionGrouped,
  selectedPermissions,
  setSelectedPermissions,
  isLoading,
}) {
  const { translate } = useTranslate();
  const userText = translate('user') || {};
  const actionOrder = ['view', 'create', 'delete', 'edit'];

  const handleCheckAll = (module, checked) => {
    const newSelected = { ...selectedPermissions };
    if (checked) {
      newSelected[module] = permissionGrouped[module].map((perm) => perm.id);
    } else {
      newSelected[module] = [];
    }
    setSelectedPermissions(newSelected);
  };

  const handleCheckPermission = (module, permId, checked) => {
    const newSelected = { ...selectedPermissions };
    if (!newSelected[module]) {
      newSelected[module] = [];
    }

    if (checked) {
      newSelected[module] = [...newSelected[module], permId];
    } else {
      newSelected[module] = newSelected[module].filter((id) => id !== permId);
    }

    setSelectedPermissions(newSelected);
  };

  const isModuleAllChecked = (module) => {
    const modulePerms = permissionGrouped[module];
    const selectedModulePerms = selectedPermissions[module] || [];
    return modulePerms.length > 0 && modulePerms.length === selectedModulePerms.length;
  };

  const isModuleIndeterminate = (module) => {
    const selectedModulePerms = selectedPermissions[module] || [];
    return (
      selectedModulePerms.length > 0 &&
      selectedModulePerms.length < permissionGrouped[module].length
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', padding: 10 }}>
        <Spin style={{ margin: 'auto' }} />
      </div>
    );
  }

  if (!permissionGrouped) {
    return <div></div>;
  }

  return (
    <Collapse
      style={{ background: '#f5f5f594' }}
      items={Object.entries(permissionGrouped).map(([module, perms]) => ({
        key: module,
        label: (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Checkbox
              checked={isModuleAllChecked(module)}
              indeterminate={isModuleIndeterminate(module)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleCheckAll(module, e.target.checked)}
            />
            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{module}</span>
          </div>
        ),
        children: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {perms.map((perm) => (
              <Checkbox
                key={perm.id}
                checked={(selectedPermissions[module] || []).includes(perm.id)}
                onChange={(e) => handleCheckPermission(module, perm.id, e.target.checked)}
                style={{
                  textTransform: 'capitalize',
                  minWidth: '120px',
                }}
              >
                {userText?.form?.actions?.[perm.action] || perm.action}
              </Checkbox>
            ))}
          </div>
        ),
      }))}
    />
  );
}

export default PermissionSelector;
