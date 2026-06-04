# CRM Web Application - Product Requirements Document

**Version**: 1.0  
**Created**: March 9, 2026  
**Deadline**: March 30, 2026

---

## 1. Executive Summary

### Problem Statement
Construction companies and small businesses struggle to manage customer relationships, track leads through the sales pipeline, and maintain organized notes/tasks for follow-ups—often using spreadsheets or disconnected tools that lead to lost opportunities.

### Proposed Solution
A clean, intuitive CRM web application built with Next.js + TypeScript that enables sales teams to track leads, manage deals, organize contacts, and schedule tasks with minimal learning curve.

### Success Criteria
- Successfully deployed and usable by real construction company users by March 30, 2026
- Under 100 active users in the first phase
- Zero critical bugs at launch
- Dashboard displays accurate real-time metrics (leads, deals, conversions)
- User can create, update, and delete all core entities (Leads, Deals, Contacts, Notes, Tasks)

---

## 2. User Experience & Functionality

### User Personas

| Persona | Description | Needs |
|---------|-------------|-------|
| Sales Representative | Field sales in construction | Quick lead entry, mobile-friendly, clear pipeline view |
| Business Owner | Construction company owner | Dashboard overview, deal metrics, team activity |
| Admin/Manager | Oversees sales team | Full data access, reporting, task assignments |

### User Stories

#### Dashboard
- As a user, I want to see statistical overview so I can make data-driven decisions
- As a user, I want to view total leads, ongoing deals, and won deals so I can track performance

#### Leads
- As a user, I want to create a new lead so I can track potential customers
- As a user, I want to view lead details including status, activities, and notes so I can follow up appropriately
- As a user, I want to update lead status (Hot, Warm, Cold) so I can prioritize efforts
- As a user, I want to log calls, emails, comments, and tasks related to a lead so I have complete interaction history
- As a user, I want to attach documents to a lead so I can keep all relevant files in one place
- As a user, I want to convert a lead to a deal so I can move qualified prospects to the sales pipeline

#### Deals
- As a user, I want to create a new deal so I can track potential sales
- As a user, I want to view and update deal status (Won, Lost, Closed, New) so I can track sales progress
- As a user, I want to log activities, calls, emails, comments, tasks, and documents so I have complete deal history

#### Contacts
- As a user, I want to create and manage high-value contacts so I can maintain relationships
- As a user, I want to view contact details including associated leads and deals

#### Notes
- As a user, I want to create, edit, and delete notes so I can record important information
- As a user, I want to attach notes to leads, deals, or contacts for context

#### Tasks
- As a user, I want to create and schedule tasks so I can plan follow-ups
- As a user, I want to edit and delete tasks so I can manage my workload
- As a user, I want to see all my tasks in one place

### Acceptance Criteria

| Feature | Acceptance Criteria |
|---------|---------------------|
| Dashboard | Shows total leads count, average time to close lead, average time to close deal, average deal value, ongoing deals count, won deals count, average won deal value, sales trend graph |
| Lead Create | Form with name, email, phone, company, status; validates required fields; saves to database |
| Lead Detail | Displays all lead info, activity timeline, associated tasks, notes, documents |
| Lead Status | Dropdown with predefined statuses; updates immediately on selection |
| Lead Activities | User can add email log, call log, comment; each entry shows timestamp and user |
| Convert to Deal | Button transforms lead to deal; preserves relevant data; clears lead or marks as converted |
| Deal Create | Form with name, value, expected close date, status |
| Deal Status | Dropdown with Won, Lost, Closed, New; updates pipeline metrics |
| Contact Create | Form with name, email, phone, company, role |
| Notes CRUD | Create/edit/delete notes; supports rich text or plain text |
| Tasks CRUD | Create/edit/delete tasks; fields: title, due date, status, associated entity |

### Non-Goals (Out of Scope)

- User authentication/authorization system (basic auth acceptable for MVP)
- Advanced reporting/analytics beyond dashboard metrics
- Email/SMTP integration (manual logging only)
- Mobile app or PWA
- Third-party integrations (Slack, Zapier, etc.)
- Multi-tenancy or team workspaces
- Lead/deal assignment to team members
- API for external integrations

---

## 3. Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  Pages: Dashboard, Leads, Deals, Contacts, Notes, Tasks     │
│  Components: Forms, Tables, Cards, Modals, Charts           │
└─────────────────────────────────────────────────────────────┘
                              │
                    API Routes (Next.js)
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (API Routes)                     │
│  CRUD operations for all entities                           │
│  Database queries and aggregations                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  Tables: leads, deals, contacts, notes, tasks, activities   │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (High-Level)

| Table | Key Fields |
|-------|------------|
| `leads` | id, name, email, phone, company, status, created_at, updated_at |
| `deals` | id, name, value, status, lead_id, created_at, closed_at |
| `contacts` | id, name, email, phone, company, role, created_at |
| `notes` | id, content, entity_type, entity_id, created_at, updated_at |
| `tasks` | id, title, due_date, status, entity_type, entity_id, created_at |
| `activities` | id, type, description, entity_type, entity_id, created_at |

### Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (via Prisma ORM)
- **State Management**: React Query or Server Actions
- **Charts**: Recharts or Chart.js

### Integration Points

- Prisma for database operations
- React Hook Form + Zod for form validation
- Next.js API Routes for backend

---

## 4. Risks & Roadmap

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Tight deadline (3 weeks) | Prioritize MVP features; defer non-essentials |
| Database setup complexity | Use Prisma with clear schema; seed test data |
| Dashboard metrics accuracy | Write aggregation queries early; test with sample data |
| UI/UX consistency | Use shadcn/ui components throughout |

### Phased Rollout

| Phase | Target | Features |
|-------|--------|----------|
| **MVP** | March 30, 2026 | Dashboard, Leads CRUD, Deals CRUD, Contacts, Notes, Tasks |
| **v1.1** | Post-launch | Activity logging (calls, emails), Document attachments |
| **v2.0** | Q2 2026 | Basic auth, user management, reporting |

---

## 5. Feature Blueprint

### Dashboard
- **Statistika interaksi dengan customer**
  - Total Leads
  - Average time to close a lead
  - Average time to close a deal
  - Average deal value
  - Ongoing Deals
  - Won Deals
  - Average won deal value
  - Sales trend graph

### Leads
- **Pencatatan interaksi antara user dengan customer yang baru berinteraksi**
  - Create Lead
  - Detail Lead
  - Status Lead (Hot, Warm, Cold, dsb.)
  - Activity Lead
  - Email Lead
  - Comment pada Lead
  - Call Log dengan Lead
  - Tasks yang berhubungan dengan Lead (misal kontak tanggal sekian)
  - Notes untuk Lead
  - Document Attachment
  - Convert to Deal

### Deals
- **Pencatatan interaksi antara user dengan customer yang tertarik dengan produk dan berpotensi close deal**
  - Create Deal
  - Detail Deal
  - Status Deal (Won, Lost, Closed, New, dsb.)
  - Activity Deal
  - Email Deal
  - Comment pada Deal
  - Call Log dengan Deal
  - Tasks yang berhubungan dengan Deal
  - Notes untuk Deal
  - Document Attachment

### Contact
- **Catatan contact high value, existing customer ataupun customer yang akan close deal**
  - Create Contact
  - Detail Contact

### Notes
- **Kumpulan catatan interaksi dengan customer**
  - Create notes
  - Edit notes
  - Delete notes

### Tasks
- **Kumpulan penugasan yang tercatat saat berinteraksi dengan customer**
  - Create tasks
  - Schedule tasks
  - Edit Tasks
  - Delete tasks
