
import React from 'react';

export enum Resolution {
  _1K = '1K',
  _2K = '2K',
  _4K = '4K',
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  WIDE = '21:9',
}

export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
}

export interface CinematicParams {
  subject?: string;
  shotType?: string;
  viewDirection?: string;
  environment?: string;
  lightingSource?: string;
  atmosphere?: string;
  cameraBody?: string;
  focalLength?: string;
  lensType?: string;
  filmStock?: string;
  genre?: string;
  photographerStyle?: string;
  movieLook?: string;
  filter?: string;
}

export interface ImageGenerationState {
  isLoading: boolean;
  imageUrl: string | null;
  error: string | null;
}

