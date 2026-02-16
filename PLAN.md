# 🛠️ Squad Project: AutomateBoss Support Dashboard

## 🗺️ Master Roadmap

- [ ] **Milestone 1: Team & Roles Foundation**
  - Define user roles (A2P, Web Design, Basic Tasks)
  - Implement team member management interface
- [ ] **Milestone 2: Pipeline Visual Evolution**
  - Implement List View for projects
  - Create toggle between Grid and List views
- [ ] **Milestone 3: Dynamic Pipeline Operations**
  - Implement Drag-and-Drop project movement
  - Persist movement to backend
- [ ] **Milestone 4: Automation Engine**
  - Webhook triggers on pipeline state changes
  - High Level integration for custom messaging

## 📝 Current Trajectory
Setting up the project foundation, researching existing database schema, and defining the "Squad" roles.

## 🚥 Squad Status

| Agent | Task | Status |
| :--- | :--- | :--- |
| 🐎 **Design Lead** | Designing Pipeline List View & DnD UX | 🟡 In Progress |
| 🏗️ **Builder** | Scaffolding Team Management & Schema | 🟡 In Progress |
| 🤓 **Nerd** | Planning testing suite for DnD | ⚪ Waiting |
| 📚 **Researcher** | Researching High Level API & DnD Libraries | 🟡 In Progress |

---

## 🏛️ Architecture & Research Notes

### Webhook Strategy
- Trigger: UUID of project moved + From_Stage + To_Stage
- Destination: Custom Endpoint and/or High Level Webhook URL

### Drag-and-Drop
- Evaluating `dnd-kit` for best performance and accessibility in Next.js.
