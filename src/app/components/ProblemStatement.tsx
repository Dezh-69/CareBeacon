import { AlertTriangle, Users, Clock } from 'lucide-react';

export function ProblemStatement() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-6">The Problem</h2>
          <p className="text-lg text-gray-600">
            Falls are a critical safety concern for elderly individuals living alone, 
            especially in the Philippines where many families have members working abroad.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="size-8 text-red-600" />
            </div>
            <h3 className="text-xl mb-3">Global Impact</h3>
            <p className="text-gray-600 mb-4">
              The WHO reports that falls are the 2nd leading cause of unintentional injury deaths globally.
            </p>
            <div className="text-3xl text-red-600 mb-2">684,000</div>
            <p className="text-sm text-gray-500">annual deaths from falls worldwide</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="inline-flex p-4 bg-orange-100 rounded-full mb-4">
              <Users className="size-8 text-orange-600" />
            </div>
            <h3 className="text-xl mb-3">Filipino Context</h3>
            <p className="text-gray-600 mb-4">
              By 2030, 7% of Filipinos will be 65+ years old. Many live alone due to migration.
            </p>
            <div className="text-3xl text-orange-600 mb-2">53.6%</div>
            <p className="text-sm text-gray-500">of older Filipinos have experienced falls</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
              <Clock className="size-8 text-purple-600" />
            </div>
            <h3 className="text-xl mb-3">Critical Time</h3>
            <p className="text-gray-600 mb-4">
              Delayed response significantly increases the risk of fatal consequences.
            </p>
            <div className="text-3xl text-purple-600 mb-2">20%</div>
            <p className="text-sm text-gray-500">stay on ground for 1+ hour after falling</p>
          </div>
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl mb-4 text-center">Our Mission</h3>
          <p className="text-lg text-gray-700 text-center">
            This project aims to decrease the time between a fall and the arrival of rescue 
            personnel by providing an affordable, reliable, and automated fall detection system 
            specifically designed for Filipino families.
          </p>
        </div>
      </div>
    </div>
  );
}
