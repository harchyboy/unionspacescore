# Architecture & Integration Strategy

This document outlines the architectural decisions for the UNION Core platform, specifically focusing on how the Vercel frontend integrates with the Zoho One ecosystem (CRM, Creator, etc.).

## 🏗️ Integration Pattern: "The Traffic Cop"

The Vercel Serverless Functions (`/api/*`) act as a middleware layer. The Frontend **never** talks to Zoho directly. It always calls a Vercel API endpoint, which then decides where to route the request.

**Frontend** ➡️ **Vercel API (`/api/...`)** ➡️ **Zoho (CRM or Creator)**

## 🚦 Routing Decision Matrix

Use this guide when building new features to decide whether to connect to Zoho CRM directly or route through Zoho Creator.

| Scenario | **Preferred Method** | **Target** | **Why?** |
| :--- | :--- | :--- | :--- |
| **CRUD Operations**<br>*(List, Create, Update, Delete Records)* | **Direct to CRM** | `crm.zoho.eu/v2` | • **Performance:** Faster response times.<br>• **Simplicity:** Standard REST structure.<br>• **Cost:** Avoids Creator API limits for standard data. |
| **Complex Business Logic**<br>*(Calculations, Matching Algorithms, Multi-step workflows)* | **Zoho Creator** | `creator.zoho.eu` | • **Logic Reuse:** Leverages existing Deluge scripts.<br>• **Centralization:** Keeps business rules in one place (Zoho).<br>• **Power:** Access to internal Zoho functions not exposed via CRM API. |
| **Document Automation**<br>*(Generating PDFs, Contracts, Digital Signatures)* | **Zoho Creator** | `creator.zoho.eu` | • **Native Tools:** Uses Zoho's built-in PDF/Writer engines.<br>• **Complexity:** Hard to replicate PDF generation reliably in Node.js. |
| **Custom App Data**<br>*(Data models that don't fit standard CRM modules)* | **Zoho Creator** | `creator.zoho.eu` | • **Source of Truth:** Data lives in Creator custom applications (e.g., Supplier Compliance, detailed Property attributes). |

## 🛠️ Implementation Examples

### 1. Standard Contact Management (Direct to CRM)
**Feature:** "Add a new contact"
- **Frontend:** `POST /api/contacts`
- **Vercel Logic:** Validates input, formats for CRM.
- **Backend:** Calls `POST https://www.zohoapis.eu/crm/v2/Contacts`
- **Reason:** Standard data entry. No complex logic required.

### 2. Property Matching (Via Creator)
**Feature:** "Find properties for this requirement"
- **Frontend:** `POST /api/properties/match`
- **Vercel Logic:** Passes requirement ID.
- **Backend:** Calls `https://creator.zoho.eu/api/v2/.../report/Matching_Report`
- **Reason:** The matching algorithm is a complex Deluge script that scores properties based on 20+ criteria. Re-writing this in TypeScript introduces risk and duplication.

## 🔐 Security & Environment

- **Credentials:** All Zoho interactions use **OAuth 2.0**.
- **Storage:** `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` are stored in Vercel Environment Variables.
- **Exposure:** **Never** expose these credentials in the frontend code. All API calls must pass through the Vercel serverless layer.
