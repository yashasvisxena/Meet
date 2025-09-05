const ORGANISATION_PERMISSIONS = {
  SECURITY: {
    canRevokeAccess: "canRevokeAccess",
  },
  ORGANISATION: {
    canManageRoles: "canManageRoles",
    canAccessLogs: "canAccessLogs",
    canViewReports: "canViewReports",
  },
  MEETING: {
    canCreateMeetings: "canCreateMeetings",
    canEditMeetings: "canEditMeetings",
    canDeleteMeetings: "canDeleteMeetings",
    canStartMeetings: "canStartMeetings",
    canEndMeetings: "canEndMeetings",
    canJoinMeetings: "canJoinMeetings",
  },
  RECORDING: {
    canRecordMeetings: "canRecordMeetings",
    canAccessRecordings: "canAccessRecordings",
    canDeleteRecordings: "canDeleteRecordings",
    canShareRecordings: "canShareRecordings",
  },
};
export const PERMISSIONS_LIST = ORGANISATION_PERMISSIONS;
