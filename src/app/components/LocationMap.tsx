import { MapPin, Navigation, ExternalLink, Radio } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LocationMapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export function LocationMap({ location }: LocationMapProps) {
  const mapUrl = `https://images.unsplash.com/photo-1764347923709-fc48487f2486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHUFMlMjBsb2NhdGlvbiUyMHRyYWNraW5nJTIwbWFwfGVufDF8fHx8MTc3NDQ1MjAzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral`;
  
  return (
    <div className="space-y-6">
      {/* Coordinates Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-blue-500/30 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MapPin className="size-5 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Latitude</span>
            </div>
            <p className="text-xl font-semibold font-mono">{location.lat.toFixed(6)}</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-purple-500/30 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <MapPin className="size-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Longitude</span>
            </div>
            <p className="text-xl font-semibold font-mono">{location.lng.toFixed(6)}</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-emerald-500/30 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Navigation className="size-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Location</span>
            </div>
            <p className="text-sm font-medium">{location.address}</p>
          </div>
        </div>
      </div>
      
      {/* Map Display */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition"></div>
        
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
          <div className="relative h-[600px]">
            <ImageWithFallback
              src={mapUrl}
              alt="Location Map"
              className="w-full h-full object-cover"
            />
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
            
            {/* Location Marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Pulsing rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-32 bg-indigo-500/30 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
                  <div className="size-24 bg-purple-500/30 rounded-full animate-ping"></div>
                </div>
                
                {/* Center marker */}
                <div className="relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-lg opacity-75"></div>
                  <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl border-4 border-slate-900">
                    <MapPin className="size-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top info bar */}
            <div className="absolute top-6 left-6 right-6 flex gap-3">
              <div className="flex-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Last Position Update</p>
                    <p className="text-sm font-semibold">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="size-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">GPS Active</span>
                  </div>
                </div>
              </div>
              
              <button className="px-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 hover:border-indigo-500/50 rounded-xl transition flex items-center gap-2 text-sm font-medium">
                <ExternalLink className="size-4" />
                Open Maps
              </button>
            </div>
            
            {/* Bottom info bar */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                      <MapPin className="size-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Current Address</p>
                      <p className="font-semibold">{location.address}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Accuracy</p>
                    <p className="text-sm font-semibold">± 5 meters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 border-t border-slate-800/50">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Note:</strong> Production system integrates with Google Maps API for interactive mapping and route history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
