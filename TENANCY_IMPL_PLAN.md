```
› Analyse check if the ui, ai service, and toolkit can be modified to cater multi tenancy requirements as mentioned in TENANCY.md. The current project_id in UI datamodel will have 1:1 relation with data
  connection


• I’ll inspect the tenancy notes and the relevant UI/service/toolkit code paths first, then map current assumptions around project_id and data connections against the requirements.

• Ran pwd && rg --files
  └ /Users/rajatnigam/workspace/python_classes/gen_bi_app
    toolkit/SECURITY.md
    … +1509 lines (ctrl + t to view transcript)
    app/wren-ui/src/apollo/server/resolvers/sqlPairResolver.ts
    app/wren-ui/src/apollo/server/managers/dataSourceSchemaDetector.ts

• Explored
  └ Search project_id|data connection|data_connection|connection_id|tenant|tenancy|workspace|org|organization in .

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• The initial scan shows TENANCY.md defines logical tenants/workspaces, while the UI code has many project_id filters and AI calls already pass project_id as the main scope. I’m narrowing this to the data model,
  GraphQL/API contracts, AI indexing/runtime scope, and toolkit connection/profile handling.

• Explored
  └ Read TENANCY.md
    Search CREATE TABLE|table\.increments|table\.integer|project_id|data_source|dataSource|connection in wren-ui

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• project is currently the central ownership boundary in the UI: semantic models, dashboards, asks, relationships, metrics, instructions, SQL pairs, schema changes and API history all point to project_id. I’m
  checking whether that boundary can be promoted to tenant/workspace scoping or whether it is too coupled to connection details.

• Explored
  └ Read projectRepository.ts, 20240530062133_update_project_table.js, 20240125070643_create_project_table.js, schema.ts, projectResolver.ts
    Search type Project|type DataSource|input SaveDataSource|saveDataSource|currentProject|projectId|workspace|tenant in schema.ts
    Read projectResolver.ts, resolvers.ts

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• There is an explicit single-project constraint in saveDataSource: it resets the existing project before creating a new one. That means multi-tenancy is feasible, but this path must be changed because today one
  data connection effectively means one whole application instance context.

• Explored
  └ Read schema.ts, mdlService.ts, projectService.ts

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• The UI has a partial escape hatch (PreviewSQLDataInput.projectId and several services can accept a project id), but most user-facing GraphQL operations still resolve “current project” as the first row by id. For
  real multi-tenancy, that implicit global current project has to become request/session scoped.

• Explored
  └ Read wrenAIAdaptor.ts
    Search project_id|projectId|tenant|workspace|collection|index|delete\(|generate_recommendation|mdl|manifest in wren-ai-service
    Read wrenAIAdaptor.ts, ibisAdaptor.ts

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• The AI service is already closer to the requirement than the UI: indexing pipelines attach project_id metadata and retrieval filters by it. The main gap is that not every AI endpoint carries project_id, and
  there is no tenant/workspace identity in the contract yet.

• Explored
  └ Read semantics_preparation.py, ibisAdaptor.ts, __init__.py, ask.py, common.py, adaptor.ts
    Search interface AskInput|export interface AskInput|type AskInput|projectId|deployId|createAskingTask|wrenAIAdaptor.ask|generateAskDetail|createTextBasedAnswer|generateChart in models
    Read askingService.ts

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• One concrete issue: AI ask/search pipelines support project_id, but the UI WrenAIAdaptor.ask() currently does not send it. That can cause retrieval to fall back to unfiltered vector search once more than one
  project/connection exists.

• Explored
  └ Read askingService.ts, askingResolver.ts, ibisAdaptor.ts
    Search profileId|toolkit_profiles|/v1/profiles|register_profile|registerProfile|project_id|tenant|workspace in wren
    Read http_api.py, profile_store.py, _toolkit.py

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• The toolkit HTTP layer stores profiles by arbitrary profile_id, so the current wren-ui-project-{projectId} convention can be extended to tenant/workspace-qualified IDs without a major toolkit rewrite. The
  profile table itself lacks tenant columns, so governance/audit filtering would still need to live in UI metadata unless we extend the profile store.

• Explored
  └ Read projectResolver.ts, projectRepository.ts, projectService.ts, wrenAIAdaptor.ts

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• I’m collecting exact file references now so the final assessment can distinguish what is already isolated by project_id, what only works in a single-project app, and what must change for tenant/workspace
  governance.

• Explored
  └ Read wrenAIAdaptor.ts, semantics_preparation.py, profile_store.py, common.py, __init__.py, askingService.ts, schema.ts, 20250102074255_create_dashboard_table.js,
         20250512000000_add_toolkit_profile_id_to_project.js, 20240530062133_update_project_table.js, http_api.py

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

• Short Answer

  Yes, the UI, AI service, and toolkit can be modified for the TENANCY.md model, but the UI needs the largest change. The current UI treats project as the global application context and as the data connection
  holder. That can work with your requirement that project_id has a 1:1 relation with a data connection, but project_id should not be used as the tenant or workspace boundary.

  Current Fit

  The current project table already behaves like a data connection record: it stores connection_info and toolkit_profile_id in app/wren-ui/migrations/20240530062133_update_project_table.js:9 and app/wren-ui/
  migrations/20250512000000_add_toolkit_profile_id_to_project.js:8. Many assets already use project_id as their scope, for example dashboards reference project.id in app/wren-ui/
  migrations/20250102074255_create_dashboard_table.js:9.

  The blocker is that the UI is explicitly single-project today. saveDataSource resets the existing project before creating a new one in app/wren-ui/src/apollo/server/resolvers/projectResolver.ts:266, and
  getCurrentProject() simply returns the first project row in app/wren-ui/src/apollo/server/repositories/projectRepository.ts:204. GraphQL DataSource and saveDataSource also have no tenant/workspace/project
  selection in app/wren-ui/src/apollo/server/schema.ts:144 and app/wren-ui/src/apollo/server/schema.ts:1174.

  Recommended Model

  Keep project_id as the 1:1 data connection id.

  Add:

  - tenant: business unit.
  - workspace: team/use-case under tenant.
  - project.tenant_id: owning tenant for the data connection.
  - workspace_project or direct workspace.default_project_id depending on whether one workspace can use multiple data connections.
  - workspace_id on workspace assets: dashboards, threads, reports, saved queries, AI agents/prompts.
  - RBAC tables for tenant and workspace memberships.

  That gives this shape:

  tenant -> workspace -> workspace assets

  tenant -> project/data_connection

  workspace -> project/data_connection access

  AI Service

  The AI service is close but incomplete. It already has project_id in the base request model in app/wren-ai-service/src/web/v1/services/__init__.py:58, semantics indexing passes project_id into pipelines in app/
  wren-ai-service/src/web/v1/services/semantics_preparation.py:107, and retrieval can filter on project_id in app/wren-ai-service/src/pipelines/common.py:67.

  But the UI does not consistently send it. Semantics deploy posts only mdl and id, not project_id, in app/wren-ui/src/apollo/server/adaptors/wrenAIAdaptor.ts:344. Ask also sends no project_id in app/wren-ui/src/
  apollo/server/adaptors/wrenAIAdaptor.ts:240. This must be fixed before multiple projects/data connections exist, otherwise AI retrieval can become cross-project.

  For tenancy, I would add tenant_id and workspace_id to AI request metadata too, but use project_id as the hard data/semantic isolation filter.

  Toolkit

  Toolkit changes are smaller. The UI already registers one toolkit profile per project as wren-ui-project-${projectId} in app/wren-ui/src/apollo/server/resolvers/projectResolver.ts:418. Toolkit accepts arbitrary
  profileId via /v1/profiles in toolkit/core/wren/src/wren/http_api.py:138.

  However, toolkit profile storage currently only has profile_id, datasource, connection_info, active, and timestamps in toolkit/core/wren/src/wren/profile_store.py:139. That is fine for connection lookup, but not
  enough for governance/audit. Either keep governance in UI metadata, or extend toolkit profiles with tenant_id, workspace_id, and created_by.

  Implementation Priority

  1. Rename/reframe UI project concept as data connection in code/API, or introduce data_connection while preserving project_id for compatibility.
  2. Add tenant/workspace tables and request context.
  3. Replace global getCurrentProject() with getCurrentProject(ctx) using selected tenant/workspace/project.
  4. Stop resetting the only project on saveDataSource.
  5. Pass project_id on all AI deploy/ask/retrieval/indexing calls.
  6. Add RBAC checks to every resolver before accessing project_id or workspace_id.
  7. Extend toolkit profile ids to a collision-proof form like tenant-{tenantId}-project-{projectId}.

  Bottom line: this is feasible, but it is not a small UI-only change. The UI needs a real tenant/workspace context layer; the AI service needs stricter required scoping; the toolkit mostly needs profile naming/
  governance metadata adjustments.
```  

---

```
 Implemented login, seeded role users, and RBAC enforcement.

  Key changes:

  - Added /login with ADID/password auth.
  - Added app_user seed data in app/wren-ui/migrations/20250605000000_create_tenant_workspace_foundation.js.
  - Added signed HttpOnly cookie sessions in app/wren-ui/src/apollo/server/auth.ts.
  - Added shared role/permission mapping in app/wren-ui/src/utils/rbac.ts.
  - Protected GraphQL resolvers and direct /api/v1 routes with role checks.
  - Gated nav/settings/deploy UI by role.

  Seeded users all use password: Password@123

  ADIDs:
  PSA001, PSEC001, POPS001, TADM001, TDST001, TDEV001, WOWN001, WEDT001, WVWR001, BUSR001.

  LOAN_WVWR001 - loan workspace
  WEALTH_WVWR002 - Wealth Operations Workspace
  WEALTH_WVWR001 - Wealth Customer Service Workspace  (What is the distribution of clients' risk profiles across different cities?)

  Verified:

  - yarn check-types passes.
  - Migration ran successfully under Node 18.
  - Login API succeeds for PSA001.
  - Dev server is running at http://localhost:3000.
```