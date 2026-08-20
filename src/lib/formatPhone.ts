export const formatPhoneNumber = (value: string): string => {
  // Extract only digits
  let digits = value.replace(/\D/g, '');
  
  // Remove 63 if it's at the start (to handle pasting +63...)
  if (digits.startsWith('63')) {
    digits = digits.slice(2);
  }
  
  // Remove leading 0 if present (to handle pasting 0917...)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Limit to 10 digits max
  digits = digits.slice(0, 10);
  
  // Format as +63 XXX XXX XXXX
  let formatted = '+63';
  if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
  if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
  if (digits.length > 6) formatted += ' ' + digits.slice(6, 10);
  
  return formatted;
};
