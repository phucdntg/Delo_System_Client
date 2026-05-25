import { authService } from "@domains/auth";
import {
  branchService,
  areaService,
  orgService,
  roleService,
} from "@domains/system";

export const allRTKServices = {
  authService,
  branchService,
  areaService,
  orgService,
  roleService,
};
