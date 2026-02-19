import { preToolUse } from "./hooks/preToolUse";
import { postIntentSelection } from "./hooks/postIntentSelection";

export const hookRegistry = {
  preToolUse,
  postIntentSelection,
};
