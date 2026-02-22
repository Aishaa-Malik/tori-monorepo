import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';

export type Profile = {
  name: string;
  images: string[];
  description: string;
  facilities: string[];
  hours: string;
  pricing: string;
  contact: { phone?: string; email?: string; address?: string };
  ratingScore?: number;
  ratingCount?: number;
  mapUrl?: string;
};

export const sampleProfiles: Record<string, Record<string, Record<string, Profile>>> = {
  'sports-venues': {
    'cricket-pitch': {
      'cp-1': {
        name: 'Tiento Sports',
        images: [
          '/images/tiento.png'
        ],
        description: 'Multi-sport venue with bookable slots.',
        facilities: ['Floodlights', 'Locker Rooms'],
        hours: '6 AM – 10 PM',
        pricing: '₹700 per hour',
        contact: { phone: '+91 8619439126', address: 'Mission Road · 1.1 km' },
      },
      'cp-2': {
        name: 'Fusion – The Turf',
        images: [
          '/images/c2.png',
        ],
        description: 'Synthetic turf venue for games and practice.',
        facilities: ['Floodlights'],
        hours: '7 AM – 9 PM',
        pricing: '₹600 per hour',
        contact: { phone: '+91 8619439126', address: 'Next to KSH · 1.1 km' },
      },
      'cp-3': {
        name: 'Karnataka Sharks Cricket',
        images: [
          '/images/c3.png',
        ],
        description: 'Cricket facility with bookable nets and training.',
        facilities: ['Coaching'],
        hours: '6 AM – 9 PM',
        pricing: '₹650 per hour',
        contact: { phone: '+91 8619439126', address: 'BCVL · 1.4 km' },
      },
      'cp-4': {
        name: 'Basecamp by Push Sports – Bengaluru',
        images: [
          '/images/c4.png',
        ],
        description: 'Sports venue offering bookable practice slots.',
        facilities: ['Parking', 'Water'],
        hours: '6 AM – 10 PM',
        pricing: '₹500 per hour',
        contact: { phone: '+91 8619439126', address: 'Palace Road · 1.4 km' },
      },
      'cp-5': {
        name: 'Basecamp Football by Rush Arena',
        images: [
          '/images/c5.png'
        ],
        description: 'Football turf at Bengaluru City University.',
        facilities: ['Locker Rooms', 'Floodlights'],
        hours: '6 AM – 11 PM',
        pricing: '₹900 per hour',
        contact: { phone: '+91 8619439126', address: 'Bengaluru City Univ · 1.5 km' },
      },
    },
    'football-turf': {
      'ft-1': {
        name: 'Bangalore Football Turf',
        images: [
          '/images/f1.png',
        ],
        description: 'Soccer field with bookable slots.',
        facilities: ['Night Lighting'],
        hours: '7 AM – 11 PM',
        pricing: '₹1200 per hour',
        contact: { phone: '+91 8619439126', address: 'Royal Towers, Hennur Ring' },
      },
      'ft-2': {
        name: 'Bangalore Turf Club Ltd.',
        images: [
          '/images/f2.png',
        ],
        description: 'Racecourse venue.',
        facilities: ['Locker Rooms'],
        hours: '7 AM – 11 PM',
        pricing: '₹1500 per hour',
        contact: { phone: '+91 8619439126', address: 'Race Course Rd' },
      },
      'ft-3': {
        name: 'Turf City Sports',
        images: [
          '/images/f3.png',
        ],
        description: 'Sports complex turf.',
        facilities: ['Night Lighting', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹1300 per hour',
        contact: { phone: '+91 8619439126', address: 'BBL Layout Main Rd' },
      },
    },
    'pickleball': {
      'pb-1': {
        name: 'PicknPadel Arena – Padel & Pickleball',
        images: [
          '/images/p1.png',
        ],
        description: 'Padel & Pickleball sports complex.',
        facilities: ['Coaching', 'Pro Shop'],
        hours: '8 AM – 10 PM',
        pricing: '₹800 per hour',
        contact: { phone: '+91 8619439126', address: 'Begur' },
      },
      'pb-2': {
        name: 'PowerPickle',
        images: [
          '/images/p2.png',
        ],
        description: 'Pickleball courts with equipment rental.',
        facilities: ['Equipment Rental', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹850 per hour',
        contact: { phone: '+91 8619439126', address: 'Vistar Resorts & Hotels' },
      },
      'pb-3': {
        name: 'Go Picklers',
        images: [
          '/images/p3.png',
        ],
        description: 'Pickleball courts with coaching.',
        facilities: ['Coaching', 'Parking'],
        hours: '8 AM – 10 PM',
        pricing: '₹800 per hour',
        contact: { phone: '+91 8619439126', address: '2nd Main Rd' },
      },
    },
  },
  'fitness-studios': {
    'gym': {
      'gym-1': {
        name: 'Fit and Gold Gym',
        images: ['/images/fng.png'],
        description: 'Modern gym with strength and cardio equipment.',
        facilities: ['Weights', 'Cardio', 'Trainer'],
        hours: '6 AM – 10 PM',
        pricing: '₹130 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park' },
      },
      'gym-2': {
        name: 'Gold Gym',
        images: ['/images/goldgym.png'],
        description: 'Fully equipped gym for strength & endurance training.',
        facilities: ['Weights', 'Machines', 'Personal Training'],
        hours: '6 AM – 11 PM',
        pricing: '₹150 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park' },
      },
      'gym-3': {
        name: 'Sweatbox Gym',
        images: ['https://lh3.googleusercontent.com/p/AF1QipN4ORSvcvxZBpkSg9dTOlbslHFrhRgmKH1CVwgl=s1360-w1360-h1020-rw'],
        description: 'Functional training & modern workout machines.',
        facilities: ['Weights', 'Cross-training', 'Trainer'],
        hours: '6 AM – 10 PM',
        pricing: '₹130 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park' },
      },
      'gym-4': {
        name: 'Fitness Connection',
        images: ['https://lh3.googleusercontent.com/p/AF1QipMCJ78ZGMoyZ-1lCdTqN3Hij82Y0vPL-j0NtlfR=s1360-w1360-h1020-rw'],
        description: 'Spacious gym with modern equipment.',
        facilities: ['Weights', 'Cardio', 'Lockers'],
        hours: '6 AM – 10 PM',
        pricing: '₹120 per session',
        contact: { phone: '+91 8619439126', address: 'Vidyadhar Nagar' },
      },
      'gym-5': {
        name: 'One Rule Gym',
        images: ['https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwhMp7yBIEdzNXrD6TIROue5d4wwUJS57bAtLj1KEdo3jwi_T1A3C2Sgsd3cCktzEm_BYVmq1-iyINNyIghEY8x3NQmyRfIcP2tGeFi88yztsgeJpWsGSEX-SJw1OSS6mPQtTMnvpK-90r8=s1360-w1360-h1020-rw'],
        description: 'High-energy gym focused on strength training.',
        facilities: ['Weights', 'Cardio', 'Trainer'],
        hours: '6 AM – 10 PM',
        pricing: '₹120 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park' },
      },
    },

    'zumba': {
      'zumba-1': {
        name: 'Fit and Gold Gym',
        images: ['/images/zumba.png'],
        description: 'Energetic Zumba sessions for cardio & fun.',
        facilities: ['Dance Floor', 'Instructor', 'Music'],
        hours: '7 AM – 9 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Raja Park' },
      },
    },

    'yoga': {
      'yoga-1': {
        name: 'Group workout & MUSICAL YOGA',
        images: ['/images/parkyoga.png'],
        description: 'Refreshing yoga with music in a group setting.',
        facilities: ['Yoga Mats', 'Music', 'Instructor'],
        hours: '6 AM – 9 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park' },
      },
    },

    'nature-workout': {
      'nw-1': {
        name: 'Group NATURE Fun workout',
        images: ['/images/parkyoga.png'],
        description: 'Outdoor group workout surrounded by nature.',
        facilities: ['Outdoor', 'Group', 'Bodyweight'],
        hours: '7 AM – 9 AM',
        pricing: '₹99 per session [2 hrs]',
        contact: { phone: '+91 8619439126', address: 'Bhagat Singh Park · Raja Park' },
      },
      'nw-2': {
        name: 'Group workout & MUSICAL YOGA',
        images: ['/images/parkyoga.png'],
        description: 'Combination of workout & yoga in nature.',
        facilities: ['Yoga Mats', 'Music', 'Instructor'],
        hours: '6 AM – 9 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park' },
      },
    },

    'meditation': {
      'med-1': {
        name: 'RELAXING MEDITATION IN NATURE',
        images: ['/images/meditation.png'],
        description: 'Guided meditation for deep relaxation.',
        facilities: ['Guided Meditation', 'Mindfulness'],
        hours: '6 AM – 7 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park' },
      },
    },

    'nature-meditation': {
      'nm-1': {
        name: 'RELAXING MEDITATION IN NATURE',
        images: ['/images/meditation.png'],
        description: 'Peaceful meditation session in natural surroundings.',
        facilities: ['Outdoor', 'Guided Session'],
        hours: '6 AM – 7 AM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park' },
      },
    },

    'nature-fitness-dance-party': {
      'ndp-1': {
        name: 'Eco Fitness dance',
        images: ['/images/dancecp.png'],
        description: 'Fun outdoor fitness dance experience.',
        facilities: ['Dance', 'Outdoor', 'Music'],
        hours: '5 PM – 7 PM',
        pricing: '₹99 per session',
        contact: { phone: '+91 8619439126', address: 'Central Park' },
      },
    },
  },
  
  doctors: {
    'general-physician': {
      'dr-vijay-pathak': {
        name: 'Dr. Vijay Pathak',
        images: ['/doctor.jpg'],
        description: 'Cardiac surgeon and general physician consultations.',
        facilities: ['Consultation'],
        hours: '5 PM – 7 PM (varies by day)',
        pricing: 'Consultation on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        ratingScore: 4.3,
        ratingCount: 195,
        mapUrl: 'https://maps.app.goo.gl/7V5rqCSH9QRqyQY57',
      },
      'agarwal-clinic': {
        name: 'Agarwal Clinic',
        images: ['/doctor.jpg'],
        description: 'Clinic offering OB/GYN and general physician services.',
        facilities: ['Consultation'],
        hours: '6 PM – 9 PM (varies)',
        pricing: 'Consultation on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar · Guru Nanak Pura' },
        ratingScore: 5.0,
        ratingCount: 116,
        mapUrl: 'https://maps.app.goo.gl/Gam4Qqp9cP83srqd6',
      },
    },
    physiotherapy: {
      'physio-home-jawahar-nagar': {
        name: 'Physiotherapy at home',
        images: ['/homephysio.png'],
        description: 'Home physiotherapy service at Jawahar Nagar.',
        facilities: ['Home Visit', 'Pain Management'],
        hours: '10 AM – 8 PM',
        pricing: '₹200 per session',
        contact: { phone: '+91 8619439126', address: 'Jawahar Nagar' },
        mapUrl: 'https://maps.app.goo.gl/QGzfpXzkxgQ8MKE46',
      },
      'kritikas-physiotherapy-clinic': {
        name: "Kritika's Physiotherapy Clinic",
        images: ['/kritika.png'],
        description: 'Physiotherapy & wellness center with modern treatments.',
        facilities: ['Needle Therapy', 'Cupping', 'Stone Therapy'],
        hours: '10 AM – 8:30 PM',
        pricing: '₹200 per session',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        ratingScore: 5.0,
        ratingCount: 66,
        mapUrl: 'https://maps.app.goo.gl/wwZSpiW7U9tGiXaH7',
      },
    },
    'mental-health-session': {
      'art-of-living-tilak-nagar': {
        name: 'Art of Living Happiness Center',
        images: ['/images/services/service-4.jpg'],
        description: 'Meditation and wellness center offering the Happiness Course and guided practices.',
        facilities: ['Meditation', 'Guided Practices'],
        hours: '6 AM – 8 PM',
        pricing: 'Session fees on request',
        contact: { phone: '+91 8619439126', address: 'Tilak Nagar' },
        ratingScore: 5.0,
        ratingCount: 55,
        mapUrl: 'https://maps.app.goo.gl/RCcsrytoN69HXN6x6',
      },
    },
    ayurveda: {
      'aarohan-ayurveda-hospital': {
        name: 'AAROHAN AYURVEDA Hospital',
        images: ['/arohanayur.png'],
        description: 'Ayurvedic hospital offering authentic therapies and care.',
        facilities: ['Panchakarma', 'Therapies'],
        hours: '9 AM – 7 PM',
        pricing: 'Therapies on request',
        contact: { phone: '+91 8619439126', address: 'Jaipur' },
        ratingScore: 5.0,
        ratingCount: 227,
        mapUrl: 'https://maps.app.goo.gl/g2Q6XyoVhPRdhsgU6',
      },
    },
    'emergency-ambulance-booking': {
      'yadav-ambulance-service': {
        name: 'Yadav Ambulance service',
        images: ['/images/services/service-3.jpg'],
        description: '24x7 ambulance service in Jaipur.',
        facilities: ['24x7 Service'],
        hours: 'Open 24 hours',
        pricing: 'On request',
        contact: { phone: '+91 8619439126', address: 'Jaipur' },
        ratingScore: 5.0,
        ratingCount: 4,
        mapUrl: 'https://maps.app.goo.gl/mrYyVEMx6kfQoa1N7',
      },
    },
  },
};

const ListingProfilePage: React.FC = () => {
  const { category, subcategory, id } = useParams<{ category: string; subcategory?: string; id: string }>();
  const profile = category && id ? (subcategory ? sampleProfiles[category]?.[subcategory!]?.[id] : undefined) : undefined;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">Profile not found or not yet available.</p>
            <div className="mt-4 flex gap-4">
              <Link to={subcategory ? `/services/${category}/${subcategory}` : `/services/${category || ''}`} className="text-teal-600">Back to listings</Link>
              <Link to="/services" className="text-teal-600">All services</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
        {typeof profile.ratingScore === 'number' && typeof profile.ratingCount === 'number' && (
          <p className="mt-2 text-lg text-gray-800">{profile.ratingScore.toFixed(1)} ★ ({profile.ratingCount})</p>
        )}
        <div className="mt-6">
          <ImageCarousel images={profile.images} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-2 text-gray-700">{profile.description}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Facilities</h2>
              <ul className="mt-2 list-disc list-inside text-gray-700">
                {profile.facilities.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Operating Hours</h2>
              <p className="mt-2 text-gray-700">{profile.hours}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Pricing</h2>
              <p className="mt-2 text-gray-700">{profile.pricing}</p>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Contact</h2>
              <div className="mt-2 text-gray-700 space-y-1">
                {profile.contact.phone && <p>Phone: {profile.contact.phone}</p>}
                {profile.contact.email && <p>Email: {profile.contact.email}</p>}
                {profile.contact.address && <p>Address: {profile.contact.address}</p>}
                {profile.mapUrl && (
                  <p>
                    <a href={profile.mapUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600">View on Google Maps</a>
                  </p>
                )}
              </div>
              <div className="mt-4">
                <a
                  href="https://api.whatsapp.com/send/?phone=919351504729&text=Hi&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md bg-teal-600 px-4 py-2 text-white"
                >
                  Book Now
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListingProfilePage;
