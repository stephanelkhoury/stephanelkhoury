export function getBlobDeliveryUrl(pathname: string) {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  return `/api/blob/${segments.join('/')}`;
}

export function isBlobDeliveryUrl(url: string) {
  return url.startsWith('/api/blob/');
}