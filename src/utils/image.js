/**
* Converts an image file to the Base64 format required by Kling API
* @param {string} dataUrl - The data URL string from FileReader (e.target.result)
* @returns {string} - Clean Base64 string without the data URL prefix
*/
export const convertImageToBase64 = (dataUrl) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    console.error('Invalid data URL format');
    return null;
  }

  // Extract the Base64 string without the prefix
  // Format is typically: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...
  const base64String = dataUrl.split(',')[1];
  
  if (!base64String) {
    console.error('Failed to extract Base64 string from data URL');
    return null;
  }
  
  return base64String;
};
