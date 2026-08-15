import { useState, useEffect } from 'react';
import { Phone, Mail, Plus, Edit2, Trash2, Star, Shield, AlertCircle } from 'lucide-react';
import { db, ref, onValue, push, set, remove } from '../../lib/db';

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority: number;
  isPrimary: boolean;
}

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  const deviceId = "device_001"; // Generic device ID
  
  useEffect(() => {
    const contactsRef = ref(db, `contacts/${deviceId}`);
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsedContacts: Contact[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.priority - b.priority);
        setContacts(parsedContacts);
      } else {
        setContacts([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleAddContact = async () => {
    if (!newName || !newPhone) return;
    
    const contactsRef = ref(db, `contacts/${deviceId}`);
    const newContactRef = push(contactsRef);
    
    const newContact = {
      name: newName,
      relationship: newRelationship,
      phone: newPhone,
      email: newEmail,
      priority: contacts.length + 1,
      isPrimary: contacts.length === 0, // First contact is primary
    };
    
    await set(newContactRef, newContact);
    
    // Reset form
    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setNewEmail('');
    setShowAddForm(false);
  };
  
  const handleDeleteContact = async (id: string) => {
    const contactRef = ref(db, `contacts/${deviceId}/${id}`);
    await remove(contactRef);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Emergency Network</h2>
          <p className="text-sm text-slate-400">Priority-based alert system</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition shadow-lg shadow-indigo-500/25"
        >
          <Plus className="size-4" />
          <span>Add Contact</span>
        </button>
      </div>
      
      {/* Add Contact Form */}
      {showAddForm && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="font-semibold mb-6">New Emergency Contact</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                className="px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAddContact}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl transition hover:from-indigo-500 hover:to-purple-500"
              >
                Save Contact
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Settings */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="size-5 text-blue-400" />
            </div>
            <h3 className="font-semibold">Alert Configuration</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Send SMS alerts to all contacts', checked: true },
              { label: 'Enable voice call escalation after 2 minutes', checked: true },
              { label: 'Send location coordinates with every alert', checked: true },
              { label: 'Email notifications for non-urgent events', checked: false },
            ].map((setting, index) => (
              <label key={index} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  defaultChecked={setting.checked}
                />
                <span className="text-sm text-slate-200">{setting.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact Cards */}
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="relative group">
            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition ${
              index === 0 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' :
              index === 1 ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' :
              'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
            }`}></div>
            
            <div className={`relative bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition ${
              contact.isPrimary 
                ? 'border-amber-500/30' 
                : 'border-slate-800/50 hover:border-slate-700/50'
            }`}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`relative size-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                    index === 1 ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                    'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}>
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium">
                          <Star className="size-3 fill-current" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{contact.relationship}</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium">
                      Priority {contact.priority}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2.5 hover:bg-slate-800/50 rounded-xl transition border border-transparent hover:border-slate-700/50">
                    <Edit2 className="size-4 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2.5 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/30"
                  >
                    <Trash2 className="size-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Phone className="size-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                    <p className="text-sm font-medium">{contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Mail className="size-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Email</p>
                    <p className="text-sm font-medium truncate">{contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {contacts.length === 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-16 text-center">
            <div className="inline-flex p-6 bg-slate-800/30 rounded-2xl mb-4">
              <Phone className="size-12 text-slate-600" />
            </div>
            <p className="text-slate-400 mb-6">No emergency contacts configured</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition"
            >
              Add Your First Contact
            </button>
          </div>
        </div>
      )}
      
      {/* Emergency Services */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-50"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="size-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-300">Philippines Emergency Services</h3>
              <p className="text-xs text-slate-400">Quick access to emergency hotlines</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Emergency', number: '911' },
              { name: 'Red Cross', number: '143' },
              { name: 'PNP Hotline', number: '117' },
            ].map((service, index) => (
              <a 
                key={index} 
                href={`tel:${service.number}`}
                className="block p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-center hover:bg-red-500/10 transition"
              >
                <p className="text-xs text-red-400 mb-1">{service.name}</p>
                <p className="text-xl font-bold text-red-300">{service.number}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
