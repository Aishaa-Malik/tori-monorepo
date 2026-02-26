export type VenueProfile = {
  id: string;
  // ListingCard fields
  name: string;
  location: string;
  thumb: string;
  details: string;
  rating?: number;
  reviewCount?: number;
  // Profile-only fields
  images: string[];
  description: string;
  facilities: string[];
  hours: string;
  pricing: string;
  contact: { phone?: string; email?: string; address?: string };
  mapUrl?: string;
};

export const servicesData: Record<string, Record<string, VenueProfile[]>> = {
  'sports-venues': {
    'cricket-pitch': [
      {
        id: 'cp-1',
        name: 'Tiento Sports',
        location: 'Mission Road · 1.1 km',
        thumb: '/tiento.png',
        details: 'Bookable',
        rating: 4.5,
        reviewCount: 120,
        images: ['/images/tiento.png'],
        description: 'Multi-sport venue with bookable slots.',
        facilities: ['Floodlights', 'Locker Rooms'],
        hours: '6 AM – 10 PM',
        pricing: '₹700 per hour',
        contact: { phone: '+91 8619439126', address: 'Mission Road · 1.1 km' },
      },
      {
        id: 'cp-2',
        name: 'Fusion – The Turf',
        location: 'Next to KSH · 1.1 km',
        thumb: '/c2.png',
        details: 'Bookable',
        rating: 4.3,
        reviewCount: 85,
        images: ['/images/c2.png'],
        description: 'Synthetic turf venue for games and practice.',
        facilities: ['Floodlights'],
        hours: '7 AM – 9 PM',
        pricing: '₹600 per hour',
        contact: { phone: '+91 8619439126', address: 'Next to KSH · 1.1 km' },
      },
    ],

    'football-turf': [
      {
        id: 'ft-1',
        name: 'Bangalore Football Turf',
        location: 'Hennur Ring · Royal Towers',
        thumb: '/f1.png',
        details: 'Soccer field',
        rating: 4.5,
        reviewCount: 230,
        images: ['/images/f1.png'],
        description: 'Soccer field with bookable slots.',
        facilities: ['Night Lighting'],
        hours: '7 AM – 11 PM',
        pricing: '₹1200 per hour',
        contact: { phone: '+91 8619439126', address: 'Royal Towers, Hennur Ring' },
      },
    ],

    'pickleball': [
      {
        id: 'pb-1',
        name: 'PicknPadel Arena – Padel & Pickleball',
        location: 'Begur',
        thumb: '/p1.png',
        details: 'Sports complex',
        rating: 4.8,
        reviewCount: 45,
        images: ['/images/p1.png'],
        description: 'Padel & Pickleball sports complex.',
        facilities: ['Coaching', 'Pro Shop'],
        hours: '8 AM – 10 PM',
        pricing: '₹800 per hour',
        contact: { phone: '+91 8619439126', address: 'Begur' },
      },
    ],
  },

'fitness-venues': {
  'gym': [
    {
      id: 'gym-1',
      name: 'Fit and Gold Gym',
      location: 'Raja Park',
      thumb: '/images/fng.png',
      details: 'Modern gym',
      rating: 4.4,
      reviewCount: 210,
      images: ['/images/fng.png'],
      description: 'Modern gym with strength and cardio equipment.',
      facilities: ['Weights', 'Cardio', 'Trainer'],
      hours: '6 AM – 10 PM',
      pricing: '₹130 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
    {
      id: 'gym-2',
      name: 'CrossFit Gym',
      location: 'Bapu Nagar Park',
      thumb: '/images/CrossFit Gym.png',
      details: 'Fully equipped gym',
      rating: 4.2,
      reviewCount: 180,
      images: ['/images/CrossFit Gym.png'],
      description: 'Fully equipped gym for strength & endurance training.',
      facilities: ['Weights', 'Machines', 'Personal Training'],
      hours: '6 AM – 11 PM',
      pricing: '₹150 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
    {
      id: 'gym-3',
      name: 'Sweatbox Gym',
      location: 'Raja Park',
      thumb: 'https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw',
      details: 'Functional training gym',
      rating: 4.3,
      reviewCount: 95,
      images: ['https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw'],
      description: 'Functional training & modern workout machines.',
      facilities: ['Weights', 'Cross-training', 'Trainer'],
      hours: '6 AM – 10 PM',
      pricing: '₹130 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
    {
      id: 'gym-4',
      name: 'Fitness Connection',
      location: 'Vidyadhar Nagar',
      thumb: 'https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw',
      details: 'Spacious modern gym',
      rating: 4.1,
      reviewCount: 145,
      images: ['https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw'],
      description: 'Spacious gym with modern equipment.',
      facilities: ['Weights', 'Cardio', 'Lockers'],
      hours: '6 AM – 10 PM',
      pricing: '₹120 per session',
      contact: { phone: '+91 8619439126', address: 'Vidyadhar Nagar' },
    },
    {
      id: 'gym-5',
      name: 'One Rule Gym',
      location: 'Raja Park',
      thumb: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw',
      details: 'Strength training gym',
      rating: 4.5,
      reviewCount: 120,
      images: ['https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw'],
      description: 'High-energy gym focused on strength training.',
      facilities: ['Weights', 'Cardio', 'Trainer'],
      hours: '6 AM – 10 PM',
      pricing: '₹120 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
  ],

  'zumba': [
    {
      id: 'zumba-1',
      name: 'Fit and Gold Gym',
      location: 'Raja Park',
      thumb: '/images/fng.png',
      details: 'Zumba sessions',
      rating: 4.6,
      reviewCount: 60,
      images: ['/images/fng.png'],
      description: 'Energetic Zumba sessions for cardio & fun.',
      facilities: ['Dance Floor', 'Instructor', 'Music'],
      hours: '7 AM – 9 AM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
        {
      id: 'zumba-2',
      name: 'CrossFit Gym',
      location: 'Bapu Nagar Park',
      thumb: '/images/CrossFit Gym.png',
      details: 'Fully equipped gym',
      rating: 4.2,
      reviewCount: 180,
      images: ['/images/CrossFit Gym.png'],
      description: 'Fully equipped gym for strength & endurance training.',
      facilities: ['Weights', 'Machines', 'Personal Training'],
      hours: '6 AM – 11 PM',
      pricing: '₹150 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
    {
      id: 'zumba-3',
      name: 'Sweatbox Gym',
      location: 'Raja Park',
      thumb: 'https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw',
      details: 'Functional training gym',
      rating: 4.3,
      reviewCount: 95,
      images: ['https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw'],
      description: 'Functional training & modern workout machines.',
      facilities: ['Weights', 'Cross-training', 'Trainer'],
      hours: '6 AM – 10 PM',
      pricing: '₹130 per session',
      contact: { phone: '+91 8619439126', address: 'Raja Park' },
    },
  ],

  'yoga': [
    {
      id: 'yoga-1',
      name: 'Group workout & MUSICAL YOGA',
      location: 'Central Park',
      thumb: '/images/parkyoga.png',
      details: 'Yoga session',
      rating: 4.8,
      reviewCount: 35,
      images: ['/images/parkyoga.png'],
      description: 'Refreshing yoga with music in a group setting.',
      facilities: ['Yoga Mats', 'Music', 'Instructor'],
      hours: '6 AM – 9 AM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Central Park' },
    },
  ],

  'nature-workout': [
    {
      id: 'nw-1',
      name: 'Group NATURE Fun workout',
      location: 'Bhagat Singh Park · Raja Park',
      thumb: '/images/nature workout.png',
      details: 'Outdoor workout',
      rating: 4.7,
      reviewCount: 48,
      images: ['/images/nature workout.png'],
      description: 'Outdoor group workout surrounded by nature.',
      facilities: ['Outdoor', 'Group', 'Bodyweight'],
      hours: '7 AM – 9 AM',
      pricing: '₹99 per session [2 hrs]',
      contact: { phone: '+91 8619439126', address: 'Bhagat Singh Park · Raja Park' },
    },
    {
      id: 'nw-2',
      name: 'Group workout & MUSICAL YOGA',
      location: 'Central Park',
      thumb: '/images/parkyoga.png',
      details: 'Nature workout & yoga',
      rating: 4.6,
      reviewCount: 30,
      images: ['/images/parkyoga.png'],
      description: 'Combination of workout & yoga in nature.',
      facilities: ['Yoga Mats', 'Music', 'Instructor'],
      hours: '6 AM – 9 AM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Central Park' },
    },
  ],

  'meditation': [
    {
      id: 'med-1',
      name: 'RELAXING MEDITATION IN NATURE',
      location: 'Central Park',
      thumb: '/images/meditation.png',
      details: 'Guided meditation',
      rating: 4.9,
      reviewCount: 22,
      images: ['/images/meditation.png'],
      description: 'Guided meditation for deep relaxation.',
      facilities: ['Guided Meditation', 'Mindfulness'],
      hours: '6 AM – 7 AM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Central Park' },
    },
  ],

  'nature-meditation': [
    {
      id: 'nm-1',
      name: 'RELAXING MEDITATION IN NATURE',
      location: 'Central Park',
      thumb: '/images/meditation.png',
      details: 'Nature meditation',
      rating: 4.8,
      reviewCount: 15,
      images: ['/images/meditation.png'],
      description: 'Peaceful meditation session in natural surroundings.',
      facilities: ['Outdoor', 'Guided Session'],
      hours: '6 AM – 7 AM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Central Park' },
    },
  ],

  'nature-fitness-dance-party': [
    {
      id: 'ndp-1',
      name: 'Eco Fitness dance by Shalini maam',
      location: 'Central Park',
      thumb: '/images/dancecp.png',
      details: 'Outdoor dance fitness',
      rating: 4.5,
      reviewCount: 18,
      images: ['/images/dancecp.png'],
      description: 'Fun outdoor fitness dance experience.',
      facilities: ['Dance', 'Outdoor', 'Music'],
      hours: '5 PM – 7 PM',
      pricing: '₹99 per session',
      contact: { phone: '+91 8619439126', address: 'Central Park' },
    },
  ],
},


  doctors: {
    'general-physician': [
      {
        id: 'dr-vijay-pathak',
        name: 'Dr. Vijay Pathak',
        location: 'Tilak Nagar',
        thumb: '/doctor.jpg',
        details: 'General physician consultations.',
        rating: 4.3,
        reviewCount: 195,
        images: ['/doctor.jpg'],
        description: 'Cardiac surgeon and general physician consultations.',
        facilities: ['Consultation'],
        hours: '5 PM – 7 PM (varies by day)',
        pricing: 'Consultation on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        mapUrl: 'https://maps.app.goo.gl/7V5rqCSH9QRqyQY57',
      },
    ],
  },
};

export type SubcategoryMeta = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const subcategoriesMap: Record<string, SubcategoryMeta[]> = {
  'sports-venues': [
    { id: 'cricket-pitch', name: 'Cricket Pitch', description: 'Nets and turf wickets', image: '/images/c5.png' },
    { id: 'football-turf', name: 'Football Turf', description: '5-a-side / 7-a-side', image: '/images/f3.png' },
    { id: 'pickleball', name: 'Pickleball', description: 'Courts and coaching', image: '/images/p3.png' },
  ],
  'fitness-venues': [
    { id: 'gym', name: 'Gym', description: 'Strength & cardio workouts', image: '/images/CrossFit Gym.png' },
    { id: 'zumba', name: 'Zumba', description: 'Dance-based cardio fitness', image: '/images/zumba.jpg' },
    { id: 'yoga', name: 'Yoga', description: 'Flexibility & mindfulness', image: '/images/parkyoga.png' },
    { id: 'nature-workout', name: 'Nature Workout', description: 'Outdoor fitness sessions', image: '/images/nature workout.png' },
    { id: 'meditation', name: 'Meditation', description: 'Relaxation & focus', image: '/images/meditation.png' },
    { id: 'nature-fitness-dance-party', name: 'Nature Fitness Dance Party', description: 'Outdoor dance fitness', image: '/images/dancecp.png' },
  ],
};

export const readableNames: Record<string, string> = {
  'sports-venues': 'Sports Venues',
  'fitness-venues': 'Fitness venues',
  'doctors': 'Doctors',
};