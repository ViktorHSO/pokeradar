// "mr-mime" -> "Mr Mime"
export const formatName = (text = '') =>
  text
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
