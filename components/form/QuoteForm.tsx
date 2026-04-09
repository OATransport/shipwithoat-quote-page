"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AddressAutocomplete } from "@/components/form/AddressAutocomplete";
import { SearchAutocomplete } from "@/components/form/SearchAutocomplete";
import { StepHeader } from "@/components/form/StepHeader";
import { customerTypes, flexibilityOptions, runningOptions, vehicleTypes, years } from "@/lib/constants";
import { AddressSuggestion, QuotePayload } from "@/lib/types";
import { canonicalizeVehicleMake } from "@/lib/vehicle-data";
import { cn, formatPhoneNumber } from "@/lib/utils";

type VehicleFormEntry = {
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  vehicleRunning: string;
};

type VehicleErrors = Partial<Record<keyof VehicleFormEntry, string>>;

type QuoteFormData = {
  pickupAddress: string;
  deliveryAddress: string;
  pickupStructured: AddressSuggestion | null;
  deliveryStructured: AddressSuggestion | null;
  vehicles: VehicleFormEntry[];
  firstAvailablePickupDate: string;
  pickupFlexibility: string;
  customerType: string;
  notes: string;
  fullName: string;
  phone: string;
  email: string;
  smsConsent: boolean;
  attribution: QuotePayload["attribution"];
};

type ErrorMap = Partial<{
  pickupAddress: string;
  deliveryAddress: string;
  firstAvailablePickupDate: string;
  pickupFlexibility: string;
  customerType: string;
  fullName: string;
  phone: string;
  email: string;
}>;

const steps = [
  { title: "Route", description: "Pickup and delivery" },
  { title: "Vehicle", description: "Year, make, and model" },
  { title: "Shipment", description: "Timing and preferences" },
  { title: "Contact", description: "Where to send the quote" },
];

const PRIVACY_POLICY_URL = "https://www.shipwithoat.com/privacy-policy";
const TERMS_URL = "https://www.shipwithoat.com/terms-and-conditions";

function emptyVehicle(): VehicleFormEntry {
  return {
    year: "",
    make: "",
    model: "",
    vehicleType: "",
    vehicleRunning: "Yes",
  };
}

const initialData: QuoteFormData = {
  pickupAddress: "",
  deliveryAddress: "",
  pickupStructured: null,
  deliveryStructured: null,
  vehicles: [emptyVehicle()],
  firstAvailablePickupDate: "",
  pickupFlexibility: "Flexible",
  customerType: "Individual",
  notes: "",
  fullName: "",
  phone: "",
  email: "",
  smsConsent: false,
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
  const [vehicleErrors, setVehicleErrors] = useState<VehicleErrors[]>([{}]);
  const [makes, setMakes] = useState<string[]>([]);
  const [makesLoading, setMakesLoading] = useState(true);
  const [modelsByIndex, setModelsByIndex] = useState<Record<number, string[]>>({});
  const [modelsLoadingByIndex, setModelsLoadingByIndex] = useState<Record<number, boolean>>({});
  const [vehicleApiMessage, setVehicleApiMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const vehicleModelsSignature = useMemo(
    () => formData.vehicles.map((v, i) => `${i}:${v.year}:${v.make}`).join("¦"),
    [formData.vehicles],
  );

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
    let cancelled = false;
    const vehicles = formData.vehicles;
    const count = vehicles.length;

    async function loadModelsForAll() {
      const loading: Record<number, boolean> = {};
      for (let i = 0; i < count; i++) {
        const v = vehicles[i];
        if (v?.year && v?.make) {
          loading[i] = true;
        }
      }
      setModelsLoadingByIndex(loading);

      const nextModels: Record<number, string[]> = {};
      let anyFallback = false;
      let anyCatch = false;

      for (let i = 0; i < count; i++) {
        const v = vehicles[i];
        if (!v?.year || !v?.make) {
          nextModels[i] = [];
          continue;
        }

        try {
          const response = await fetch(
            `/api/vehicle/models?year=${encodeURIComponent(v.year)}&make=${encodeURIComponent(v.make)}`,
          );
          const data = (await response.json()) as { models?: string[]; fallback?: boolean };

          if (cancelled) {
            return;
          }

          nextModels[i] = data.models ?? [];
          if (data.fallback) {
            anyFallback = true;
          }
        } catch {
          if (cancelled) {
            return;
          }
          nextModels[i] = [];
          anyCatch = true;
        }
      }

      if (cancelled) {
        return;
      }

      setModelsByIndex(nextModels);
      setModelsLoadingByIndex({});

      if (anyCatch) {
        setVehicleApiMessage(
          "Model suggestions are temporarily limited, but you can still enter the model manually.",
        );
      } else if (anyFallback) {
        setVehicleApiMessage(
          "Model suggestions are limited for one or more selections, but you can still enter the exact model.",
        );
      } else {
        setVehicleApiMessage((prev) =>
          prev.startsWith("Model suggestions") || prev.includes("enter the model manually")
            ? ""
            : prev,
        );
      }
    }

    loadModelsForAll();

    return () => {
      cancelled = true;
    };
  }, [vehicleModelsSignature]);

  const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep]);

  function updateField<K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateVehicleField(index: number, key: keyof VehicleFormEntry, value: string) {
    setFormData((current) => ({
      ...current,
      vehicles: current.vehicles.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    }));
    setVehicleErrors((current) =>
      current.map((e, i) => (i === index ? { ...e, [key]: undefined } : e)),
    );
  }

  function addVehicle() {
    setFormData((current) => ({
      ...current,
      vehicles: [...current.vehicles, emptyVehicle()],
    }));
    setVehicleErrors((current) => [...current, {}]);
  }

  function removeVehicle(index: number) {
    setFormData((current) => {
      if (current.vehicles.length <= 1) {
        return current;
      }
      return {
        ...current,
        vehicles: current.vehicles.filter((_, i) => i !== index),
      };
    });
    setVehicleErrors((current) => {
      if (current.length <= 1) {
        return current;
      }
      return current.filter((_, i) => i !== index);
    });
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
      const ve: VehicleErrors[] = formData.vehicles.map(() => ({}));
      formData.vehicles.forEach((v, i) => {
        if (!v.year) {
          ve[i]!.year = "Select the vehicle year.";
        }
        if (!canonicalizeVehicleMake(v.make) && !makes.some((make) => make === v.make)) {
          ve[i]!.make = "Choose the vehicle make from the search suggestions.";
        }
        if (!v.model.trim()) {
          ve[i]!.model = "Enter or select the vehicle model.";
        }
        if (!v.vehicleType) {
          ve[i]!.vehicleType = "Choose the vehicle type.";
        }
        if (!v.vehicleRunning) {
          ve[i]!.vehicleRunning = "Let us know if the vehicle is running.";
        }
      });
      setVehicleErrors(ve);
      const hasVehicleIssues = ve.some((row) => Object.keys(row).length > 0);
      if (hasVehicleIssues) {
        setErrors(nextErrors);
        return false;
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
      vehicles: formData.vehicles.map((v) => ({
        year: v.year,
        make: v.make,
        model: v.model,
        type: v.vehicleType,
        running: v.vehicleRunning,
      })),
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
        smsConsent: formData.smsConsent,
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
      setVehicleErrors([{}]);
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

    setCurrentStep((s) => Math.min(steps.length, s + 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(1, s - 1));
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
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-800">
                Quote Request
              </p>
              <h2 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
                Request pricing and availability
              </h2>
            </div>
            <p className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {currentStep} / {steps.length}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200/80">
            <div
              className="progress-bar-fill h-1.5 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <StepHeader currentStep={currentStep} steps={steps} />

        {submitted ? (
          <div className="form-success-panel fade-slide rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-800">
              Request received
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              Your quote request is on its way to Organized Auto Transport
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Thanks for sending the details. A team member can now review the route, vehicle, and
              timing information and follow up with pricing and availability.
            </p>
            <button
              type="button"
              className="primary-button mt-8"
              onClick={() => {
                setSubmitted(false);
                setVehicleErrors([{}]);
              }}
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
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
                  <p className="text-sm leading-6 text-slate-600">
                    By submitting this request, you may receive non-marketing text messages related
                    to your quote and transport updates. Message frequency may vary. Message &
                    data rates may apply. View our{" "}
                    <a
                      href={PRIVACY_POLICY_URL}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href={TERMS_URL}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Terms & Conditions
                    </a>
                    .
                  </p>
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="flex flex-col gap-6">
                {formData.vehicles.map((vehicle, index) => {
                  const errs = vehicleErrors[index] ?? {};
                  const canSearchModels = Boolean(vehicle.year && vehicle.make);
                  const models = modelsByIndex[index] ?? [];
                  const modelsLoading = Boolean(modelsLoadingByIndex[index]);

                  return (
                    <div
                      key={`vehicle-${index}`}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-white/50 p-5 sm:p-6"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <p className="field-label !mb-0">
                          Vehicle {index + 1}
                          {formData.vehicles.length > 1 ? ` of ${formData.vehicles.length}` : ""}
                        </p>
                        {formData.vehicles.length > 1 ? (
                          <button
                            type="button"
                            className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900"
                            onClick={() => removeVehicle(index)}
                          >
                            Remove vehicle
                          </button>
                        ) : null}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`vehicle-${index}-year`} className="field-label">
                            Vehicle year
                          </label>
                          <select
                            id={`vehicle-${index}-year`}
                            className={cn("input-base", errs.year && "border-red-300")}
                            value={vehicle.year}
                            onChange={(event) => {
                              updateVehicleField(index, "year", event.target.value);
                              updateVehicleField(index, "model", "");
                            }}
                          >
                            <option value="">Select year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          {errs.year ? <p className="error-text mt-2">{errs.year}</p> : null}
                        </div>

                        <SearchAutocomplete
                          id={`vehicle-${index}-make`}
                          label="Vehicle make"
                          placeholder={makesLoading ? "Loading makes..." : "Start typing make"}
                          value={vehicle.make}
                          suggestions={makes}
                          loading={makesLoading}
                          onChange={(value) => {
                            updateVehicleField(index, "make", value);
                            updateVehicleField(index, "model", "");
                          }}
                          onSelect={(value) => {
                            updateVehicleField(index, "make", value);
                            updateVehicleField(index, "model", "");
                          }}
                          error={errs.make}
                          emptyMessage="Keep typing to find the correct make."
                          allowCustomValue={false}
                          minQueryLength={1}
                        />

                        <SearchAutocomplete
                          id={`vehicle-${index}-model`}
                          label="Vehicle model"
                          placeholder={
                            canSearchModels ? "Start typing model" : "Select year and make first"
                          }
                          value={vehicle.model}
                          suggestions={models}
                          loading={modelsLoading}
                          disabled={!canSearchModels}
                          onChange={(value) => updateVehicleField(index, "model", value)}
                          onSelect={(value) => updateVehicleField(index, "model", value)}
                          error={errs.model}
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
                          <label htmlFor={`vehicle-${index}-type`} className="field-label">
                            Vehicle type
                          </label>
                          <select
                            id={`vehicle-${index}-type`}
                            className={cn("input-base", errs.vehicleType && "border-red-300")}
                            value={vehicle.vehicleType}
                            onChange={(event) =>
                              updateVehicleField(index, "vehicleType", event.target.value)
                            }
                          >
                            <option value="">Select type</option>
                            {vehicleTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {errs.vehicleType ? (
                            <p className="error-text mt-2">{errs.vehicleType}</p>
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
                                    vehicle.vehicleRunning === option
                                      ? "border-blue-700 bg-blue-50 text-slate-950 shadow-sm shadow-blue-900/5"
                                      : "border-slate-200 bg-white text-slate-600",
                                  )}
                                  onClick={() => updateVehicleField(index, "vehicleRunning", option)}
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
                          {errs.vehicleRunning ? (
                            <p className="error-text mt-2">{errs.vehicleRunning}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button type="button" className="secondary-button w-full sm:w-auto" onClick={addVehicle}>
                  Add Another Vehicle
                </button>

                {vehicleApiMessage ? (
                  <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
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
                      checked={formData.smsConsent}
                      onChange={(event) => updateField("smsConsent", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0"
                    />
                    <span className="text-sm leading-6 text-slate-600">
                      I consent to receive non-marketing text messages from Organized Auto
                      Transport about my quote request, pricing follow-up, and transport updates.
                      Message frequency may vary. Message & data rates may apply. Text HELP for
                      assistance, reply STOP to opt out. Consent is not a condition of purchase.
                    </span>
                  </label>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    By submitting this form, you agree to our{" "}
                    <a
                      href={PRIVACY_POLICY_URL}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href={TERMS_URL}
                      className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Terms & Conditions
                    </a>
                    .
                  </p>
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
