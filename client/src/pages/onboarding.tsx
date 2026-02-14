import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CATEGORIES, FAILURES_BY_CATEGORY, generateUsername } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Target, ListChecks, Sparkles, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFailures, setSelectedFailures] = useState<string[]>([]);
  const [failureDescription, setFailureDescription] = useState("");
  const [severity, setSeverity] = useState([3]);
  const [learningStyle, setLearningStyle] = useState("");
  const [availability, setAvailability] = useState("");
  const [accountabilityStyle, setAccountabilityStyle] = useState("");

  const createUser = useMutation({
    mutationFn: async () => {
      const username = generateUsername();
      const res = await apiRequest("POST", "/api/users", {
        username,
        category,
        goal,
        failures: selectedFailures,
        failureDescription: failureDescription || null,
        severity: severity[0],
        points: 0,
        badges: [],
        learningStyle: learningStyle || null,
        availability: availability || null,
        accountabilityStyle: accountabilityStyle || null,
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

  const availableFailures = category ? FAILURES_BY_CATEGORY[category] || [] : [];

  const toggleFailure = (f: string) => {
    setSelectedFailures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const canProceedStep1 = goal.trim().length > 0 && category.length > 0;
  const canProceedStep2 = selectedFailures.length > 0;

  const steps = [
    { num: 1, label: "Set Goal", icon: Target },
    { num: 2, label: "Share Failures", icon: ListChecks },
    { num: 3, label: "Preferences", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-primary">Fail</span>Safe
          </h1>
          <p className="text-muted-foreground text-sm">Transform failures into connections</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8" data-testid="progress-steps">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-xs hidden sm:inline ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">What's your goal?</h2>
                <p className="text-sm text-muted-foreground mb-4">Tell us what you're working towards</p>
                <Input
                  data-testid="input-goal"
                  placeholder="e.g., Land a product manager role at a tech company"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value.slice(0, 200))}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{goal.length}/200</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-testid="button-next-step1"
                className="w-full"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">What have been your failures?</h2>
                <p className="text-sm text-muted-foreground mb-4">Select the setbacks you've experienced</p>
                <div className="space-y-2">
                  {availableFailures.map((f) => (
                    <label
                      key={f}
                      className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer border border-transparent"
                      data-testid={`checkbox-failure-${f.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <Checkbox
                        checked={selectedFailures.includes(f)}
                        onCheckedChange={() => toggleFailure(f)}
                      />
                      <span className="text-sm">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Tell us more (optional)</Label>
                <Textarea
                  data-testid="textarea-failure-description"
                  placeholder="Share your story... everything stays anonymous"
                  value={failureDescription}
                  onChange={(e) => setFailureDescription(e.target.value.slice(0, 500))}
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{failureDescription.length}/500</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">How severe is this setback? ({severity[0]}/5)</Label>
                <Slider
                  data-testid="slider-severity"
                  value={severity}
                  onValueChange={setSeverity}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Minor setback</span>
                  <span>Major setback</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step2">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  data-testid="button-next-step2"
                >
                  Continue <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Almost there!</h2>
                <p className="text-sm text-muted-foreground mb-4">Help us match you better (all optional)</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">How do you prefer to learn?</Label>
                <RadioGroup value={learningStyle} onValueChange={setLearningStyle}>
                  {["Solo", "Group", "Both"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`learn-${opt}`} />
                      <Label htmlFor={`learn-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">What's your availability?</Label>
                <RadioGroup value={availability} onValueChange={setAvailability}>
                  {["Weekdays", "Weekends", "Flexible"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`avail-${opt}`} />
                      <Label htmlFor={`avail-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Preferred accountability style?</Label>
                <RadioGroup value={accountabilityStyle} onValueChange={setAccountabilityStyle}>
                  {["Daily check-ins", "Weekly goals", "Milestone-based"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`acc-${opt}`} />
                      <Label htmlFor={`acc-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} data-testid="button-back-step3">
                  <ChevronLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => createUser.mutate()}
                  disabled={createUser.isPending}
                  data-testid="button-create-account"
                >
                  {createUser.isPending ? "Creating..." : "Join FailSafe"}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
              <button
                className="w-full text-center text-xs text-muted-foreground hover:underline"
                onClick={() => createUser.mutate()}
                data-testid="button-skip"
              >
                Skip preferences and join now
              </button>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Everything is anonymous. No email or password needed.
        </p>
      </div>
    </div>
  );
}
