import { useMemo } from "react";
import { ACTION_LABELS, MODULE_LABELS } from "../../permission/constants";

const ACTION_ORDER = ["view", "create", "edit", "delete"];

/**
 * Hook to compute selected permissions in grouped and translated format.
 *
 * Transforms selected permission IDs into an array of:
 * - moduleLabel: translated module name
 * - actionsLabel: comma-separated translated action names
 *
 * Used for rendering permission tags.
 */
export function useSelectedPermissionList({
  rolePermissions = {},
  selectedPermissionIds = [],
  language = "en",
}) {
  const selectedPermissionList = useMemo(() => {
    const modules = Object.values(rolePermissions || {});

    // Build map from permissionId → {module, action}
    const permissionMap = new Map(
      modules.flatMap((module) =>
        (module?.actions || []).map((action) => [
          action?.id,
          { module: module?.name, action: action?.name },
        ]),
      ),
    );

    // Group selected permissions by module
    const grouped = new Map();
    selectedPermissionIds.forEach((id) => {
      const data = permissionMap.get(id);
      if (!data) return;

      const moduleLabel = MODULE_LABELS[data.module]?.[language] || data.module;
      const actionLabel = ACTION_LABELS[data.action]?.[language] || data.action;

      if (!grouped.has(moduleLabel)) {
        grouped.set(moduleLabel, new Map());
      }
      grouped.get(moduleLabel).set(data.action, actionLabel);
    });

    // Convert to array format for rendering
    return Array.from(grouped.entries()).map(([moduleLabel, actionsMap]) => ({
      moduleLabel,
      actionsLabel: ACTION_ORDER.filter((a) => actionsMap.has(a))
        .map((a) => actionsMap.get(a))
        .join(", "),
    }));
  }, [rolePermissions, selectedPermissionIds, language]);

  return selectedPermissionList;
}
