export type AddressSuggestion = {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

export type QuotePayload = {
  route: {
    pickupAddress: string;
    deliveryAddress: string;
    pickupStructured?: AddressSuggestion | null;
    deliveryStructured?: AddressSuggestion | null;
  };
  vehicle: {
    year: string;
    make: string;
    model: string;
    type: string;
    running: string;
  };
  shipment: {
    firstAvailablePickupDate: string;
    pickupFlexibility: string;
    customerType: string;
    notes: string;
  };
  contact: {
    fullName: string;
    phone: string;
    email: string;
    consent: boolean;
  };
  attribution: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term: string;
    utm_content: string;
    gclid: string;
    fbclid: string;
    referrer: string;
    landing_page_url: string;
  };
};
