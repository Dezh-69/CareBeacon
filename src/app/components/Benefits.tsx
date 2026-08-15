import { Heart, Users, Hospital, BookOpen } from 'lucide-react';

const beneficiaries = [
  {
    icon: Heart,
    title: 'Older Adults Living Alone',
    description: 'Acts as a safety net with automatic fall detection and two-way audio, reducing fear and enabling independent living with confidence.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Family Members & Caregivers',
    description: 'Provides peace of mind with instant notifications and location data, especially for families living far away or working abroad.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Hospital,
    title: 'Healthcare Providers',
    description: 'Enables faster medical intervention with early notification and GPS location, improving patient outcomes and reducing hospital burden.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'Future Researchers',
    description: 'Contributes to the body of knowledge on IoT-based health monitoring in the Philippines and lays groundwork for future enhancements.',
    color: 'from-purple-500 to-violet-500',
  },
];

export function Benefits() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6">Who Benefits</h2>
          <p className="text-lg text-gray-600">
            This system is designed to improve safety, responsiveness, and quality of care 
            for multiple stakeholders in the elderly care ecosystem.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {beneficiaries.map((beneficiary, index) => {
            const Icon = beneficiary.icon;
            return (
              <div key={index} className="relative bg-gray-50 rounded-2xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${beneficiary.color} rounded-full blur-2xl`}></div>
                </div>
                
                <div className="relative">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${beneficiary.color} text-white rounded-xl mb-4`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-xl mb-3 font-semibold">{beneficiary.title}</h3>
                  <p className="text-gray-600">{beneficiary.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
