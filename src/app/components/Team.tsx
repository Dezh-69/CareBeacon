import { GraduationCap, Mail } from 'lucide-react';

const teamMembers = [
  { name: 'Phoebe Maysie M. Aguilar', role: 'Developer' },
  { name: 'Kyla G. Bautista', role: 'Developer' },
  { name: 'Rafael Luis M. De Leon', role: 'Developer' },
  { name: 'Manuel A. Santiago', role: 'Developer' },
];

export function Team() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6">The Team</h2>
          <p className="text-lg text-gray-600">
            BSIT 3C-G2 students from Bulacan State University, College of Information 
            and Communication Technology.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Academic Institution</h3>
                <p className="text-gray-600">Bulacan State University</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">College</p>
                <p className="font-medium">College of Information and Communication Technology</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Program</p>
                <p className="font-medium">Bachelor of Science in Information Technology</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Major</p>
                <p className="font-medium">Infrastructure Services</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Completion Date</p>
                <p className="font-medium">March 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
