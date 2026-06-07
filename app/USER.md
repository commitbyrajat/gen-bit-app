# Loans and Wealth Seed Users

The Loans and Wealth applications each have seven seeded users. All seed
users use the development password `Password@123`.

ADIDs include an application prefix because login ADIDs are globally unique:

- `LOAN_` identifies users scoped to the Loans tenant.
- `WEALTH_` identifies users scoped to the Wealth tenant.

Tenant roles are scoped to the whole application tenant. Workspace roles and
the Business User role are scoped to the application's default workspace.

## Loans Application

| ADID           | Role                | Scope           | Scope description                                                                                   |
| -------------- | ------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `LOAN_TADM001` | Tenant Admin        | Loans tenant    | Manages Loans users, roles, workspaces, data sources, tenant policy, and tenant audit access.       |
| `LOAN_TDST001` | Tenant Data Steward | Loans tenant    | Governs the Loans glossary, KPIs, metadata, dataset certification, and semantic definitions.        |
| `LOAN_TDEV001` | Tenant Developer    | Loans tenant    | Configures Loans data connections, semantic models, AI assets, dashboards, and query behavior.      |
| `LOAN_WOWN001` | Workspace Owner     | Loans Workspace | Manages workspace membership, governance, approvals, standards, usage, and audit access.            |
| `LOAN_WEDT001` | Workspace Editor    | Loans Workspace | Creates and maintains dashboards, reports, prompts, knowledge assets, and shared workspace content. |
| `LOAN_WVWR001` | Workspace Viewer    | Loans Workspace | Views workspace content and runs Ask Data queries without content-management access.                |
| `LOAN_BUSR001` | Business User       | Loans Workspace | Uses Ask Data and consumes approved Loans dashboards and reports for business decisions.            |

## Wealth Application

| ADID             | Role                | Scope            | Scope description                                                                                   |
| ---------------- | ------------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `WEALTH_TADM001` | Tenant Admin        | Wealth tenant    | Manages Wealth users, roles, workspaces, data sources, tenant policy, and tenant audit access.      |
| `WEALTH_TDST001` | Tenant Data Steward | Wealth tenant    | Governs the Wealth glossary, KPIs, metadata, dataset certification, and semantic definitions.       |
| `WEALTH_TDEV001` | Tenant Developer    | Wealth tenant    | Configures Wealth data connections, semantic models, AI assets, dashboards, and query behavior.     |
| `WEALTH_WOWN001` | Workspace Owner     | Wealth Workspace | Manages workspace membership, governance, approvals, standards, usage, and audit access.            |
| `WEALTH_WEDT001` | Workspace Editor    | Wealth Workspace | Creates and maintains dashboards, reports, prompts, knowledge assets, and shared workspace content. |
| `WEALTH_WVWR001` | Workspace Viewer    | Wealth Workspace | Views workspace content and runs Ask Data queries without content-management access.                |
| `WEALTH_BUSR001` | Business User       | Wealth Workspace | Uses Ask Data and consumes approved Wealth dashboards and reports for business decisions.           |
