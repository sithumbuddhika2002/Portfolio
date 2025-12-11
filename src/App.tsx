import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProfileEditor } from './pages/admin/ProfileEditor';
import { SkillsEditor } from './pages/admin/SkillsEditor';
import { ProjectsEditor } from './pages/admin/ProjectsEditor';
import { ExperienceEditor } from './pages/admin/ExperienceEditor';
import { SettingsEditor } from './pages/admin/SettingsEditor';

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Portfolio />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="/admin/dashboard/profile" replace />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="skills" element={<SkillsEditor />} />
            <Route path="projects" element={<ProjectsEditor />} />
            <Route path="experience" element={<ExperienceEditor />} />
            <Route path="settings" element={<SettingsEditor />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
