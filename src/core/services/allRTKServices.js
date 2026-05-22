import { authService } from "../../domains/auth/login/services/authService";
import { systemService } from "../../domains/system";

export const allRTKServices = {
  authService,
  ...systemService,
};
