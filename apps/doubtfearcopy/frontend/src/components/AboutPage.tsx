import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <main className="min-h-screen text-white">
      {/* Background */}
      <section
        className="relative min-h-screen"
        style={{
          backgroundImage: 'url(/toriateBack.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <header className="mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">TEAM</h1>
            <p className="mt-3 text-gray-200 text-sm md:text-base">
              Sibling founders turn 6+ years of hard-won lessons into Tori Ate’s breakthrough
            </p>
          </header>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Aisha */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white/10 border border-white/20">
                  <img src="/AISHA.png" alt="Aisha profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AISHA</h2>
                  <p className="text-xs text-gray-300">handles development</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm md:text-base">
                <p>
                  <span className="text-yellow-300 font-semibold">exSoftware Engineer</span> @ Amazon
                </p>
                <p>
                  Btech <span className="text-yellow-300">NIT Jaipur</span>
                </p>
                <p>
                  Software Engineering Intern @ DRDO, FuturesFirst, CodingNinjas
                </p>
                <p>
                  Offers from Goldman Sachs, Zomato, Edfora
                </p>
              </div>
            </div>

            {/* Ayush */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white/10 border border-white/20">
                  <img src="/AYUSH.png" alt="Ayush profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AYUSH</h2>
                  <p className="text-xs text-gray-300">handles distribution</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm md:text-base">
                <p>
                  Btech <span className="text-green-300">BITS Pilani</span>
                </p>
                <p>
                  Won Smart India Hackathon - SIH (1st place among 0.7 million people)
                </p>
                <p>
                  Founded a web design agency (69 kelvin)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;