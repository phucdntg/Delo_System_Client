import { useTranslate } from "@core/providers/translate";
import { Checkbox, Collapse, Empty } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ACTION_LABELS, MODULE_LABELS } from "../constants";

const { Group: CheckboxGroup } = Checkbox;

export default function PermissionSelector({
  permissions,
  selected = [],
  onChange,
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

  const toValues = (ids) => {
    const idSet = new Set((ids || []).map((s) => String(s)));
    const mapped = [];
    modules.forEach((m) =>
      m.actions.forEach((a) => {
        if (idSet.has(String(a.id))) mapped.push(a.value);
      }),
    );
    return mapped.length > 0 ? mapped : ids || [];
  };

  const [value, setValue] = useState(() => toValues(selected));

  useEffect(() => {
    setValue(toValues(selected));
  }, [selected, modules]);

  const toIds = (vals) =>
    vals
      .map((v) => {
        for (const m of modules) {
          const a = m.actions.find((x) => x.value === v);
          if (a) return a.id;
        }
        return null;
      })
      .filter((x) => x != null);

  const handleChange = (nextVals) => {
    setValue(nextVals);
    onChange?.(toIds(nextVals));
  };

  const onModuleToggle = (moduleName, checked) => {
    const module = modules.find((m) => m.name === moduleName);
    if (!module) return;
    const vals = module.actions.map((a) => a.value);
    const next = checked
      ? Array.from(new Set([...value, ...vals]))
      : value.filter((v) => !vals.includes(v));
    handleChange(next);
  };

  const onModuleChange = (checkedValues, moduleName) => {
    const module = modules.find((m) => m.name === moduleName);
    const moduleVals = module ? module.actions.map((a) => a.value) : [];
    const others = value.filter((v) => !moduleVals.includes(v));
    handleChange([...others, ...checkedValues]);
  };

  if (!modules.length) return <Empty description="No permissions" />;

  const items = modules.map((m) => {
    const allVals = m.actions.map((a) => a.value);
    const checkedCount = value.filter((v) => allVals.includes(v)).length;
    const allChecked = checkedCount === allVals.length && allVals.length > 0;
    const indeterminate = checkedCount > 0 && checkedCount < allVals.length;
    const moduleLabel = MODULE_LABELS[m.name]?.[language] || m.name;

    return {
      key: m.name,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
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

  return <Collapse accordion={false} items={items} />;
}
