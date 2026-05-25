import React from "react";
import { useFetchRolesQuery } from "../services/roleService";

export default function RoleManagement() {
  const { data: roles, isLoading, error } = useFetchRolesQuery();
  console.log("🚀 ~ RoleManagement ~ roles:", roles);

  return <div>RoleManagement</div>;
}
