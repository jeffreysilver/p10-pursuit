
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import RacesPage from "./pages/RacesPage";
import RaceDetailPage from "./pages/RaceDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PlayersPage from "./pages/PlayersPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/races" element={<Layout><RacesPage /></Layout>} />
          <Route path="/races/:raceId" element={<Layout><RaceDetailPage /></Layout>} />
          <Route path="/leaderboard" element={<Layout><LeaderboardPage /></Layout>} />
          <Route path="/players" element={<Layout><PlayersPage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
