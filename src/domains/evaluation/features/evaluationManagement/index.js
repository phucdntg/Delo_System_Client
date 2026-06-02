// Services
export {
  topicService,
  useCreateTopicMutation,
  useDeleteTopicMutation,
  useGetTopicByIdQuery,
  useGetTopicsQuery,
  useUpdateTopicMutation,
} from "./services/topicService";

export {
  targetService,
  useCreateTargetMutation,
  useDeleteTargetMutation,
  useGetTargetByIdQuery,
  useGetTargetsQuery,
  useUpdateTargetMutation,
} from "./services/targetService";

export {
  actionService,
  useCreateActionMutation,
  useCreateActionWithIconMutation,
  useDeleteActionMutation,
  useGetActionByIdQuery,
  useGetActionsQuery,
  useUpdateActionIconMutation,
  useUpdateActionMutation,
} from "./services/actionService";

export {
  contentService,
  useCreateContentMutation,
  useDeleteContentMutation,
  useGetContentByIdQuery,
  useGetContentsQuery,
  useUpdateContentMutation,
} from "./services/contentService";

export {
  recordService,
  useGetRecordByIdQuery,
  useGetRecordsQuery,
} from "./services/recordService";
