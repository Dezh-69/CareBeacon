import { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Radio } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { db, ref, onValue } from '../../lib/db';

interface LocationMapProps {
  deviceId: string;
}

export function LocationMap({ deviceId }: LocationMapProps) {
  const mapUrl = `https://images.unsplash.com/photo-1764347923709-fc48487f2486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHUFMlMjBsb2NhdGlvbiUyMHRyYWNraW5nJTIwbWFwfGVufDF8fHx8MTc3NDQ1MjAzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral`;
  
  const [location, setLocation] = useState({
    lat: 14.6042,
    lng: 120.9822,
    address: 'Fetching location...',
  });
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const locRef = ref(db, `devices/${deviceId}/location`);
    const timeRef = ref(db, `devices/${deviceId}/lastUpdate`);
    
    const unsubLoc = onValue(locRef, (snap) => {
      if (snap.val()) setLocation(snap.val());
    });
    const unsubTime = onValue(timeRef, (snap) => {
      if (snap.val()) setLastUpdate(snap.val());
    });
    
    return () => { unsubLoc(); unsubTime(); };
  }, [deviceId]);
  
  return (
    <div className="space-y-6">
      {/* Coordinates Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="size-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Latitude</span>
          </div>
          <p className="text-xl font-semibold font-mono text-foreground">{location.lat.toFixed(6)}</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="size-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Longitude</span>
          </div>
          <p className="text-xl font-semibold font-mono text-foreground">{location.lng.toFixed(6)}</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow hover:border-success/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Navigation className="size-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Location</span>
          </div>
          <p className="text-sm font-medium text-foreground">{location.address}</p>
        </div>
      </div>
      
      {/* Map Display */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="relative h-[600px]">
          <ImageWithFallback
            src={mapUrl}
            alt="Location Map"
            className="w-full h-full object-cover"
          />
          
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          
          {/* Location Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-32 bg-primary/20 rounded-full animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
                <div className="size-24 bg-primary/30 rounded-full animate-ping"></div>
              </div>
              
              {/* Center marker */}
              <div className="relative z-10">
                <div className="relative p-4 bg-primary rounded-full shadow-lg border-4 border-background">
                  <MapPin className="size-8 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Top info bar */}
          <div className="absolute top-6 left-6 right-6 flex gap-3">
            <div className="flex-1 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Position Update</p>
                  <p className="text-sm font-semibold text-foreground">{new Date().toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="size-4 text-success" />
                  <span className="text-xs text-success font-medium">GPS Active</span>
                </div>
              </div>
            </div>
            
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 bg-card/90 backdrop-blur-xl border border-border hover:border-primary/50 hover:bg-muted rounded-xl transition flex items-center gap-2 text-sm font-medium text-foreground shadow-sm"
            >
              <ExternalLink className="size-4" />
              Open Maps
            </a>
          </div>
          
          {/* Bottom info bar */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border mb-4 w-fit">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                </span>
                Live Tracking Active {lastUpdate ? `• Last updated: ${new Date(lastUpdate).toLocaleTimeString()}` : ''}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <MapPin className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Address</p>
                    <p className="font-semibold text-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-sm font-semibold text-foreground">± 5 meters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-muted border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Production system integrates with Google Maps API for interactive mapping and route history.
          </p>
        </div>
      </div>
    </div>
  );
}
