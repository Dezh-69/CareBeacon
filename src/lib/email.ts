/**
 * Utility to send an email via EmailJS HTTP API.
 * This is a 100% free workaround to notify existing caregivers without requiring a Firebase Blaze plan.
 */
export async function sendJoinRequestEmail(newUserName: string, deviceSerial: string) {
  // To make this work, create a free account at https://www.emailjs.com/
  // Replace these with your actual Service ID, Template ID, and Public Key from the dashboard.
  const serviceId = 'YOUR_EMAILJS_SERVICE_ID';
  const templateId = 'YOUR_EMAILJS_TEMPLATE_ID';
  const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';

  if (serviceId.includes('YOUR_')) {
    console.log(`[EmailJS Mock] Email notification triggered for ${newUserName} joining device ${deviceSerial}`);
    return;
  }

  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          new_user_name: newUserName,
          device_serial: deviceSerial,
          // You could pass the destination email here if you retrieve it, 
          // or configure the EmailJS template to email a central inbox 
          // or use the Bcc feature in the EmailJS dashboard.
        }
      })
    });
  } catch (error) {
    console.error('Failed to send join request email notification:', error);
  }
}
