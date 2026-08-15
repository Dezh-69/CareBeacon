import { ref as fbRef, onValue as fbOnValue, push as fbPush, set as fbSet, update as fbUpdate, remove as fbRemove } from 'firebase/database';
import { db as firebaseDb } from './firebase';

const isDemo = import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDemoPurposesOnly123456" || !import.meta.env.VITE_FIREBASE_API_KEY;

// Simple Local Storage Mock DB for Demo Mode
const listeners: Record<string, Function[]> = {};

function getLocalData(path: string) {
  const data = localStorage.getItem('carebeacon_mock_db');
  const parsed = data ? JSON.parse(data) : {};
  
  const parts = path.split('/').filter(Boolean);
  let current = parsed;
  for (const part of parts) {
    if (current === undefined || current === null) return null;
    current = current[part];
  }
  return current;
}

function setLocalData(path: string, value: any) {
  const data = localStorage.getItem('carebeacon_mock_db');
  const parsed = data ? JSON.parse(data) : {};
  
  const parts = path.split('/').filter(Boolean);
  const lastPart = parts.pop();
  let current = parsed;
  
  for (const part of parts) {
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  if (lastPart) {
    if (value === null) {
      delete current[lastPart];
    } else {
      current[lastPart] = value;
    }
  }
  
  localStorage.setItem('carebeacon_mock_db', JSON.stringify(parsed));
  
  // Trigger listeners
  Object.keys(listeners).forEach(listenerPath => {
    if (path.startsWith(listenerPath) || listenerPath.startsWith(path)) {
      listeners[listenerPath].forEach(cb => cb(getLocalData(listenerPath)));
    }
  });
}

function updateLocalData(path: string, value: any) {
  const existing = getLocalData(path) || {};
  setLocalData(path, { ...existing, ...value });
}

// Seed initial demo data if not present (using v2 to force re-seed with new mock data)
if (isDemo && !localStorage.getItem('carebeacon_mock_db_v2')) {
  const seedData = {
    devices: {
      device_001: {
        status: 'online',
        battery: 85,
        lastUpdate: new Date().toISOString(),
        location: {
          lat: 14.6042,
          lng: 120.9822,
          address: 'Quezon City, Metro Manila',
        },
        user: {
          name: 'Lola Maria',
          age: 72,
        },
      },
    },
    events: {
      device_001: {
        evt_seed_001: {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          location: 'Quezon City, Metro Manila',
          responseTime: '3 min',
          contactNotified: 'Juan Dela Cruz',
        },
        evt_seed_002: {
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          location: 'Makati City, Metro Manila',
          responseTime: '5 min',
          contactNotified: 'Maria Santos',
        },
        evt_seed_003: {
          timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'cancelled',
          location: 'Quezon City, Metro Manila',
          responseTime: '1 min',
          contactNotified: 'None (False Alarm)',
        },
        evt_seed_004: {
          timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          location: 'Quezon City, Metro Manila',
          responseTime: '4 min',
          contactNotified: 'Juan Dela Cruz',
        },
        evt_seed_005: {
          timestamp: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          location: 'Quezon City, Metro Manila',
          responseTime: '7 min',
          contactNotified: 'Dr. Reyes',
        },
      },
    },
    contacts: {
      device_001: {
        contact_001: {
          name: 'Juan Dela Cruz',
          relationship: 'Son',
          phone: '+63 917 123 4567',
          email: 'juan@example.com',
          priority: 1,
          isPrimary: true,
        },
        contact_002: {
          name: 'Maria Santos',
          relationship: 'Daughter',
          phone: '+63 918 987 6543',
          email: 'maria@example.com',
          priority: 2,
          isPrimary: false,
        },
        contact_003: {
          name: 'Dr. Reyes',
          relationship: 'Family Doctor',
          phone: '+63 2 8888 1234',
          email: 'dr.reyes@clinic.com',
          priority: 3,
          isPrimary: false,
        },
      },
    },
  };
  localStorage.setItem('carebeacon_mock_db_v2', 'seeded'); // Mark v2 as seeded
  localStorage.setItem('carebeacon_mock_db', JSON.stringify(seedData));
}

export const db = isDemo ? 'mock_db' : firebaseDb;

export const ref = (database: any, path: string) => {
  if (isDemo) return { path, isMock: true };
  return fbRef(database, path);
};

export const onValue = (reference: any, callback: (snapshot: any) => void) => {
  if (isDemo) {
    const path = reference.path;
    if (!listeners[path]) listeners[path] = [];
    
    const listener = (val: any) => {
      callback({
        exists: () => val !== null && val !== undefined && (typeof val !== 'object' || Object.keys(val).length > 0),
        val: () => val
      });
    };
    
    listeners[path].push(listener);
    listener(getLocalData(path));
    
    return () => {
      listeners[path] = listeners[path].filter(l => l !== listener);
    };
  }
  return fbOnValue(reference, callback);
};

export const push = (reference: any) => {
  if (isDemo) {
    const key = Math.random().toString(36).substring(2, 15);
    return { path: `${reference.path}/${key}`, key, isMock: true };
  }
  return fbPush(reference);
};

export const set = (reference: any, value: any) => {
  if (isDemo) {
    setLocalData(reference.path, value);
    return Promise.resolve();
  }
  return fbSet(reference, value);
};

export const update = (reference: any, value: any) => {
  if (isDemo) {
    updateLocalData(reference.path, value);
    return Promise.resolve();
  }
  return fbUpdate(reference, value);
};

export const remove = (reference: any) => {
  if (isDemo) {
    setLocalData(reference.path, null);
    return Promise.resolve();
  }
  return fbRemove(reference);
};
