import { School, Calendar, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-start gap-3">
              <School className="size-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Institution</h4>
                <p className="text-sm text-gray-400">
                  Bulacan State University<br />
                  College of Information and Communication Technology
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Project Timeline</h4>
                <p className="text-sm text-gray-400">
                  Capstone Project<br />
                  March 2026
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-sm text-gray-400">
                  Bulacan, Philippines
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2026 ESP32 Fall Detection Project. Developed as partial fulfillment for BSIT degree.
              </p>
              <p className="text-sm text-gray-400">
                BSIT 3C-G2
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
