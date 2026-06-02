export const APP_NAME = "DELO SYSTEM";

export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

export const USER_INFO = "user_info";

export const ORG_ID = "org_id";

export const DEVICE_ID = "device_id";

export const HEADER_ORG_ID = "X-Organization-Id";

export const HEADER_DEVICE_ID = "X-Device-Id";

export const LANGUAGE = "delo_language";

export const PATH = {
  HOME: "/",
  AUTH: "/auth/login",
  SYSTEM: {
    BASE: "system",
    ORG_MANAGEMENT: "organizations",
    BRANCH_MANAGEMENT: "branches",
    AREA_MANAGEMENT: "areas",
    ROLE_MANAGEMENT: "roles",
    USER_MANAGEMENT: "users",
  },
  QMS: {
    BASE: "qms",
    DASHBOARD: "dashboard",
    COUNTERS: "counters",
    SERVICES: "services",
    CONFIG: "config",
    EVALUATION_CONTENTS: "evaluation-contents",
  },
  QNA: {
    BASE: "qna",
    DASHBOARD: "dashboard",
    QUESTIONS: "questions",
  },
  EVALUATION: {
    BASE: "evaluation",
    DASHBOARD: "dashboard",
    REVIEWS: "reviews",
    TOPICS: "topics",
    TARGETS: "targets",
    ACTIONS: "actions",
    CONTENTS: "contents",
    RECORDS: "records",
  },
  LOOKUP: {
    BASE: "lookup",
    DASHBOARD: "dashboard",
    SEARCH: "search",
  },
};
