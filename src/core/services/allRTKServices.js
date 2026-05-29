import { authService } from "@domains/auth";
import {
  areaService,
  branchService,
  orgService,
  permissionService,
  roleService,
  userService,
} from "@domains/system";

import { counterService } from "@domains/qms";

export const allRTKServices = {
  authService,
  branchService,
  areaService,
  orgService,
  roleService,
  permissionService,
  userService,

  counterService,
};
