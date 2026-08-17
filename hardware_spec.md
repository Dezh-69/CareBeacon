# CareBeacon ESP32 Hardware Integration Spec

This document outlines the JSON payloads the ESP32 hardware must send to Firebase Realtime Database.

## 1. Device Status Updates (Heartbeat)
The ESP32 should periodically update its connection status and battery level.

**Path:** `devices/{deviceId}`
**Method:** `PATCH` or `PUT`

```json
{
  "status": "online",
  "battery": 85.5,
  "lastUpdate": "2024-03-20T10:30:00Z",
  "location": {
    "lat": 1.3521,
    "lng": 103.8198
  }
}
```

## 2. Emergency Events (Falls & SOS)
When a fall is detected or the SOS button is pressed, the ESP32 must create a new event.

**Path:** `events/{deviceId}/{eventId}`
**Method:** `PUT`

```json
{
  "timestamp": "2024-03-20T14:22:00Z",
  "status": "pending", // Can be 'pending', 'confirmed', 'resolved', 'cancelled', 'emergency'
  "location": "Kitchen",
  "contactNotified": "None",
  "receipts": [] // Empty array initially
}
```

## 3. Alert Delivery Receipts
After the SIM7080G module finishes calling or texting the emergency contacts, it must update the event with the delivery status so the Admin Dashboard can track it.

**Path:** `events/{deviceId}/{eventId}/receipts`
**Method:** `PUT` or Array append

```json
[
  {
    "method": "SMS",
    "contactName": "Maria Santos",
    "timestamp": "2024-03-20T14:22:05Z",
    "status": "Delivered" // or "Failed"
  },
  {
    "method": "Call",
    "contactName": "Maria Santos",
    "timestamp": "2024-03-20T14:22:10Z",
    "status": "Failed"
  }
]
```
