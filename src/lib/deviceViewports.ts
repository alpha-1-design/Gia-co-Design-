import { PreviewDevice } from '../types';

export const DEVICE_VIEWPORTS: Record<PreviewDevice, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1280, height: 800 },
};
