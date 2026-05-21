export const PERMISSION_ACTIONS = {
  CREATE: "create",
  VIEW: "view",
  UPDATE: "edit",
  DELETE: "delete",
  EXPORT: "export",
};

export const PERMISSION_MODULES = {
  DASHBOARD: "dashboard",
  AREAS: "areas",
  AUDIO_CONFIGURATIONS: "audio-configurations",
  AUDIO_TEMPLATES: "audio-templates",
  AUDIOS: "audios",
  BANNERS: "banners",
  BANNER_ASSIGNMENTS: "banner-assignments",
  BRANCHS: "branchs",
  CONFIGURATION_UI: "configuration-ui",
  COUNTERS: "counters",
  DEVICE_DISPLAY_CONFIG: "device-display-config",
  DEVICE_DISPLAY_CONFIG_COUNTERS: "device-display-config-counters",
  DEVICES: "devices",
  DEVICE_SERVICES: "device-services",
  DEVICE_SESSIONS: "device-sessions",
  EMPLOYEE_EVALUATION_CONTENTS: "employee-evaluation-contents",
  EMPLOYEE_EVALUATIONS: "employee-evaluations",
  ORGANIZATIONS: "organizations",
  PRINT_TEMPLATES: "print-templates",
  PUBLIC_SERVICE_MANAGEMENT: "public-service-management",
  QUEUE_NUMBERS: "queue-numbers",
  QUEUE: "queue",
  REPORT_EMPLOYEE_EVALUATIONS: "report-employee-evaluations",
  REPORT_NUMBERS: "report-numbers",
  REPORT_SATISFACTION: "report-satisfaction",
  REPORT_SERVICE_EVALUATIONS: "report-service-evaluations",
  ROLES: "roles",
  SATISFACTIONS: "satisfactions",
  SHIFTS: "shifts",
  SERVICE_EVALUATION_CONTENTS: "service-evaluation-contents",
  SERVICE_EVALUATIONS: "service-evaluations",
  SERVICES: "services",
  USER_SESSIONS: "user-sessions",
  USERS: "users",
};

const buildPermissionString = (entity) => {
  return Object.entries(PERMISSION_ACTIONS).reduce((acc, [key, value]) => {
    acc[key] = `${entity}.${value}`;
    return acc;
  }, {});
};

export const PERMISSIONS = Object.keys(PERMISSION_MODULES).reduce(
  (acc, moduleKey) => {
    const moduleName = PERMISSION_MODULES[moduleKey];
    acc[moduleKey] = buildPermissionString(moduleName);
    return acc;
  },
  {},
);
