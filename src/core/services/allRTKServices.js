import { authService } from "@domains/auth";
import {
  areaService,
  branchService,
  orgService,
  permissionService,
  roleService,
  userService,
} from "@domains/system";

import {
  counterService,
  employeeEvaluationContentService,
  serviceEvaluationContentService,
  serviceService,
} from "@domains/qms";

import {
  actionService,
  contentService,
  targetService,
  topicService,
} from "@domains/evaluation";

import { questionFlowService } from "@domains/faq";

export const allRTKServices = {
  authService,
  branchService,
  areaService,
  orgService,
  roleService,
  permissionService,
  userService,

  counterService,
  employeeEvaluationContentService,
  serviceEvaluationContentService,
  serviceService,

  topicService,
  targetService,
  actionService,
  contentService,

  questionFlowService,
};
