// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth
import {
  Login,
  Dashboard,
  Activity,
  Task,
  Contractors,
  Vendors,
  Material,
  Unit,
  Profile,
  Admin,
  AdminForm,
  CustomerList,
  LeadList,
  AddLead,
  NewProject,
  ProjectFinance,
  AddFinance,
  StockManagement,
  AddStock,
  LegalFiles,
  TechnicalFiles,
  AddTask,
  AddActivity,
  AddContractor,
  AddVendor,
  AddUnit,
  AddMaterial,
  Project2file,
  ProjectProgress,
  GanttChart,
  ProjectOverview,
  AddCustomer,
  Reports,
} from "./pages";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <div className="font-romania"> {/* ✅ Global font applied here */}
      <Router>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Dashboard Layout with Nested Routes */}
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            {/* Default Dashboard Page */}
            <Route index element={<Dashboard />} />

            {/* Project Pages */}
            <Route path="new-project" element={<NewProject />} />
            <Route path="project2file" element={<Project2file />} />
            <Route path="progress" element={<ProjectProgress />} />

            {/* Finance Pages */}
            <Route path="project-finance" element={<ProjectFinance />} />
            <Route path="add-finance" element={<AddFinance />} />
            <Route path="reports" element={<Reports />} />

            {/* Stock Pages */}
            <Route path="stock-management" element={<StockManagement />} />
            <Route path="add-stock" element={<AddStock />} />

            {/* File Pages */}
            <Route path="legal-files" element={<LegalFiles />} />
            <Route path="technical-files" element={<TechnicalFiles />} />
            <Route path="gantt-chart" element={<GanttChart />} />
            <Route path="project-overview" element={<ProjectOverview />} />

            {/* Customers & Leads */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="add-customer" element={<AddCustomer />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="add-lead" element={<AddLead />} />

            {/* Other Dashboard Pages */}
            <Route path="activity" element={<Activity />} />
            <Route path="add-activity" element={<AddActivity />} />

            <Route path="task" element={<Task />} />
            <Route path="addtask" element={<AddTask />} />
            <Route path="contractors" element={<Contractors />} />
            <Route path="add-contractor" element={<AddContractor />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="add-vendor" element={<AddVendor />} />

            <Route path="material" element={<Material />} />
            <Route path="add-material" element={<AddMaterial />} />

            <Route path="unit" element={<Unit />} />
            <Route path="add-unit" element={<AddUnit />} />

            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin-form" element={<AdminForm />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
