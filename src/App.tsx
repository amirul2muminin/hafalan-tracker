import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import DailySummary from "./pages/DailySummary";
import StudentList from "./pages/StudentList";
import StudentDetail from "./pages/StudentDetail";
import AddMenu from "./pages/AddMenu";
import AddHafalan from "./pages/AddHafalan";
import AddMurojaah from "./pages/AddMurojaah";
import Analytics from "./pages/Analytics";
import StudentAnalytics from "./pages/StudentAnalytics";
import StudentProfile from "./pages/StudentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<DailySummary />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:studentId" element={<StudentDetail />} />
          <Route path="/students/:studentId/analytics" element={<StudentAnalytics />} />
          <Route path="/students/:studentId/profile" element={<StudentProfile />} />
          <Route path="/add" element={<AddMenu />} />
          <Route path="/add/hafalan" element={<AddHafalan />} />
          <Route path="/add/murojaah" element={<AddMurojaah />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
