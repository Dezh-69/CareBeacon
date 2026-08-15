import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Radio, MapPin } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <p className="text-sm">Bulacan State University • BSIT Capstone Project 2026</p>
            </div>
            
            <h1 className="text-4xl lg:text-5xl mb-6">
              ESP32 Wearable Device for Real-Time Fall Detection & GPS Alerts
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              An innovative IoT solution enhancing safety and quality of care for elderly adults living alone in the Philippines.
            </p>
            
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Detection Accuracy</p>
                  <p className="font-semibold">~95%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Radio className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Two-Way Audio</p>
                  <p className="font-semibold">Real-Time</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">GPS Tracking</p>
                  <p className="font-semibold">Location Alerts</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
                Learn More
              </button>
              <button className="px-6 py-3 border-2 border-white rounded-lg font-medium hover:bg-white/10 transition">
                View Features
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-2xl blur-3xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758691030927-a48a1d74d179?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGVyc29uJTIwd2VhcmluZyUyMHRlY2hub2xvZ3klMjBkZXZpY2V8ZW58MXx8fHwxNzc0NDUyMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Elderly person with wearable technology"
              className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
