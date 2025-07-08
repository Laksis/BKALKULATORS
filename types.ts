
export interface Variant {
  name: string;
  pricePerUnit: number;
}

export interface Product {
  name: string;
  unit: 'm2' | 'pcs';
  // Weight in kg per the specified unit (either per m2 or per piece)
  weightKgPerUnit: number;
  // How many units (m2 or pcs) are on a single palette
  unitsPerPalette: number;
  variants: Variant[];
  // Optional physical dimensions of the product, e.g., "200x100x60 mm"
  dimensions?: string; 
  // Optional height for filtering/display, mainly for paving stones
  height?: number; 
}

export interface CategoryData {
  [category: string]: Product[];
}

export interface ManufacturerData {
  categories: CategoryData;
  paletteDeposit: number;
}

export interface ProductData {
  [manufacturer: string]: ManufacturerData;
}


export type DeliveryType = 'truck' | 'crane' | 'crane_trailer';
export type ReturnType = 'bus' | 'crane' | 'truck';

export interface CalculatorState {
  manufacturer: string;
  category: string;
  product: string;
  variant: string;
  quantity: number;
  cutting: number;
  distance: number;
  delivery: DeliveryType;
  returnPalettes: boolean;
  returnType: ReturnType;
  brokenPalettes: number;
}

export interface ProductSelection {
    pricePerUnit: number;
    weightKgPerUnit: number;
    unitsPerPalette: number;
    unit: 'm2' | 'pcs';
}

export interface Results {
  totalUnits: number;
  unit: 'm2' | 'pcs';
  pavingCost: number;
  palettesNeeded: number;
  totalWeightTons: number;
  deliveryCost: number;
  paletteDepositTotal: number;
  returnTransportCost: number;
  paletteRefund: number;
  paletteReturnNet: number;
  totalCost: number;
}
