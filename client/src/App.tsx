import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Onboarding from "@/pages/onboarding";
import Feed from "@/pages/feed";
import ChatPage from "@/pages/chat";
import Profile from "@/pages/profile";
import Matches from "@/pages/matches";
import Events from "@/pages/events";
import NotFound from "@/pages/not-found";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const userId = localStorage.getItem("failsafe_user_id");

  useEffect(() => {
    if (!userId && location !== "/onboarding") {
      navigate("/onboarding");
    }
    if (userId && location === "/onboarding") {
      navigate("/feed");
    }
    if (userId && location === "/") {
      navigate("/feed");
    }
  }, [userId, location, navigate]);

  if (!userId && location !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}

function AppLayout() {
  const [location] = useLocation();
  const isOnboarding = location === "/onboarding";

  if (isOnboarding) {
    return <Onboarding />;
  }

  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 z-50 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 flex flex-col overflow-hidden">
            <Switch>
              <Route path="/feed" component={Feed} />
              <Route path="/matches" component={Matches} />
              <Route path="/events" component={Events} />
              <Route path="/chat/:roomId" component={ChatPage} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthGate>
            <AppLayout />
          </AuthGate>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
