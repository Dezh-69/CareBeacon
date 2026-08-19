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

interface EmergencyContactsProps {
  familyId: string;
}

export function EmergencyContacts({ familyId }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  useEffect(() => {
    const contactsRef = ref(db, `families/${familyId}/contacts`);
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
  }, [familyId]);

  const handleAddContact = async () => {
    if (!newName || !newPhone) return;
    
    const contactsRef = ref(db, `families/${familyId}/contacts`);
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
    const contactRef = ref(db, `families/${familyId}/contacts/${id}`);
    await remove(contactRef);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-foreground">Emergency Network</h2>
          <p className="text-sm text-muted-foreground">Priority-based alert system</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition shadow-sm"
        >
          <Plus className="size-4" />
          <span>Add Contact</span>
        </button>
      </div>
      
      {/* Add Contact Form */}
      {showAddForm && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 text-foreground">New Emergency Contact</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleAddContact}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition"
            >
              Save Contact
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 bg-muted border border-border rounded-xl hover:bg-muted/80 text-muted-foreground transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Alert Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="size-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Alert Configuration</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Send SMS alerts to all contacts', checked: true },
            { label: 'Enable voice call escalation after 2 minutes', checked: true },
            { label: 'Send location coordinates with every alert', checked: true },
            { label: 'Email notifications for non-urgent events', checked: false },
          ].map((setting, index) => (
            <label key={index} className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg hover:border-primary/30 transition cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border text-primary focus:ring-primary"
                defaultChecked={setting.checked}
              />
              <span className="text-sm text-foreground">{setting.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Contact Cards */}
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="relative group">
            <div className={`relative bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
              contact.isPrimary 
                ? 'border-warning/50' 
                : 'border-border hover:border-primary/30'
            }`}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`relative size-14 rounded-xl flex items-center justify-center font-bold text-lg text-white ${
                    index === 0 ? 'bg-warning' :
                    index === 1 ? 'bg-primary' :
                    'bg-secondary'
                  }`}>
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 rounded-lg text-xs font-medium">
                          <Star className="size-3 fill-current" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{contact.relationship}</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
                      Priority {contact.priority}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2.5 hover:bg-muted rounded-xl transition border border-transparent hover:border-border">
                    <Edit2 className="size-4 text-muted-foreground hover:text-foreground" />
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2.5 hover:bg-destructive/10 rounded-xl transition border border-transparent hover:border-destructive/30"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-xl">
                  <Phone className="size-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-foreground">{contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-xl">
                  <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="text-sm font-medium text-foreground truncate">{contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {contacts.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
          <div className="inline-flex p-6 bg-muted rounded-2xl mb-4">
            <Phone className="size-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-6">No emergency contacts configured</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition"
          >
            Add Your First Contact
          </button>
        </div>
      )}
      
      {/* Emergency Services */}
      <div className="bg-card border border-destructive/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Philippines Emergency Services</h3>
            <p className="text-xs text-muted-foreground">Quick access to emergency hotlines</p>
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
              className="block p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-center hover:bg-destructive/10 transition"
            >
              <p className="text-xs text-destructive mb-1">{service.name}</p>
              <p className="text-xl font-bold text-destructive">{service.number}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
