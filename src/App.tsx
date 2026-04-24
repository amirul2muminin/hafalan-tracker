import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentDetail from "./pages/StudentDetail";
import AddMenu from "./pages/AddMenu";
import AddHafalan from "./pages/AddHafalan";
import AddMurojaah from "./pages/AddMurojaah";
import AddTarget from "./pages/AddTarget";
import Analytics from "./pages/Analytics";
import StudentAnalytics from "./pages/StudentAnalytics";
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
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:studentId" element={<StudentDetail />} />
          <Route path="/students/:studentId/analytics" element={<StudentAnalytics />} />
          <Route path="/add" element={<AddMenu />} />
          <Route path="/add/hafalan" element={<AddHafalan />} />
          <Route path="/add/murojaah" element={<AddMurojaah />} />
          <Route path="/add/target" element={<AddTarget />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
