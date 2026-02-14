import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateUsername } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, ArrowLeft, Loader2, Linkedin } from "lucide-react";

const COMMON_FAILURES = [
  "Failed interview",
  "Rejected promotion",
  "Laid off",
  "Startup failed",
  "Product launch flopped",
  "Lost major client",
  "Funding rejected",
  "Failed exam",
  "Rejected from program",
  "Quit exercise routine",
  "Diet failed",
  "Breakup",
  "Family conflict",
  "Writer's block",
  "Project abandoned",
  "Burnout",
  "Imposter syndrome",
];

const MAX_FAILURES = 5;

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedFailures, setSelectedFailures] = useState<string[]>([]);

  const createUser = useMutation({
    mutationFn: async () => {
      const username = generateUsername();
      const res = await apiRequest("POST", "/api/users", {
        username,
        goal,
        failures: selectedFailures,
        linkedinUrl: linkedinUrl || null,
        points: 0,
        badges: [],
      });
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("failsafe_user_id", data.id);
      localStorage.setItem("failsafe_username", data.username);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Welcome to FailSafe!", description: `You're ${data.username}. Let's turn failures into fuel.` });
      navigate("/feed");
    },
    onError: () => {
      toast({ title: "Oops!", description: "Something went wrong. Please try again.", variant: "destructive" });
    },
  });

  const toggleFailure = (f: string) => {
    setSelectedFailures((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= MAX_FAILURES) return prev;
      return [...prev, f];
    });
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-green-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl font-bold text-primary mb-4" data-testid="text-logo">
              FailSafe
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Turn your setbacks into comebacks, together.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border p-8 sm:p-10 space-y-6 text-left">
            <div>
              <label className="block text-base font-semibold mb-3">
                What should we call you?
              </label>
              <input
                type="text"
                disabled
                value="AnonymousPhoenix"
                className="w-full px-5 py-3.5 bg-muted text-muted-foreground rounded-xl text-base border border-border cursor-not-allowed"
                data-testid="input-username-preview"
              />
              <p className="text-xs text-muted-foreground mt-2">A random username will be generated for you</p>
            </div>

            <div>
              <label className="block text-base font-semibold mb-3">
                What's your big goal?
              </label>
              <input
                type="text"
                placeholder="Launch my startup, run a marathon..."
                value={goal}
                onChange={(e) => setGoal(e.target.value.slice(0, 200))}
                maxLength={200}
                className="w-full px-5 py-3.5 bg-background rounded-xl text-base border-2 border-border focus:border-primary focus:ring-0 focus:outline-none transition-colors"
                autoFocus
                data-testid="input-goal"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">{goal.length}/200</p>
            </div>

            <div>
              <label className="block text-base font-semibold mb-3">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn Profile (optional)
              </label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-5 py-3.5 bg-background rounded-xl text-base border-2 border-border focus:border-primary focus:ring-0 focus:outline-none transition-colors"
                data-testid="input-linkedin"
              />
              <p className="text-xs text-muted-foreground mt-2">Connect your profile to find relevant matches</p>
            </div>

            <Button
              size="lg"
              onClick={() => goal.trim() && setStep(1)}
              disabled={!goal.trim()}
              className="w-full rounded-xl font-bold"
              data-testid="button-start-journey"
            >
              Start Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Everything is anonymous. No email or password needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-green-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3" data-testid="text-logo-step1">
            FailSafe
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your setbacks
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">
              What challenges have you faced?
            </h2>
            <p className="text-muted-foreground mb-6">Select up to {MAX_FAILURES}</p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {COMMON_FAILURES.map((failure) => {
                const isSelected = selectedFailures.includes(failure);
                const isDisabled = !isSelected && selectedFailures.length >= MAX_FAILURES;
                return (
                  <div
                    key={failure}
                    onClick={() => !isDisabled && toggleFailure(failure)}
                    className={`flex items-center gap-4 p-3.5 rounded-xl transition-all border-2 ${
                      isSelected
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : isDisabled
                        ? "border-border opacity-40 cursor-not-allowed"
                        : "border-border hover-elevate cursor-pointer"
                    }`}
                    data-testid={`checkbox-failure-${failure.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium flex-1">{failure}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(0)}
              className="rounded-xl font-semibold"
              data-testid="button-back-step1"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => createUser.mutate()}
              disabled={selectedFailures.length === 0 || createUser.isPending}
              className="flex-1 rounded-xl font-bold bg-gradient-to-r from-primary to-accent border-0"
              data-testid="button-create-account"
            >
              {createUser.isPending ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finding your matches...
                </span>
              ) : (
                "Find My Matches"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
