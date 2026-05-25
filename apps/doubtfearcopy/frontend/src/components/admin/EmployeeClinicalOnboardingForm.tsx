import React, { useEffect, useMemo, useRef, useState } from 'react';

type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

type TimeSlot = {
  start_time: string;
  end_time: string;
  label: string;
};

type ServiceTemplate = {
  name: string;
  price: number;
  durationMins: number;
};

type ClinicalSubcategoryConfig = {
  emoji: string;
  label: string;
  tag: string;
  coreServices: ServiceTemplate[];
  optionalServices: ServiceTemplate[];
};

type ServiceFormState = {
  id: string;
  enabled: boolean;
  name: string;
  price: string;
  durationMins: string;
  bookingType: 'single';
  subcategoryTag: string;
  category: string;
  weekdaySlots: TimeSlot[];
  sundaySlots: TimeSlot[];
};

type EmployeeClinicalOnboardingFormProps = {
  mode: 'physiotherapy' | 'healthcare';
  pageTitle: string;
  pageDescription: string;
  categoryLabel: string;
};

const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const BANGALORE_FOCUS_CITIES = ['Bangalore', 'Hyderabad'];
const HEALTHCARE_BUSINESS_TYPE = 'HealthCare';
const PHYSIOTHERAPY_BUSINESS_TYPE = 'Physiotherapy';

const DEFAULT_SPLIT_SHIFT_SLOTS: TimeSlot[] = [
  { label: 'Morning', start_time: '09:00', end_time: '13:00' },
  { label: 'Evening', start_time: '16:00', end_time: '20:00' },
];

const DEFAULT_SUNDAY_SLOTS: TimeSlot[] = [
  { label: 'Sunday Morning', start_time: '10:00', end_time: '13:00' },
];

const createServiceId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const cloneSlots = (slots: TimeSlot[]) => slots.map((slot) => ({ ...slot }));

const asServices = (names: string[], price: number, durationMins: number): ServiceTemplate[] =>
  names.map((name) => ({ name, price, durationMins }));

const PHYSIOTHERAPY_CORE_SERVICES: ServiceTemplate[] = [
  { name: 'Exercise therapy', price: 500, durationMins: 45 },
  { name: 'Electrotherapy', price: 600, durationMins: 45 },
  { name: 'Matrix rhythm therapy', price: 3000, durationMins: 60 },
  { name: 'Laser therapy', price: 500, durationMins: 30 },
  { name: 'Dry needle', price: 1500, durationMins: 60 },
  { name: 'Migun therapy', price: 1200, durationMins: 45 },
];

const PHYSIOTHERAPY_OPTIONAL_SERVICES: ServiceTemplate[] = [
  { name: 'Dry Needling', price: 1500, durationMins: 60 },
  { name: 'Cupping Therapy', price: 1000, durationMins: 45 },
  { name: 'Orthopedic Assessment', price: 800, durationMins: 45 },
];

const HEALTHCARE_SUBCATEGORIES: ClinicalSubcategoryConfig[] = [
  {
    emoji: '🏥',
    label: 'General Physician',
    tag: 'general_physician',
    coreServices: [
      { name: 'General Consultation', price: 400, durationMins: 15 },
      { name: 'Follow-up Consultation', price: 250, durationMins: 10 },
    ],
    optionalServices: [
      { name: 'Health Checkup & Screening', price: 999, durationMins: 30 },
      { name: 'Chronic Disease Management', price: 500, durationMins: 20 },
      ...asServices([
        'Diabetes',
        'Hypertension Screening',
        'Thyroid Disorders',
        'Lifestyle Management',
        'Dengue',
        'Typhoid',
        'Malaria',
        'Fever Evaluation',
        'Obesity & Weight Management',
        'Geriatric Care',
        'Allergy Management',
      ], 400, 15),
    ],
  },
  {
    emoji: '🧴',
    label: 'Skin, Hair & Nails',
    tag: 'skin_hair_nails',
    coreServices: [{ name: 'Skin Disease Treatment', price: 400, durationMins: 15 }],
    optionalServices: [],
  },
  {
    emoji: '👂',
    label: 'Ear, Nose & Throat',
    tag: 'ear_nose_throat',
    coreServices: [
      { name: 'OP Consultation', price: 600, durationMins: 10 },
      { name: 'Diagnostic Endoscopy - Ear', price: 500, durationMins: 15 },
      { name: 'Diagnostic Endoscopy - Nose', price: 1000, durationMins: 15 },
      { name: 'Diagnostic Endoscopy - Throat', price: 1000, durationMins: 15 },
      { name: 'Ear Dewaxing (each)', price: 600, durationMins: 20 },
      { name: 'Cleaning of Infected ear (each)', price: 600, durationMins: 20 },
      { name: 'Piercing - One Ear', price: 2000, durationMins: 20 },
      { name: 'Piercing - Both Ears', price: 4000, durationMins: 20 },
      { name: 'Piercing - Nose', price: 2000, durationMins: 20 },
      { name: 'Ear Lobe Repair (each)', price: 3000, durationMins: 30 },
      { name: 'Foreign Body Removal', price: 2000, durationMins: 30 },
      { name: 'Minor Surgical Procedures', price: 2000, durationMins: 45 },
    ],
    optionalServices: [],
  },
  {
    emoji: '🧪',
    label: 'Liver & Intestines',
    tag: 'liver_intestines',
    coreServices: [{ name: 'Liver Issues', price: 400, durationMins: 15 }],
    optionalServices: [],
  },
  {
    emoji: '➕',
    label: 'Stomach & Digestion',
    tag: 'stomach_digestion',
    coreServices: asServices(['IBS', 'Peptic / Gastric Ulcer Treatment'], 400, 15),
    optionalServices: [],
  },
  {
    emoji: '🔥',
    label: 'Acidity & Gastric',
    tag: 'acidity_gastric',
    coreServices: [{ name: 'Acidity / Gastric Disorders', price: 400, durationMins: 15 }],
    optionalServices: [],
  },
  {
    emoji: '👁️',
    label: 'Eyes',
    tag: 'eyes',
    coreServices: [
      { name: 'Comprehensive Eye Examination', price: 400, durationMins: 20 },
      { name: 'Adult Comprehensive Eye Examination', price: 400, durationMins: 20 },
    ],
    optionalServices: [
      { name: 'Refraction & Vision Testing', price: 250, durationMins: 15 },
      { name: 'Glaucoma Screening', price: 600, durationMins: 15 },
      ...asServices([
        'Pediatric Eye Examination',
        'Myopia & Amblyopia Treatment',
        'Neuro-Ophthalmology',
        'Uveitis',
        'Glaucoma',
        'Cataract Evaluation',
        'Medical Retina',
        'Diabetic Retinopathy',
        'Hypertensive Retinopathy',
        'ARMD',
        'Other Retinal conditions',
        'Dry Eye',
        'Computer Vision Syndrome',
      ], 250, 15),
    ],
  },
  {
    emoji: '🦴',
    label: 'Bones, Muscles & Joints',
    tag: 'bones_muscles_joints',
    coreServices: [{ name: 'Orthopedic Consultation', price: 500, durationMins: 20 }],
    optionalServices: [
      { name: 'Intra-articular Injection', price: 1200, durationMins: 15 },
      { name: 'Fracture Care & Dressing', price: 800, durationMins: 30 },
      { name: 'Joints and Musculoskeletal Disorders', price: 500, durationMins: 20 },
    ],
  },
  {
    emoji: '🦷',
    label: 'Dental Consultation',
    tag: 'dental_consultation',
    coreServices: [{ name: 'Dental Consultation', price: 400, durationMins: 20 }],
    optionalServices: [],
  },
  {
    emoji: '❤️',
    label: 'Heart & Blood',
    tag: 'heart_blood',
    coreServices: asServices(['Cardiac Risk Assessment', 'Hypertension Treatment'], 600, 15),
    optionalServices: [],
  },
  {
    emoji: '🩹',
    label: 'Surgery (General & Special)',
    tag: 'surgery_general_special',
    coreServices: [{ name: 'Surgery Consultation', price: 600, durationMins: 20 }],
    optionalServices: [],
  },
  {
    emoji: '🫘',
    label: 'Kidney & Urine',
    tag: 'kidney_urine',
    coreServices: [{ name: 'Kidney & Urine Consultation', price: 500, durationMins: 20 }],
    optionalServices: [],
  },
  {
    emoji: '🧠',
    label: 'Brain, Nerves & Neuro',
    tag: 'brain_nerves_neuro',
    coreServices: asServices([
      'Epilepsy',
      'Stroke',
      'Movement disorders',
      'Neuroimmune disorders',
      'Giddiness & Vertigo',
      'Neuro-opthalmology',
      'Other neurological disorders',
      'Multiple Sclerosis',
      'Cognitive Neurology',
      'Headache & facial pain',
      'Unconsciousness',
      'Leg and Arm pain',
      'Pediatric Neurology',
      'Neuro Rehabilitation',
      'Demyelinating Disorders',
      'Peripheral Neuropathies',
      'Neck & Back Pain',
      'Neuropsychiatry',
      'Sleep Disorders',
      'Neurosurgery',
      'Holistic Neurology',
    ], 600, 20),
    optionalServices: [],
  },
  {
    emoji: '🌸',
    label: "Women's Health & Gyno",
    tag: 'Gynaecologist',
    coreServices: [
      { name: 'Gynaecology Consultation', price: 600, durationMins: 20 },
      { name: 'Antenatal Routine Checkup', price: 700, durationMins: 20 },
    ],
    optionalServices: [
      { name: 'Pelvic Ultrasound Scan', price: 1500, durationMins: 30 },
      { name: 'Infertility Consultation', price: 1000, durationMins: 30 },
      { name: 'PCOD/PCOS Treatment', price: 600, durationMins: 20 },
    ],
  },
  {
    emoji: '🫁',
    label: 'Respiratory',
    tag: 'respiratory',
    coreServices: asServices(['Asthma', 'COPD', 'Pneumonia', 'Allergy', 'Respiratory Issue Management'], 400, 15),
    optionalServices: [],
  },
  {
    emoji: '👶',
    label: 'Pediatrics & Child Health',
    tag: 'Pediatrics',
    coreServices: asServices([
      'General Consultation',
      'Vaccination Centre',
      'General Paediatric Care',
      'Nutrition & Weaning Counselling',
    ], 600, 20),
    optionalServices: [],
  },
  {
    emoji: '🌿',
    label: 'Homeopathy',
    tag: 'homeopathy',
    coreServices: [{ name: 'Homeopathic Treatments', price: 400, durationMins: 15 }],
    optionalServices: [],
  },
];

const PHYSIOTHERAPY_CONFIG: ClinicalSubcategoryConfig = {
  emoji: '🦵',
  label: 'Physiotherapy',
  tag: 'physiotherapy',
  coreServices: PHYSIOTHERAPY_CORE_SERVICES,
  optionalServices: PHYSIOTHERAPY_OPTIONAL_SERVICES,
};

const createServiceFromTemplate = (
  template: ServiceTemplate,
  category: string,
  subcategoryTag: string,
  enabled = true
): ServiceFormState => ({
  id: createServiceId(),
  enabled,
  name: template.name,
  price: String(template.price),
  durationMins: String(template.durationMins),
  bookingType: 'single',
  subcategoryTag,
  category,
  weekdaySlots: cloneSlots(DEFAULT_SPLIT_SHIFT_SLOTS),
  sundaySlots: [],
});

const buildServicesForConfig = (config: ClinicalSubcategoryConfig, category: string) =>
  config.coreServices.map((service) => createServiceFromTemplate(service, category, config.tag));

const createBlankHealthcareService = (category: string, subcategoryTag: string): ServiceFormState => ({
  id: createServiceId(),
  enabled: true,
  name: '',
  price: '400',
  durationMins: '15',
  bookingType: 'single',
  subcategoryTag,
  category,
  weekdaySlots: cloneSlots(DEFAULT_SPLIT_SHIFT_SLOTS),
  sundaySlots: [],
});

const buildPrefixedTag = (serviceTag: string, selectedTags: string[]) => {
  if (!selectedTags.includes('homeopathy') || serviceTag === 'homeopathy') {
    return serviceTag;
  }

  return `homeopathy_${serviceTag}`;
};

const buildTimeSlots = (weekdaySlots: TimeSlot[], sundaySlots: TimeSlot[], servicePrice: number) => {
  const timeSlots: Record<string, Array<{ start_time: string; end_time: string; label: string; price: number }>> = {};

  WEEKDAYS.forEach((day) => {
    timeSlots[day] = weekdaySlots
      .filter((slot) => slot.start_time && slot.end_time)
      .map((slot) => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        label: slot.label,
        price: servicePrice,
      }));
  });

  if (sundaySlots.length > 0) {
    timeSlots.Sunday = sundaySlots
      .filter((slot) => slot.start_time && slot.end_time)
      .map((slot) => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        label: slot.label,
        price: servicePrice,
      }));
  }

  return timeSlots;
};

const toServicePayload = (
  service: ServiceFormState,
  selectedTags: string[],
  sharedTimingSlots?: { weekdaySlots: TimeSlot[]; sundaySlots: TimeSlot[] }
) => {
  const servicePrice = Number(service.price) || 0;
  const timeSlots = buildTimeSlots(
    sharedTimingSlots?.weekdaySlots ?? service.weekdaySlots,
    sharedTimingSlots?.sundaySlots ?? service.sundaySlots,
    servicePrice
  );

  return {
    name: service.name.trim(),
    price: servicePrice,
    durationMins: Number(service.durationMins) || 0,
    bookingType: service.bookingType,
    category: service.category,
    subcategoryTag: buildPrefixedTag(service.subcategoryTag, selectedTags),
    operatingDays: Object.entries(timeSlots)
      .filter(([, slots]) => Array.isArray(slots) && slots.length > 0)
      .map(([day]) => day),
    timeSlots,
  };
};

const EmployeeClinicalOnboardingForm: React.FC<EmployeeClinicalOnboardingFormProps> = ({
  mode,
  pageTitle,
  pageDescription,
  categoryLabel,
}) => {
  const businessType = mode === 'healthcare' ? HEALTHCARE_BUSINESS_TYPE : PHYSIOTHERAPY_BUSINESS_TYPE;
  const defaultConfig = mode === 'healthcare' ? HEALTHCARE_SUBCATEGORIES[0] : PHYSIOTHERAPY_CONFIG;
  const isHealthcare = mode === 'healthcare';

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [doctorQualifications, setDoctorQualifications] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([defaultConfig.tag]);
  const [services, setServices] = useState<ServiceFormState[]>(() => buildServicesForConfig(defaultConfig, businessType));
  const [sharedWeekdaySlots, setSharedWeekdaySlots] = useState<TimeSlot[]>(() => cloneSlots(DEFAULT_SPLIT_SHIFT_SLOTS));
  const [sharedSundaySlots, setSharedSundaySlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentlyAddedServiceId, setRecentlyAddedServiceId] = useState<string | null>(null);
  const serviceRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedConfigs = useMemo(() => {
    if (!isHealthcare) return [PHYSIOTHERAPY_CONFIG];
    return HEALTHCARE_SUBCATEGORIES.filter((config) => selectedTags.includes(config.tag));
  }, [isHealthcare, selectedTags]);

  const optionalServices = useMemo(
    () => selectedConfigs.flatMap((config) => config.optionalServices.map((service) => ({ ...service, tag: config.tag }))),
    [selectedConfigs]
  );

  const selectedServiceCount = useMemo(
    () => services.filter((service) => service.enabled && service.name.trim()).length,
    [services]
  );

  useEffect(() => {
    if (!recentlyAddedServiceId) return;

    const targetRow = serviceRowRefs.current[recentlyAddedServiceId];
    targetRow?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const highlightTimeout = window.setTimeout(() => {
      setRecentlyAddedServiceId(null);
    }, 1800);

    return () => window.clearTimeout(highlightTimeout);
  }, [recentlyAddedServiceId]);

  const updateService = (serviceId: string, updater: (service: ServiceFormState) => ServiceFormState) => {
    setServices((currentServices) =>
      currentServices.map((service) => (service.id === serviceId ? updater(service) : service))
    );
  };

  const appendServicesForConfig = (config: ClinicalSubcategoryConfig) => {
    setServices((currentServices) => {
      const existingKeys = new Set(
        currentServices.map((service) => `${service.subcategoryTag}:${service.name.trim().toLowerCase()}`)
      );
      const nextServices = buildServicesForConfig(config, businessType).filter(
        (service) => !existingKeys.has(`${service.subcategoryTag}:${service.name.trim().toLowerCase()}`)
      );

      return [...currentServices, ...nextServices];
    });
  };

  const handleHealthcareCategoryToggle = (config: ClinicalSubcategoryConfig) => {
    setSelectedTags((currentTags) => {
      const alreadySelected = currentTags.includes(config.tag);

      if (alreadySelected && currentTags.length === 1) {
        return currentTags;
      }

      if (alreadySelected) {
        setServices((currentServices) => currentServices.filter((service) => service.subcategoryTag !== config.tag));
        return currentTags.filter((tag) => tag !== config.tag);
      }

      appendServicesForConfig(config);
      return [...currentTags, config.tag];
    });
  };

  const handleAddOptionalService = (template: ServiceTemplate & { tag?: string }) => {
    const serviceTag = template.tag || defaultConfig.tag;

    setServices((currentServices) => {
      const nextService = createServiceFromTemplate(template, businessType, serviceTag);
      setRecentlyAddedServiceId(nextService.id);
      const insertAfterIndex = currentServices.reduce(
        (lastMatchedIndex, service, serviceIndex) =>
          service.subcategoryTag === serviceTag ? serviceIndex : lastMatchedIndex,
        -1
      );

      if (insertAfterIndex === -1) {
        return [...currentServices, nextService];
      }

      const nextServices = [...currentServices];
      nextServices.splice(insertAfterIndex + 1, 0, nextService);
      return nextServices;
    });
  };

  const handleAddBlankService = () => {
    setServices((currentServices) => {
      const serviceTag = selectedTags[selectedTags.length - 1] || defaultConfig.tag;
      const nextService = isHealthcare
        ? createBlankHealthcareService(businessType, serviceTag)
        : createServiceFromTemplate({ name: '', price: 400, durationMins: 15 }, businessType, serviceTag);
      
      setRecentlyAddedServiceId(nextService.id);
      
      const insertAfterIndex = currentServices.reduce(
        (lastMatchedIndex, service, serviceIndex) =>
          service.subcategoryTag === serviceTag ? serviceIndex : lastMatchedIndex,
        -1
      );

      if (insertAfterIndex === -1) {
        return [...currentServices, nextService];
      }

      const nextServices = [...currentServices];
      nextServices.splice(insertAfterIndex + 1, 0, nextService);
      return nextServices;
    });
  };

  const handleReset = () => {
    setEmail('');
    setPhoneNumber('');
    setBusinessName('');
    setLocation('');
    setGoogleMapsLink('');
    setDoctorQualifications('');
    setSelectedTags([defaultConfig.tag]);
    setServices(buildServicesForConfig(defaultConfig, businessType));
    setSharedWeekdaySlots(cloneSlots(DEFAULT_SPLIT_SHIFT_SLOTS));
    setSharedSundaySlots([]);
    setRecentlyAddedServiceId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const sharedTimingSlots = isHealthcare
      ? { weekdaySlots: sharedWeekdaySlots, sundaySlots: sharedSundaySlots }
      : undefined;
    const selectedServices = services
      .filter((service) => service.enabled && service.name.trim())
      .map((service) => toServicePayload(service, selectedTags, sharedTimingSlots));

    if (selectedServices.length === 0) {
      setError(`Select at least one ${categoryLabel.toLowerCase()} service before submitting.`);
      setIsLoading(false);
      return;
    }

    try {
      const { getApiUrl } = await import('../../utils/environmentUtils');
      const BACKEND_API_URL = getApiUrl();

      const response = await fetch(`${BACKEND_API_URL}/admin/onboard-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          businessName,
          location,
          googleMapsLink,
          doctorQualifications: isHealthcare ? doctorQualifications : undefined,
          bookingType: 'single',
          businessType,
          category: businessType,
          subcategoryTag: selectedTags[0],
          services: selectedServices,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to onboard clinic');
      }

      setSuccess(`${businessName || 'Clinic'} onboarded successfully. Tenant ID: ${data.tenantId}`);
      handleReset();
    } catch (submissionError: any) {
      setError(submissionError.message || 'An error occurred during onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-900 px-6 py-6 text-white sm:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">{categoryLabel}</p>
            <h1 className="mt-2 text-2xl font-semibold">{pageTitle}</h1>
            <p className="mt-2 max-w-4xl text-sm text-slate-300">{pageDescription}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 px-6 py-8 sm:px-8">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Manual Inputs</h2>
                  <p className="text-sm text-slate-500">
                    {isHealthcare
                      ? 'Only these six fields require direct admin entry.'
                      : 'Only these five fields require direct admin entry.'}
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Business Type: {businessType}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Doctor/Owner Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@clinic.com"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Practice/Clinic Name</label>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Relieve Physiotherapy"
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                {isHealthcare && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Doctor&apos;s Educational Qualifications
                    </label>
                    <input
                      required
                      type="text"
                      value={doctorQualifications}
                      onChange={(event) => setDoctorQualifications(event.target.value)}
                      placeholder="MBBS, MD, DNB"
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700">City Location Selection</label>
                  <select
                    required
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="" disabled>Select a city...</option>
                    {BANGALORE_FOCUS_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Google Maps Hyperlink</label>
                  <input
                    required
                    type="url"
                    value={googleMapsLink}
                    onChange={(event) => setGoogleMapsLink(event.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
            </section>

            {isHealthcare && (
              <section className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-semibold text-slate-900">Healthcare Category Selection</h2>
                  <p className="text-sm text-slate-500">
                    Select one or more categories. Core services load instantly in the same order as selected.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {HEALTHCARE_SUBCATEGORIES.map((config) => {
                    const selected = selectedTags.includes(config.tag);
                    return (
                      <button
                        key={config.tag}
                        type="button"
                        onClick={() => handleHealthcareCategoryToggle(config)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                          selected
                            ? 'border-sky-400 bg-sky-50 text-sky-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">{config.emoji}</span>
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedTags.includes('homeopathy') && selectedTags.length > 1 && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Homeopathy is selected with other categories, so those selected medical category tags will be saved with a homeopathy prefix in the backend payload.
                  </div>
                )}
              </section>
            )}

            {isHealthcare && (
              <section className="space-y-4">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Clinic / Doctor Timings</h2>
                    <p className="text-sm text-slate-500">
                      These timings are shared across every selected healthcare service and copied into each service slot payload.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Shared schedule
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Monday-Saturday Split Shift</h3>
                  <p className="text-sm text-slate-500">Defaults to 09:00-13:00 and 16:00-20:00 for all selected services.</p>
                  <div className="mt-4 space-y-3">
                    {sharedWeekdaySlots.map((slot, slotIndex) => (
                      <div
                        key={`shared-weekday-${slot.label}-${slotIndex}`}
                        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[56px_140px_1fr_1fr]"
                      >
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setSharedWeekdaySlots((currentSlots) => currentSlots.filter((_, index) => index !== slotIndex))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            aria-label={`Remove ${slot.label} shared weekday timing`}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-600">{slot.label}</div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Start</label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(event) =>
                              setSharedWeekdaySlots((currentSlots) => {
                                const nextSlots = [...currentSlots];
                                nextSlots[slotIndex] = { ...nextSlots[slotIndex], start_time: event.target.value };
                                return nextSlots;
                              })
                            }
                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">End</label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(event) =>
                              setSharedWeekdaySlots((currentSlots) => {
                                const nextSlots = [...currentSlots];
                                nextSlots[slotIndex] = { ...nextSlots[slotIndex], end_time: event.target.value };
                                return nextSlots;
                              })
                            }
                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {sharedSundaySlots.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setSharedSundaySlots(cloneSlots(DEFAULT_SUNDAY_SLOTS))}
                    className="inline-flex rounded-full border border-dashed border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                  >
                    + Add Sunday Timings
                  </button>
                )}

                {sharedSundaySlots.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Sunday Timings</h3>
                    <p className="text-sm text-slate-500">Sunday uses a separate doctor-average default for the full clinic schedule.</p>
                    <div className="mt-4 space-y-3">
                      {sharedSundaySlots.map((slot, slotIndex) => (
                        <div
                          key={`shared-sunday-${slot.label}-${slotIndex}`}
                          className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[56px_140px_1fr_1fr]"
                        >
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setSharedSundaySlots((currentSlots) => currentSlots.filter((_, index) => index !== slotIndex))}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                              aria-label={`Remove ${slot.label} shared Sunday timing`}
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center text-sm font-medium text-slate-600">{slot.label}</div>
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Start</label>
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(event) =>
                                setSharedSundaySlots((currentSlots) => {
                                  const nextSlots = [...currentSlots];
                                  nextSlots[slotIndex] = { ...nextSlots[slotIndex], start_time: event.target.value };
                                  return nextSlots;
                                })
                              }
                              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">End</label>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(event) =>
                                setSharedSundaySlots((currentSlots) => {
                                  const nextSlots = [...currentSlots];
                                  nextSlots[slotIndex] = { ...nextSlots[slotIndex], end_time: event.target.value };
                                  return nextSlots;
                                })
                              }
                              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Auto-Populated Services</h2>
                  <p className="text-sm text-slate-500">
                    Defaults use Monday-Saturday operating days, split-shift timings, and single booking.
                  </p>
                </div>
                <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {selectedServiceCount} service{selectedServiceCount === 1 ? '' : 's'} selected
                </div>
              </div>

              <div className="relative z-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={handleAddBlankService}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline cursor-pointer focus:outline-none"
                >
                  + Add Additional Popular Services
                </button>
                {optionalServices.length > 0 && (
                  <>
                    <p className="mt-1 text-sm text-slate-500">
                      Click any option below to append a pre-configured service row, or click above for a blank one.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {optionalServices.map((service) => {
                        return (
                          <button
                            key={`${service.tag}-${service.name}`}
                            type="button"
                            onClick={() => handleAddOptionalService(service)}
                            className="pointer-events-auto cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200 active:scale-[0.98]"
                          >
                            + {service.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-5">
                {services.map((service) => {
                  const sundayEnabled = isHealthcare ? sharedSundaySlots.length > 0 : service.sundaySlots.length > 0;

                  return (
                    <div
                      key={service.id}
                      ref={(element) => {
                        serviceRowRefs.current[service.id] = element;
                      }}
                      className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                        recentlyAddedServiceId === service.id
                          ? 'border-sky-400 ring-2 ring-sky-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={service.enabled}
                            onChange={(event) =>
                              updateService(service.id, (currentService) => ({
                                ...currentService,
                                enabled: event.target.checked,
                              }))
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">Service Name</p>
                              <input
                                type="text"
                                value={service.name}
                                onChange={(event) =>
                                  updateService(service.id, (currentService) => ({
                                    ...currentService,
                                    name: event.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                Booking: {service.bookingType}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                Category: {service.category}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                Subcategory: {buildPrefixedTag(service.subcategoryTag, selectedTags)}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                Days: Monday-Saturday{sundayEnabled ? ', Sunday' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[280px]">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Price</label>
                            <input
                              type="number"
                              min="0"
                              value={service.price}
                              onChange={(event) =>
                                updateService(service.id, (currentService) => ({
                                  ...currentService,
                                  price: event.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">Duration (mins)</label>
                            <input
                              type="number"
                              min="0"
                              value={service.durationMins}
                              onChange={(event) =>
                                updateService(service.id, (currentService) => ({
                                  ...currentService,
                                  durationMins: event.target.value,
                                }))
                              }
                              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            />
                          </div>
                        </div>
                      </div>

                      {!isHealthcare && (
                        <div className={`mt-5 space-y-5 ${service.enabled ? '' : 'opacity-60'}`}>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Monday-Saturday Split Shift</h3>
                              <p className="text-sm text-slate-500">
                                These slots set operating_days to Monday through Saturday for this service.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {service.weekdaySlots.map((slot, slotIndex) => (
                              <div
                                key={`${service.id}-weekday-${slot.label}-${slotIndex}`}
                                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[56px_140px_1fr_1fr]"
                              >
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateService(service.id, (currentService) => ({
                                        ...currentService,
                                        weekdaySlots: currentService.weekdaySlots.filter((_, index) => index !== slotIndex),
                                      }))
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                    aria-label={`Remove ${slot.label} weekday timing`}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-600">{slot.label}</div>
                                <div>
                                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Start
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.start_time}
                                    onChange={(event) =>
                                      updateService(service.id, (currentService) => {
                                        const nextSlots = [...currentService.weekdaySlots];
                                        nextSlots[slotIndex] = {
                                          ...nextSlots[slotIndex],
                                          start_time: event.target.value,
                                        };
                                        return { ...currentService, weekdaySlots: nextSlots };
                                      })
                                    }
                                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                    End
                                  </label>
                                  <input
                                    type="time"
                                    value={slot.end_time}
                                    onChange={(event) =>
                                      updateService(service.id, (currentService) => {
                                        const nextSlots = [...currentService.weekdaySlots];
                                        nextSlots[slotIndex] = {
                                          ...nextSlots[slotIndex],
                                          end_time: event.target.value,
                                        };
                                        return { ...currentService, weekdaySlots: nextSlots };
                                      })
                                    }
                                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {!sundayEnabled && (
                          <button
                            type="button"
                            onClick={() =>
                              updateService(service.id, (currentService) => ({
                                ...currentService,
                                sundaySlots: cloneSlots(DEFAULT_SUNDAY_SLOTS),
                              }))
                            }
                            className="inline-flex rounded-full border border-dashed border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                          >
                            + Add Sunday Timings
                          </button>
                        )}

                        {sundayEnabled && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Sunday Timings</h3>
                              <p className="text-sm text-slate-500">
                                Sunday uses a separate doctor-average default and can be removed slot-by-slot.
                              </p>
                            </div>

                            <div className="mt-4 space-y-3">
                              {service.sundaySlots.map((slot, slotIndex) => (
                                <div
                                  key={`${service.id}-sunday-${slot.label}-${slotIndex}`}
                                  className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[56px_140px_1fr_1fr]"
                                >
                                  <div className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateService(service.id, (currentService) => ({
                                          ...currentService,
                                          sundaySlots: currentService.sundaySlots.filter(
                                            (_, index) => index !== slotIndex
                                          ),
                                        }))
                                      }
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                      aria-label={`Remove ${slot.label} Sunday timing`}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <div className="flex items-center text-sm font-medium text-slate-600">{slot.label}</div>
                                  <div>
                                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                      Start
                                    </label>
                                    <input
                                      type="time"
                                      value={slot.start_time}
                                      onChange={(event) =>
                                        updateService(service.id, (currentService) => {
                                          const nextSlots = [...currentService.sundaySlots];
                                          nextSlots[slotIndex] = {
                                            ...nextSlots[slotIndex],
                                            start_time: event.target.value,
                                          };
                                          return { ...currentService, sundaySlots: nextSlots };
                                        })
                                      }
                                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                      End
                                    </label>
                                    <input
                                      type="time"
                                      value={slot.end_time}
                                      onChange={(event) =>
                                        updateService(service.id, (currentService) => {
                                          const nextSlots = [...currentService.sundaySlots];
                                          nextSlots[slotIndex] = {
                                            ...nextSlots[slotIndex],
                                            end_time: event.target.value,
                                          };
                                          return { ...currentService, sundaySlots: nextSlots };
                                        })
                                      }
                                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Submits duplicate-safe onboarding using the existing tenant_id when the business name already exists.
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                  isLoading ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isLoading ? 'Submitting...' : `Submit ${categoryLabel} Onboarding`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeClinicalOnboardingForm;
