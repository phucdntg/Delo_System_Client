import { useTranslate } from "@core/providers/TranslateProvider";
import ModalShared from "@shared/components/ModalShared";
import { Checkbox, Collapse, Empty, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ACTION_LABELS, MODULE_LABELS } from "../constants";

const { Group: CheckboxGroup } = Checkbox;

export default function PermissionModal({
  visible,
  title = "Select Permissions",
  onCancel,
  onConfirm,
  selected = [],
  permissions,
  loading = false,
  error = false,
  width = 600,
}) {
  const { language } = useTranslate();

  const modules = useMemo(() => {
    if (!permissions) return [];
    const list = Array.isArray(permissions)
      ? permissions
      : Object.values(permissions);
    return list.map((m) => ({
      name: m.name,
      actions: (m.actions || []).map((a) => ({
        id: a.id,
        name: a.name,
        value: `${m.name}.${a.name}`,
      })),
    }));
  }, [permissions]);

  const [value, setValue] = useState(() => selected || []);

  useEffect(() => {
    if (!selected) {
      setValue([]);
      return;
    }

    const idSet = new Set((selected || []).map((s) => String(s)));
    const mapped = [];
    modules.forEach((m) =>
      m.actions.forEach((a) => {
        if (idSet.has(String(a.id))) mapped.push(a.value);
      }),
    );

    if (mapped.length > 0) {
      setValue(mapped);
    } else {
      setValue(selected || []);
    }
  }, [selected, modules]);

  if (loading) {
    return (
      <ModalShared
        open={visible}
        width={width}
        title={title}
        onCancel={onCancel}
        footer={null}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      </ModalShared>
    );
  }

  if (error) {
    return (
      <ModalShared
        open={visible}
        width={width}
        title={title}
        onCancel={onCancel}
        footer={null}
      >
        <Empty description="Failed to load permissions" />
      </ModalShared>
    );
  }

  const onModuleToggle = (moduleName, checked) => {
    const module = modules.find((m) => m.name === moduleName);
    if (!module) return;
    const vals = module.actions.map((a) => a.value);
    if (checked) {
      const next = Array.from(new Set([...value, ...vals]));
      setValue(next);
    } else {
      const next = value.filter((v) => !vals.includes(v));
      setValue(next);
    }
  };

  const onModuleChange = (checkedValues, moduleName) => {
    const module = modules.find((m) => m.name === moduleName);
    const moduleVals = module ? module.actions.map((a) => a.value) : [];
    const others = value.filter((v) => !moduleVals.includes(v));
    setValue([...others, ...checkedValues]);
  };

  const handleOk = () => {
    const ids = value
      .map((v) => {
        for (const m of modules) {
          const a = m.actions.find((x) => x.value === v);
          if (a) return a.id;
        }
        return null;
      })
      .filter((x) => x != null);

    onConfirm && onConfirm(ids);
  };

  const items = modules.map((m) => {
    const allVals = m.actions.map((a) => a.value);
    const checkedCount = value.filter((v) => allVals.includes(v)).length;
    const allChecked = checkedCount === allVals.length && allVals.length > 0;
    const indeterminate = checkedCount > 0 && checkedCount < allVals.length;

    const moduleLabel = MODULE_LABELS[m.name]?.[language] || m.name;

    return {
      key: m.name,
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Checkbox
            indeterminate={indeterminate}
            checked={allChecked}
            onChange={(e) => onModuleToggle(m.name, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          >
            <strong>{moduleLabel}</strong>
          </Checkbox>
        </div>
      ),
      children: (
        <div style={{ paddingLeft: 8 }}>
          <CheckboxGroup
            style={{ display: "flex", justifyContent: "space-between" }}
            options={m.actions.map((a) => ({
              label: ACTION_LABELS[a.name]?.[language] || a.name,
              value: a.value,
            }))}
            value={value.filter((v) => allVals.includes(v))}
            onChange={(vals) => onModuleChange(vals, m.name)}
          />
        </div>
      ),
    };
  });

  return (
    <ModalShared
      open={visible}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      width={width}
    >
      {modules.length === 0 ? (
        <Empty description="No permissions" />
      ) : (
        <Collapse accordion={false} items={items} />
      )}
    </ModalShared>
  );
}
