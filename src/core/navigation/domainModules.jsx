import { lookupNavigation } from "@domains/lookup";
import { qmsNavigation } from "@domains/qms";
import { qnaNavigation } from "@domains/qna";
import { evaluationNavigation } from "@domains/evaluation";
import { systemNavigation } from "@domains/system";

export const DOMAIN_MODULES = [
  systemNavigation,
  qmsNavigation,
  qnaNavigation,
  evaluationNavigation,
  lookupNavigation,
];
