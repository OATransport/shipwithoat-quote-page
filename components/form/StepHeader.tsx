import { cn } from "@/lib/utils";

type StepHeaderProps = {
  currentStep: number;
  steps: { title: string; description: string }[];
};

export function StepHeader({ currentStep, steps }: StepHeaderProps) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50/70 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {steps[currentStep - 1]?.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber === currentStep;
          const complete = stepNumber < currentStep;

          return (
            <span
              key={step.title}
              className={cn(
                "step-dot h-9 w-9 text-sm font-semibold",
                active && "step-dot-active",
                complete && "step-dot-complete",
              )}
            >
              {complete ? "✓" : stepNumber}
            </span>
          );
        })}
        </div>
      </div>
    </div>
  );
}
