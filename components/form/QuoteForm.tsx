"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AddressAutocomplete } from "@/components/form/AddressAutocomplete";
import { SearchAutocomplete } from "@/components/form/SearchAutocomplete";
import { StepHeader } from "@/components/form/StepHeader";
import { customerTypes, flexibilityOptions, runningOptions, vehicleTypes, years } from "@/lib/constants";
import { AddressSuggestion, QuotePayload } from "@/lib/types";
import { canonicalizeVehicleMake } from "@/lib/vehicle-data";
import { cn, formatPhoneNumber } from "@/lib/utils";

type QuoteFormData = {
  pickupAddress: string;
  deliveryAddress: string;
  pickupStructured: AddressSuggestion | null;
  deliveryStructured: AddressSuggestion | null;
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  vehicleRunning: string;
  firstAvailablePickupDate: string;
  pickupFlexibility: string;
  customerType: string;
  notes: string;
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
  attribution: QuotePayload["attribution"];
};

type ErrorMap = Partial<Record<keyof QuoteFormData, string>>;

const steps = [
  { title: "Route", description: "Pickup and delivery" },
  { title: "Vehicle", description: "Year, make, and model" },
  { title: "Shipment", description: "Timing and preferences" },
  { title: "Contact", description: "Where to send the quote" },
];

const initialData: QuoteFormData = {
  pickupAddress: "",
  deliveryAddress: "",
  pickupStructured: null,
  deliveryStructured: null,
  year: "",
  make: "",
  model: "",
  vehicleType: "",
  vehicleRunning: "Yes",
  firstAvailablePickupDate: "",
  pickupFlexibility: "Flexible",
  customerType: "Individual",
  notes: "",
  fullName: "",
  phone: "",
  email: "",
  consent: false,
  attribution: {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    gclid: "",
    fbclid: "",
    referrer: "",
    landing_page_url: "",
  },
};

export function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(initialData);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [makesLoading, setMakesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [vehicleApiMessage, setVehicleApiMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setFormData((current) => ({
      ...current,
      attribution: {
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_term: params.get("utm_term") || "",
        utm_content: params.get("utm_content") || "",
        gclid: params.get("gclid") || "",
        fbclid: params.get("fbclid") || "",
        referrer: document.referrer || "",
        landing_page_url: window.location.href,
      },
    }));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMakes() {
      try {
        setMakesLoading(true);
        setVehicleApiMessage("");
        const response = await fetch("/api/vehicle/makes");
        const data = (await response.json()) as { makes?: string[]; fallback?: boolean };

        if (!active) {
          return;
        }

        const nextMakes = data.makes ?? [];
        setMakes(nextMakes);

        if (data.fallback) {
          setVehicleApiMessage("Vehicle lookup is using a curated fallback list right now.");
        }
      } catch {
        if (!active) {
          return;
        }

        setMakes([]);
        setVehicleApiMessage("Vehicle lookup is temporarily limited, but you can still continue.");
      } finally {
        if (active) {
          setMakesLoading(false);
        }
      }
    }

    loadMakes();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.year || !formData.make) {
      setModels([]);
      return;
    }

    let active = true;

    async function loadModels() {
      try {
        setModelsLoading(true);
        const response = await fetch(
          `/api/vehicle/models?year=${encodeURIComponent(formData.year)}&make=${encodeURIComponent(formData.make)}`,
        );
        const data = (await response.json()) as { models?: string[]; fallback?: boolean };

        if (!active) {
          return;
        }

        setModels(data.models ?? []);
        setVehicleApiMessage(
          data.fallback
            ? "Model suggestions are limited for this selection, but you can still enter the exact model."
            : "",
        );
      } catch {
        if (!active) {
          return;
        }

        setModels([]);
        setVehicleApiMessage(
          "Model suggestions are temporarily limited, but you can still enter the model manually.",
        );
      } finally {
        if (active) {
          setModelsLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      active = false;
    };
  }, [formData.year, formData.make]);

  const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep]);
  const canSearchModels = Boolean(formData.year && formData.make);

  function updateField<K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateStep(step: number) {
    const nextErrors: ErrorMap = {};

    if (step === 1) {
      if (!formData.pickupAddress.trim()) {
        nextErrors.pickupAddress = "Enter a pickup city, ZIP, or street address.";
      }
      if (!formData.deliveryAddress.trim()) {
        nextErrors.deliveryAddress = "Enter a delivery city, ZIP, or street address.";
      }
    }

    if (step === 2) {
      if (!formData.year) {
        nextErrors.year = "Select the vehicle year.";
      }
      if (!canonicalizeVehicleMake(formData.make) && !makes.some((make) => make === formData.make)) {
        nextErrors.make = "Choose the vehicle make from the search suggestions.";
      }
      if (!formData.model.trim()) {
        nextErrors.model = "Enter or select the vehicle model.";
      }
      if (!formData.vehicleType) {
        nextErrors.vehicleType = "Choose the vehicle type.";
      }
      if (!formData.vehicleRunning) {
        nextErrors.vehicleRunning = "Let us know if the vehicle is running.";
      }
    }

    if (step === 3) {
      if (!formData.firstAvailablePickupDate) {
        nextErrors.firstAvailablePickupDate = "Choose the first available pickup date.";
      }
      if (!formData.pickupFlexibility) {
        nextErrors.pickupFlexibility = "Select pickup flexibility.";
      }
      if (!formData.customerType) {
        nextErrors.customerType = "Select the customer type.";
      }
    }

    if (step === 4) {
      if (!formData.fullName.trim()) {
        nextErrors.fullName = "Enter your full name.";
      }

      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length < 10) {
        nextErrors.phone = "Enter a valid phone number.";
      }

      const email = formData.email.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!formData.consent) {
        nextErrors.consent = "Please confirm that we can contact you about your quote.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    const payload: QuotePayload = {
      route: {
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        pickupStructured: formData.pickupStructured,
        deliveryStructured: formData.deliveryStructured,
      },
      vehicle: {
        year: formData.year,
        make: formData.make,
        model: formData.model,
        type: formData.vehicleType,
        running: formData.vehicleRunning,
      },
      shipment: {
        firstAvailablePickupDate: formData.firstAvailablePickupDate,
        pickupFlexibility: formData.pickupFlexibility,
        customerType: formData.customerType,
        notes: formData.notes,
      },
      contact: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        consent: formData.consent,
      },
      attribution: formData.attribution,
    };

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const currentAttribution = formData.attribution;
      setSubmitted(true);
      setFormData({
        ...initialData,
        attribution: currentAttribution,
      });
      setCurrentStep(1);
      setErrors({});
    } catch {
      setSubmitError(
        "We couldn’t send your request right now. Please try again in a moment or reach out directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((step) => Math.min(steps.length, step + 1));
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  return (
    <div
      id="quote-form"
      className="card-surface rounded-[2.25rem] p-5 sm:p-8 lg:p-10 xl:px-12 xl:py-11"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
                Quote Request
              </p>
              <h2 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">
                Request pricing and availability
              </h2>
            </div>
            <p className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {currentStep} / {steps.length}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <StepHeader currentStep={currentStep} steps={steps} />

        {submitted ? (
          <div className="fade-slide rounded-[1.75rem] bg-teal-50 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Request received
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">
              Your quote request is on its way to Organized Auto Transport
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Thanks for sending the details. A team member can now review the route, vehicle, and
              timing information and follow up with pricing and availability.
            </p>
            <button
              type="button"
              className="primary-button mt-8"
              onClick={() => setSubmitted(false)}
            >
              Start another request
            </button>
          </div>
        ) : (
          <form className="fade-slide" onSubmit={handleSubmit} noValidate>
            {currentStep === 1 ? (
              <div className="grid gap-6">
                <AddressAutocomplete
                  id="pickupAddress"
                  label="Pickup address"
                  placeholder="Street address, city, state, or ZIP"
                  value={formData.pickupAddress}
                  onChange={(value) => updateField("pickupAddress", value)}
                  onSelect={(value) => updateField("pickupStructured", value)}
                  error={errors.pickupAddress}
                  helperText="U.S. pickup suggestions are limited to relevant domestic locations."
                />
                <AddressAutocomplete
                  id="deliveryAddress"
                  label="Delivery address"
                  placeholder="Street address, city, state, or ZIP"
                  value={formData.deliveryAddress}
                  onChange={(value) => updateField("deliveryAddress", value)}
                  onSelect={(value) => updateField("deliveryStructured", value)}
                  error={errors.deliveryAddress}
                  helperText="A street address, city/state, or ZIP is enough to start your quote."
                />
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="year" className="field-label">
                    Vehicle year
                  </label>
                  <select
                    id="year"
                    className={cn("input-base", errors.year && "border-red-300")}
                    value={formData.year}
                    onChange={(event) => {
                      updateField("year", event.target.value);
                      updateField("model", "");
                    }}
                  >
                    <option value="">Select year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.year ? <p className="error-text mt-2">{errors.year}</p> : null}
                </div>

                <SearchAutocomplete
                  id="make"
                  label="Vehicle make"
                  placeholder={makesLoading ? "Loading makes..." : "Start typing make"}
                  value={formData.make}
                  suggestions={makes}
                  loading={makesLoading}
                  onChange={(value) => {
                    updateField("make", value);
                    updateField("model", "");
                  }}
                  onSelect={(value) => {
                    updateField("make", value);
                    updateField("model", "");
                  }}
                  error={errors.make}
                  emptyMessage="Keep typing to find the correct make."
                  allowCustomValue={false}
                  minQueryLength={1}
                />

                <SearchAutocomplete
                  id="model"
                  label="Vehicle model"
                  placeholder={canSearchModels ? "Start typing model" : "Select year and make first"}
                  value={formData.model}
                  suggestions={models}
                  loading={modelsLoading}
                  disabled={!canSearchModels}
                  onChange={(value) => updateField("model", value)}
                  onSelect={(value) => updateField("model", value)}
                  error={errors.model}
                  helperText={
                    canSearchModels
                      ? "If the exact model does not appear, you can enter it directly."
                      : "Choose the year and make first to unlock model suggestions."
                  }
                  emptyMessage="No close match found yet. You can keep typing the exact model."
                  allowCustomValue
                  minQueryLength={1}
                />

                <div>
                  <label htmlFor="vehicleType" className="field-label">
                    Vehicle type
                  </label>
                  <select
                    id="vehicleType"
                    className={cn("input-base", errors.vehicleType && "border-red-300")}
                    value={formData.vehicleType}
                    onChange={(event) => updateField("vehicleType", event.target.value)}
                  >
                    <option value="">Select type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleType ? (
                    <p className="error-text mt-2">{errors.vehicleType}</p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <fieldset>
                    <legend className="field-label">Is the vehicle running?</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {runningOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={cn(
                            "rounded-[1.1rem] border px-4 py-4 text-left transition-colors",
                            formData.vehicleRunning === option
                              ? "border-teal-600 bg-teal-50 text-slate-900"
                              : "border-slate-200 bg-white text-slate-600",
                          )}
                          onClick={() => updateField("vehicleRunning", option)}
                        >
                          <span className="block text-sm font-semibold">{option}</span>
                          <span className="mt-1 block text-sm text-slate-500">
                            {option === "Yes"
                              ? "Standard loading and unloading"
                              : "We can account for special equipment needs"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {errors.vehicleRunning ? (
                    <p className="error-text mt-2">{errors.vehicleRunning}</p>
                  ) : null}
                </div>

                {vehicleApiMessage ? (
                  <div className="sm:col-span-2 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    {vehicleApiMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pickupDate" className="field-label">
                    First available pickup date
                  </label>
                  <input
                    id="pickupDate"
                    type="date"
                    className={cn(
                      "input-base",
                      errors.firstAvailablePickupDate && "border-red-300",
                    )}
                    value={formData.firstAvailablePickupDate}
                    onChange={(event) => updateField("firstAvailablePickupDate", event.target.value)}
                  />
                  {errors.firstAvailablePickupDate ? (
                    <p className="error-text mt-2">{errors.firstAvailablePickupDate}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="pickupFlexibility" className="field-label">
                    Pickup flexibility
                  </label>
                  <select
                    id="pickupFlexibility"
                    className={cn("input-base", errors.pickupFlexibility && "border-red-300")}
                    value={formData.pickupFlexibility}
                    onChange={(event) => updateField("pickupFlexibility", event.target.value)}
                  >
                    {flexibilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.pickupFlexibility ? (
                    <p className="error-text mt-2">{errors.pickupFlexibility}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="customerType" className="field-label">
                    Customer type
                  </label>
                  <select
                    id="customerType"
                    className={cn("input-base", errors.customerType && "border-red-300")}
                    value={formData.customerType}
                    onChange={(event) => updateField("customerType", event.target.value)}
                  >
                    {customerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.customerType ? (
                    <p className="error-text mt-2">{errors.customerType}</p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="field-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={5}
                    className="input-base resize-none"
                    value={formData.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Anything else we should know about timing, access, vehicle condition, or destination?"
                  />
                  <p className="helper-text mt-2">
                    Optional details like gated access, non-running notes, or schedule preferences.
                  </p>
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="field-label">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    className={cn("input-base", errors.fullName && "border-red-300")}
                    value={formData.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {errors.fullName ? <p className="error-text mt-2">{errors.fullName}</p> : null}
                </div>

                <div>
                  <label htmlFor="phone" className="field-label">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className={cn("input-base", errors.phone && "border-red-300")}
                    value={formData.phone}
                    onChange={(event) => updateField("phone", formatPhoneNumber(event.target.value))}
                    placeholder="(555) 555-5555"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  {errors.phone ? <p className="error-text mt-2">{errors.phone}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="field-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={cn("input-base", errors.email && "border-red-300")}
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email ? <p className="error-text mt-2">{errors.email}</p> : null}
                </div>

                <div className="sm:col-span-2 rounded-[1.25rem] bg-slate-50 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(event) => updateField("consent", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                    />
                    <span className="text-sm leading-6 text-slate-600">
                      I agree to be contacted by Organized Auto Transport about this quote request.
                    </span>
                  </label>
                  {errors.consent ? <p className="error-text mt-2">{errors.consent}</p> : null}
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-6 rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {submitError}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-6 text-slate-500">
                No obligation. Just the details needed to review pricing and availability.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {currentStep > 1 ? (
                  <button type="button" className="secondary-button" onClick={handleBack}>
                    Back
                  </button>
                ) : null}
                {currentStep < steps.length ? (
                  <button type="button" className="primary-button" onClick={handleNext}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className="primary-button" disabled={submitting}>
                    {submitting ? "Sending request..." : "Request my quote"}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
