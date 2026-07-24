// Growth Hub database types.
//
// These mirror the gh_* tables created in supabase/migrations/20260741_gh_foundation.sql
// and the gh_accept_invite RPC (20260742 + hotfixes 20260743/20260744). They are maintained by
// hand for Sprint 1B (no live introspection in this environment). To regenerate from a
// live project once available:
//   supabase gen types typescript --project-id <id> --schema public > lib/growth-hub/database.types.ts
// Keep the gh_* shapes in sync with the migrations if you switch to generated output.

export type GrowthHubMemberRole =
  | "client_owner"
  | "client_member"
  | "araaye_manager";

export type GrowthHubMemberStatus = "invited" | "active" | "removed";

export type GrowthHubWorkspaceStatus = "active" | "suspended" | "archived";

export type GrowthHubInviteRole = "client_owner" | "client_member";

export type GrowthHubServiceStatus =
  | "starting"
  | "active"
  | "in_progress"
  | "waiting_on_client"
  | "paused"
  | "completed"
  | "cancelled";

export type GrowthHubMilestoneStatus =
  | "pending"
  | "in_progress"
  | "blocked"
  | "completed"
  | "skipped";

export type GhTemplateMilestone = {
  title: string;
  sort_order: number;
};

// NOTE: these must be `type` aliases (not `interface`) so they carry an
// implicit string index compatibility and satisfy supabase-js's
// `Record<string, unknown>` constraint on Row/Insert/Update. Interfaces would
// silently degrade every table to `never`.
export type GhProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_locale: string;
  created_at: string;
  updated_at: string;
};

export type GhWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  website_url: string | null;
  status: GrowthHubWorkspaceStatus;
  crm_client_id: string | null;
  support_project_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type GhWorkspaceMemberRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: GrowthHubMemberRole;
  status: GrowthHubMemberStatus;
  invited_at: string | null;
  joined_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type GhWorkspaceInviteRow = {
  id: string;
  workspace_id: string;
  email: string | null;
  phone: string | null;
  invited_phone_e164: string | null;
  role: GrowthHubInviteRole;
  token_hash: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  revoked_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type GhActivityEventRow = {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type GhAcceptInviteResult = {
  accepted_workspace_id: string;
  accepted_workspace_slug: string;
  accepted_member_role: GrowthHubMemberRole;
};

export type GhServiceTemplateRow = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  default_milestones: GhTemplateMilestone[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GhServiceRow = {
  id: string;
  workspace_id: string;
  service_template_id: string | null;
  title: string;
  status: GrowthHubServiceStatus;
  progress: number;
  owner_id: string | null;
  start_date: string | null;
  due_date: string | null;
  renewal_date: string | null;
  latest_update: string | null;
  next_action: string | null;
  waiting_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type GhServiceMilestoneRow = {
  id: string;
  service_id: string;
  workspace_id: string;
  title: string;
  status: GrowthHubMilestoneStatus;
  sort_order: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type TableConfig<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type EmptyRecord = { [_ in never]: never };

export interface Database {
  public: {
    Tables: {
      gh_profiles: TableConfig<
        GhProfileRow,
        Partial<GhProfileRow> & { id: string },
        Partial<GhProfileRow>
      >;
      gh_workspaces: TableConfig<
        GhWorkspaceRow,
        Partial<GhWorkspaceRow> & { name: string; slug: string },
        Partial<GhWorkspaceRow>
      >;
      gh_workspace_members: TableConfig<
        GhWorkspaceMemberRow,
        Partial<GhWorkspaceMemberRow> & {
          workspace_id: string;
          user_id: string;
          role: GrowthHubMemberRole;
        },
        Partial<GhWorkspaceMemberRow>
      >;
      gh_workspace_invites: TableConfig<
        GhWorkspaceInviteRow,
        Partial<GhWorkspaceInviteRow> & {
          workspace_id: string;
          role: GrowthHubInviteRole;
          token_hash: string;
          expires_at: string;
        },
        Partial<GhWorkspaceInviteRow>
      >;
      gh_activity_events: TableConfig<
        GhActivityEventRow,
        Partial<GhActivityEventRow> & {
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          event_type: string;
        },
        Partial<GhActivityEventRow>
      >;
      gh_service_templates: TableConfig<
        GhServiceTemplateRow,
        Partial<GhServiceTemplateRow> & { key: string; title: string },
        Partial<GhServiceTemplateRow>
      >;
      gh_services: TableConfig<
        GhServiceRow,
        Partial<GhServiceRow> & { workspace_id: string; title: string },
        Partial<GhServiceRow>
      >;
      gh_service_milestones: TableConfig<
        GhServiceMilestoneRow,
        Partial<GhServiceMilestoneRow> & {
          service_id: string;
          workspace_id: string;
          title: string;
        },
        Partial<GhServiceMilestoneRow>
      >;
    };
    Views: EmptyRecord;
    Functions: {
      gh_accept_invite: {
        Args: { p_token_hash: string };
        Returns: GhAcceptInviteResult[];
      };
      gh_peek_invite: {
        Args: { p_token_hash: string };
        Returns: Array<{
          workspace_name: string;
          member_role: GrowthHubInviteRole;
          expires_at: string;
          phone_masked: string | null;
        }>;
      };
      gh_is_active_member: {
        Args: { ws: string };
        Returns: boolean;
      };
      gh_is_workspace_manager: {
        Args: { ws: string };
        Returns: boolean;
      };
      gh_create_service_from_template: {
        Args: {
          p_workspace_id: string;
          p_template_id: string;
          p_title: string;
          p_start_date?: string | null;
          p_due_date?: string | null;
          p_actor_label?: string | null;
        };
        Returns: string;
      };
      gh_recalc_service_progress: {
        Args: { p_service_id: string };
        Returns: number;
      };
    };
    Enums: EmptyRecord;
    CompositeTypes: EmptyRecord;
  };
}
