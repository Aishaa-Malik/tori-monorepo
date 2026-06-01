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

type DoctorSpecializationOption = {
  value: string;
  label: string;
  serviceName: string;
};

type DoctorFormState = {
  id: string;
  providerName: string;
  qualifications: string;
  specializationTags: string[];
  price: string;
  tags: string[];
  tagInput: string;
  timeSlotsByDay: Record<DayOfWeek, TimeSlot[]>;
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

const ALL_DAYS: DayOfWeek[] = [...WEEKDAYS, 'Sunday'];

const DOCTOR_SPECIALIZATION_OPTIONS: DoctorSpecializationOption[] = [
  {
    value: 'general_physician',
    label: 'General Physician Consultation',
    serviceName: 'General Physician Consultation',
  },
  {
    value: 'dermatologist',
    label: 'Skin, Hair & Nails Consultation',
    serviceName: 'Skin, Hair & Nails Consultation',
  },
  {
    value: 'dental',
    label: 'Dental Consultation',
    serviceName: 'Dental Consultation',
  },
  {
    value: 'gynecologist',
    label: 'Gynecologist & Obstetrics Consultation',
    serviceName: 'Gynecologist & Obstetrics Consultation',
  },
];

const createServiceId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const cloneSlots = (slots: TimeSlot[]) => slots.map((slot) => ({ ...slot }));
const defaultSlotsForDay = (day: DayOfWeek) =>
  cloneSlots(day === 'Sunday' ? DEFAULT_SUNDAY_SLOTS : DEFAULT_SPLIT_SHIFT_SLOTS);

const createDoctorTimeSlotsByDay = (): Record<DayOfWeek, TimeSlot[]> => ({
  Monday: defaultSlotsForDay('Monday'),
  Tuesday: defaultSlotsForDay('Tuesday'),
  Wednesday: defaultSlotsForDay('Wednesday'),
  Thursday: defaultSlotsForDay('Thursday'),
  Friday: defaultSlotsForDay('Friday'),
  Saturday: defaultSlotsForDay('Saturday'),
  Sunday: [],
});

const createDoctorCard = (): DoctorFormState => ({
  id: createServiceId(),
  providerName: '',
  qualifications: '',
  specializationTags: [],
  price: '400',
  tags: [],
  tagInput: '',
  timeSlotsByDay: createDoctorTimeSlotsByDay(),
});

const extractTagsFromInput = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

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
      { name: '🩺 General Physician Consultation (Fever, Infections, Allergies)', price: 400, durationMins: 15 },
      { name: '📈 Chronic Lifestyle Consultation (Diabetes, BP, Thyroid)', price: 250, durationMins: 10 },
      { name: '👴 Geriatric (Senior Citizen) Care', price: 400, durationMins: 15 },
    ],
    optionalServices: [
      // { name: 'Health Checkup & Screening', price: 999, durationMins: 30 },
      // { name: 'Chronic Disease Management', price: 500, durationMins: 20 },
      ...asServices([
        // '🩺 General Physician Consultation (Fever, Infections, Allergies)',
        // '📈 Chronic Lifestyle Consultation (Diabetes, BP, Thyroid)',
        // '👴 Geriatric (Senior Citizen) Care',
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

const buildDoctorTimeSlotsPayload = (doctor: DoctorFormState) => {
  const consultationPrice = Number(doctor.price) || 400;

  return ALL_DAYS.reduce((accumulator, day) => {
    const sanitizedSlots = (doctor.timeSlotsByDay[day] || [])
      .filter((slot) => slot.start_time && slot.end_time)
      .map((slot) => ({
        label: slot.label,
        start_time: slot.start_time,
        end_time: slot.end_time,
        price: consultationPrice,
      }));

    if (sanitizedSlots.length > 0) {
      accumulator[day] = sanitizedSlots;
    }

    return accumulator;
  }, {} as Record<string, Array<{ label: string; start_time: string; end_time: string; price: number }>>);
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
  const [citySelection, setCitySelection] = useState('');
  const [location, setLocation] = useState('');
  const [shortLocation, setShortLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([defaultConfig.tag]);
  const [services, setServices] = useState<ServiceFormState[]>(() => buildServicesForConfig(defaultConfig, businessType));
  const [doctors, setDoctors] = useState<DoctorFormState[]>(() => (mode === 'healthcare' ? [createDoctorCard()] : []));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentlyAddedServiceId, setRecentlyAddedServiceId] = useState<string | null>(null);
  const [recentlyAddedDoctorId, setRecentlyAddedDoctorId] = useState<string | null>(null);
  const serviceRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const doctorCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const optionalServices = useMemo(
    () => PHYSIOTHERAPY_CONFIG.optionalServices.map((service) => ({ ...service, tag: PHYSIOTHERAPY_CONFIG.tag })),
    []
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

  useEffect(() => {
    if (!recentlyAddedDoctorId) return;

    const targetCard = doctorCardRefs.current[recentlyAddedDoctorId];
    targetCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const highlightTimeout = window.setTimeout(() => {
      setRecentlyAddedDoctorId(null);
    }, 1800);

    return () => window.clearTimeout(highlightTimeout);
  }, [recentlyAddedDoctorId]);

  const updateService = (serviceId: string, updater: (service: ServiceFormState) => ServiceFormState) => {
    setServices((currentServices) =>
      currentServices.map((service) => (service.id === serviceId ? updater(service) : service))
    );
  };

  const updateDoctor = (doctorId: string, updater: (doctor: DoctorFormState) => DoctorFormState) => {
    setDoctors((currentDoctors) =>
      currentDoctors.map((doctor) => (doctor.id === doctorId ? updater(doctor) : doctor))
    );
  };

  const addDoctor = () => {
    const nextDoctor = createDoctorCard();
    setDoctors((currentDoctors) => [...currentDoctors, nextDoctor]);
    setRecentlyAddedDoctorId(nextDoctor.id);
  };

  const removeDoctor = (doctorId: string) => {
    setDoctors((currentDoctors) => (currentDoctors.length === 1 ? currentDoctors : currentDoctors.filter((doctor) => doctor.id !== doctorId)));
  };

  const toggleDoctorSpecialization = (doctorId: string, specializationTag: string) => {
    updateDoctor(doctorId, (currentDoctor) => {
      const alreadySelected = currentDoctor.specializationTags.includes(specializationTag);
      return {
        ...currentDoctor,
        specializationTags: alreadySelected
          ? currentDoctor.specializationTags.filter((tag) => tag !== specializationTag)
          : [...currentDoctor.specializationTags, specializationTag],
      };
    });
  };

  const toggleDoctorDay = (doctorId: string, day: DayOfWeek) => {
    updateDoctor(doctorId, (currentDoctor) => {
      const currentDaySlots = currentDoctor.timeSlotsByDay[day] || [];
      return {
        ...currentDoctor,
        timeSlotsByDay: {
          ...currentDoctor.timeSlotsByDay,
          [day]: currentDaySlots.length > 0 ? [] : defaultSlotsForDay(day),
        },
      };
    });
  };

  const addDoctorTimeSlot = (doctorId: string, day: DayOfWeek) => {
    updateDoctor(doctorId, (currentDoctor) => ({
      ...currentDoctor,
      timeSlotsByDay: {
        ...currentDoctor.timeSlotsByDay,
        [day]: [
          ...(currentDoctor.timeSlotsByDay[day] || []),
          { label: `Slot ${(currentDoctor.timeSlotsByDay[day] || []).length + 1}`, start_time: '', end_time: '' },
        ],
      },
    }));
  };

  const updateDoctorTimeSlot = (
    doctorId: string,
    day: DayOfWeek,
    slotIndex: number,
    key: keyof TimeSlot,
    value: string
  ) => {
    updateDoctor(doctorId, (currentDoctor) => {
      const nextSlots = [...(currentDoctor.timeSlotsByDay[day] || [])];
      nextSlots[slotIndex] = { ...nextSlots[slotIndex], [key]: value };
      return {
        ...currentDoctor,
        timeSlotsByDay: {
          ...currentDoctor.timeSlotsByDay,
          [day]: nextSlots,
        },
      };
    });
  };

  const removeDoctorTimeSlot = (doctorId: string, day: DayOfWeek, slotIndex: number) => {
    updateDoctor(doctorId, (currentDoctor) => ({
      ...currentDoctor,
      timeSlotsByDay: {
        ...currentDoctor.timeSlotsByDay,
        [day]: (currentDoctor.timeSlotsByDay[day] || []).filter((_, index) => index !== slotIndex),
      },
    }));
  };

  const commitDoctorTags = (doctorId: string) => {
    updateDoctor(doctorId, (currentDoctor) => {
      const nextTags = Array.from(new Set([...currentDoctor.tags, ...extractTagsFromInput(currentDoctor.tagInput)]));
      return {
        ...currentDoctor,
        tags: nextTags,
        tagInput: '',
      };
    });
  };

  const removeDoctorTag = (doctorId: string, tagToRemove: string) => {
    updateDoctor(doctorId, (currentDoctor) => ({
      ...currentDoctor,
      tags: currentDoctor.tags.filter((tag) => tag !== tagToRemove),
    }));
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
      const nextService = createServiceFromTemplate({ name: '', price: 400, durationMins: 15 }, businessType, serviceTag);

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
    setCitySelection('');
    setLocation('');
    setShortLocation('');
    setGoogleMapsLink('');
    setSelectedTags([defaultConfig.tag]);
    setServices(buildServicesForConfig(defaultConfig, businessType));
    setDoctors(isHealthcare ? [createDoctorCard()] : []);
    setRecentlyAddedServiceId(null);
    setRecentlyAddedDoctorId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { getApiUrl } = await import('../../utils/environmentUtils');
      const BACKEND_API_URL = getApiUrl();

      if (isHealthcare) {
        const activeDoctors = doctors.filter(
          (doctor) =>
            doctor.providerName.trim() ||
            doctor.qualifications.trim() ||
            doctor.specializationTags.length > 0 ||
            doctor.tags.length > 0
        );

        if (activeDoctors.length === 0) {
          setError('Add at least one doctor before submitting Healthcare onboarding.');
          setIsLoading(false);
          return;
        }

        const normalizedDoctors = activeDoctors.map((doctor, index) => {
          const timeSlots = buildDoctorTimeSlotsPayload(doctor);
          const operatingDays = Object.keys(timeSlots);
          const doctorTags = Array.from(new Set([...doctor.tags, ...extractTagsFromInput(doctor.tagInput)]));

          if (!doctor.providerName.trim()) {
            throw new Error(`Doctor ${index + 1}: name is required.`);
          }

          if (!doctor.qualifications.trim()) {
            throw new Error(`Doctor ${index + 1}: qualifications are required.`);
          }

          if (doctor.specializationTags.length === 0) {
            throw new Error(`Doctor ${index + 1}: choose at least one core specialization.`);
          }

          if (operatingDays.length === 0) {
            throw new Error(`Doctor ${index + 1}: select at least one available day and slot.`);
          }

          return {
            providerName: doctor.providerName.trim(),
            doctorQualifications: doctor.qualifications.trim(),
            specializations: doctor.specializationTags,
            tags: doctorTags,
            price: Number(doctor.price) || 400,
            durationMins: 15,
            operatingDays,
            timeSlots,
          };
        });

        const response = await fetch(`${BACKEND_API_URL}/admin/onboard-business`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            phoneNumber,
            businessName,
            city: citySelection,
            location,
            shortLocation,
            googleMapsLink,
            bookingType: 'single',
            businessType,
            category: businessType,
            doctors: normalizedDoctors,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to onboard clinic');
        }

        setSuccess(`${businessName || 'Clinic'} onboarded successfully. Tenant ID: ${data.tenantId}`);
        handleReset();
        return;
      }

      const selectedServices = services
        .filter((service) => service.enabled && service.name.trim())
        .map((service) => toServicePayload(service, selectedTags));

      if (selectedServices.length === 0) {
        setError(`Select at least one ${categoryLabel.toLowerCase()} service before submitting.`);
        setIsLoading(false);
        return;
      }

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
                  <h2 className="text-lg font-semibold text-slate-900">Clinic Details</h2>
                  <p className="text-sm text-slate-500">These top-level fields save into `business_profiles`.</p>
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

                {isHealthcare ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">City Location Selection</label>
                    <select
                      required
                      value={citySelection}
                      onChange={(event) => setCitySelection(event.target.value)}
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
                ) : (
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
                )}

                {isHealthcare && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Complete Location</label>
                    <input
                      required
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="e.g. 2nd Floor, Outer Ring Rd, opposite to More, Mahadevapura, Bengaluru"
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                )}

                {isHealthcare && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Short Location</label>
                    <input
                      required
                      type="text"
                      value={shortLocation}
                      onChange={(event) => setShortLocation(event.target.value)}
                      placeholder="e.g. Mahadevapura, Bengaluru"
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                )}

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
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Doctors</h2>
                    <p className="text-sm text-slate-500">
                      Add one card per doctor. If a doctor selects multiple core specializations, submission creates separate
                      service rows while keeping each doctor&apos;s calendar isolated.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addDoctor}
                    className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    + Add Another Doctor
                  </button>
                </div>

                <div className="space-y-5">
                  {doctors.map((doctor, doctorIndex) => (
                    <div
                      key={doctor.id}
                      ref={(element) => {
                        doctorCardRefs.current[doctor.id] = element;
                      }}
                      className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                        recentlyAddedDoctorId === doctor.id ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">Doctor {doctorIndex + 1}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Each specialization selected here becomes its own `business_services` row on submit.
                          </p>
                        </div>
                        {doctors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDoctor(doctor.id)}
                            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Remove Doctor
                          </button>
                        )}
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Doctor Name</label>
                          <input
                            type="text"
                            value={doctor.providerName}
                            onChange={(event) =>
                              updateDoctor(doctor.id, (currentDoctor) => ({
                                ...currentDoctor,
                                providerName: event.target.value,
                              }))
                            }
                            placeholder="Dr. Rahul"
                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Qualifications</label>
                          <input
                            type="text"
                            value={doctor.qualifications}
                            onChange={(event) =>
                              updateDoctor(doctor.id, (currentDoctor) => ({
                                ...currentDoctor,
                                qualifications: event.target.value,
                              }))
                            }
                            placeholder="MBBS, MD"
                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Standard Consultation Price</label>
                          <input
                            type="number"
                            min="0"
                            value={doctor.price}
                            onChange={(event) =>
                              updateDoctor(doctor.id, (currentDoctor) => ({
                                ...currentDoctor,
                                price: event.target.value,
                              }))
                            }
                            placeholder="400"
                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-semibold text-slate-900">Core Specializations</h3>
                          <p className="text-sm text-slate-500">
                            Choose every department this doctor handles. Each checked option creates a separate service row.
                          </p>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {DOCTOR_SPECIALIZATION_OPTIONS.map((option) => {
                            const checked = doctor.specializationTags.includes(option.value);

                            return (
                              <label
                                key={`${doctor.id}-${option.value}`}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                                  checked
                                    ? 'border-sky-300 bg-sky-50'
                                    : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDoctorSpecialization(doctor.id, option.value)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{option.serviceName}</p>
                                  <p className="text-xs text-slate-500">Saved as `{option.value}` in `subcategory_tag`.</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-semibold text-slate-900">Operational Availability</h3>
                          <p className="text-sm text-slate-500">
                            Enable days and set doctor-specific slot timings. These get linked to each generated service row for this doctor.
                          </p>
                        </div>

                        <div className="mt-4 space-y-4">
                          {ALL_DAYS.map((day) => {
                            const daySlots = doctor.timeSlotsByDay[day] || [];
                            const dayEnabled = daySlots.length > 0;

                            return (
                              <div key={`${doctor.id}-${day}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                  <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-900">
                                    <input
                                      type="checkbox"
                                      checked={dayEnabled}
                                      onChange={() => toggleDoctorDay(doctor.id, day)}
                                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span>{day}</span>
                                  </label>

                                  {dayEnabled && (
                                    <button
                                      type="button"
                                      onClick={() => addDoctorTimeSlot(doctor.id, day)}
                                      className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                                    >
                                      + Add Time Slot
                                    </button>
                                  )}
                                </div>

                                {dayEnabled ? (
                                  <div className="mt-4 space-y-3">
                                    {daySlots.map((slot, slotIndex) => (
                                      <div
                                        key={`${doctor.id}-${day}-${slotIndex}`}
                                        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[160px_1fr_1fr_56px]"
                                      >
                                        <div>
                                          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Slot Label
                                          </label>
                                          <input
                                            type="text"
                                            value={slot.label}
                                            onChange={(event) =>
                                              updateDoctorTimeSlot(doctor.id, day, slotIndex, 'label', event.target.value)
                                            }
                                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Start
                                          </label>
                                          <input
                                            type="time"
                                            value={slot.start_time}
                                            onChange={(event) =>
                                              updateDoctorTimeSlot(doctor.id, day, slotIndex, 'start_time', event.target.value)
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
                                              updateDoctorTimeSlot(doctor.id, day, slotIndex, 'end_time', event.target.value)
                                            }
                                            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                          />
                                        </div>

                                        <div className="flex items-end justify-center">
                                          <button
                                            type="button"
                                            onClick={() => removeDoctorTimeSlot(doctor.id, day, slotIndex)}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                            aria-label={`Remove ${day} slot ${slotIndex + 1}`}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-3 text-sm text-slate-500">This doctor is not available on {day}.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-semibold text-slate-900">Specialized Treatment Keywords</h3>
                          <p className="text-sm text-slate-500">
                            Add comma-separated keywords such as diabetes, fever, acne, hairfall, pregnancy care.
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:flex-row">
                          <input
                            type="text"
                            value={doctor.tagInput}
                            onChange={(event) =>
                              updateDoctor(doctor.id, (currentDoctor) => ({
                                ...currentDoctor,
                                tagInput: event.target.value,
                              }))
                            }
                            onBlur={() => commitDoctorTags(doctor.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ',') {
                                event.preventDefault();
                                commitDoctorTags(doctor.id);
                              }
                            }}
                            placeholder="diabetes, fever, acne"
                            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          />
                          <button
                            type="button"
                            onClick={() => commitDoctorTags(doctor.id)}
                            className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                          >
                            Add Keywords
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {doctor.tags.map((tag) => (
                            <span
                              key={`${doctor.id}-${tag}`}
                              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeDoctorTag(doctor.id, tag)}
                                className="text-white/80 transition hover:text-white"
                                aria-label={`Remove keyword ${tag}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                          {doctor.tags.length === 0 && (
                            <p className="text-sm text-slate-500">No keywords added yet for this doctor.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addDoctor}
                  className="inline-flex items-center justify-center rounded-full border border-dashed border-sky-300 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  + Add Another Doctor
                </button>
              </section>
            )}

            {!isHealthcare && (
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
                    className="cursor-pointer text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline focus:outline-none"
                  >
                    + Add Services
                  </button>
                  <p className="text-sm text-slate-500">
                    Click any option below to append a pre-configured service row, or click above for a blank one.
                  </p>
                {optionalServices.length > 0 && (
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
                )}
              </div>

              <div className="space-y-5">
                {services.map((service) => {
                  const sundayEnabled = service.sundaySlots.length > 0;

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
            )}

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
