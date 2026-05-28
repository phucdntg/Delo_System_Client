import { Select } from "antd";
import { useEffect } from "react";
import UserTable from "./UserTable";

export default function UserTabContent({
  group,
  selectedByName,
  onSelectBranchRole,
  search,
  onEdit,
  onDelete,
}) {
  const single = group.roles.length === 1;
  const selectedRoleId = single ? group.roles[0].id : (selectedByName[group.name] ?? null);

  const activeRole = group.roles.find((r) => r.id === selectedRoleId) ?? null;

  useEffect(() => {
    if (
      !single &&
      (selectedByName[group.name] === undefined || selectedByName[group.name] === null)
    ) {
      const defaultRole = group.roles[0];
      if (defaultRole) onSelectBranchRole(group.name, defaultRole.id);
    }
  }, [single, selectedByName, group, onSelectBranchRole]);

  return (
    <div>
      {!single && (
        <Select
          placeholder="Filter by branch"
          options={group.roles.map((r) => ({
            label: r.branch?.name || "(No branch)",
            value: r.id,
          }))}
          value={selectedRoleId}
          onChange={(val) => onSelectBranchRole(group.name, val)}
          style={{ minWidth: 240, marginBottom: 12 }}
        />
      )}
      {activeRole ? (
        <UserTable
          tabRole={activeRole}
          externalSearch={search}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <div style={{ color: "#666" }}>Please select a branch to view users for this role.</div>
      )}
    </div>
  );
}
