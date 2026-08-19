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
After the SIM7670G/SIM7672 module finishes calling or texting the emergency contacts, it must update the event with the delivery status so the Admin Dashboard can track it.

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

## 4. GSM Voice Call Signaling (Live Audio)
To support live audio between the caregiver and the patient using the SIM800L module, the dashboard acts as a remote control.

**Path:** `devices/{deviceId}/callRequest`

### When the dashboard initiates a call:
The dashboard will write the caregiver's target phone number and a timestamp to the database.

```json
{
  "targetNumber": "+639123456789",
  "timestamp": 1710940000000,
  "status": "requested" // Can be 'requested', 'dialing', 'in-call', 'ended', 'failed'
}
```

### ESP32 Response (Executing the call):
The ESP32 must listen to this node. When a new `callRequest` appears:
1. Execute the AT command to dial the number: `ATD+639123456789;`
2. Update the `status` field in Firebase to `"dialing"`.
3. Monitor the call status via AT commands and update the Firebase status to `"in-call"` when connected.
4. When the call is terminated (either by the caregiver hanging up or the device hanging up via `ATH`), update the status to `"ended"`.

**Note:** The dashboard will listen to the `status` field to show real-time call progress to the caregiver.
