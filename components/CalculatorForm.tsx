
import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorState, ProductSelection } from '../types';
import { PRODUCT_DATA, DELIVERY_VEHICLES, RETURN_VEHICLES } from '../constants';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';

const RefreshCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="10" x2="16" y2="18"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="8" y1="10" x2="8" y2="18"/></svg>;


interface CalculatorFormProps {
  inputs: CalculatorState;
  onInputChange: (field: keyof CalculatorState, value: any) => void;
  onCalculate: (selection: ProductSelection | null) => void;
  onReset: () => void;
}

const Fieldset: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
    <fieldset className="mb-6">
        <legend className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4 w-full">{legend}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </fieldset>
);


const CalculatorForm: React.FC<CalculatorFormProps> = ({ inputs, onInputChange, onCalculate, onReset }) => {
  const { manufacturer, category, product, variant, returnPalettes } = inputs;

  const availableCategories = useMemo(() => Object.keys(PRODUCT_DATA[manufacturer]?.categories || {}), [manufacturer]);
  const availableProducts = useMemo(() => PRODUCT_DATA[manufacturer]?.categories?.[category] || [], [manufacturer, category]);
  const availableVariants = useMemo(() => availableProducts.find(p => p.name === product)?.variants || [], [availableProducts, product]);

  const selectedProductData = useMemo(() => {
    return availableProducts.find(p => p.name === product) || null;
  }, [availableProducts, product]);
  
  const productUnit = selectedProductData?.unit || 'm2';

  // Cascade selection updates
  useEffect(() => {
    if (!availableCategories.includes(category)) {
      onInputChange('category', availableCategories[0] || '');
    }
  }, [manufacturer, category, availableCategories, onInputChange]);

  useEffect(() => {
    const productNames = availableProducts.map(p => p.name);
    if (!productNames.includes(product)) {
      onInputChange('product', productNames[0] || '');
    }
  }, [category, product, availableProducts, onInputChange]);

  useEffect(() => {
    const variantNames = availableVariants.map(v => v.name);
    if (!variantNames.includes(variant)) {
      onInputChange('variant', variantNames[0] || '');
    }
  }, [product, variant, availableVariants, onInputChange]);


  const getProductSelection = (): ProductSelection | null => {
    const productInfo = PRODUCT_DATA[manufacturer]?.categories?.[category]?.find(p => p.name === product);
    const variantInfo = productInfo?.variants.find(v => v.name === variant);
    if (!productInfo || !variantInfo) return null;
    
    return {
        pricePerUnit: variantInfo.pricePerUnit,
        weightKgPerUnit: productInfo.weightKgPerUnit,
        unitsPerPalette: productInfo.unitsPerPalette,
        unit: productInfo.unit,
    };
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Kalkulācijas forma</h2>
        <button onClick={onReset} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            <RefreshCwIcon /> Atiestatīt
        </button>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <Fieldset legend="PRODUKTA IZVĒLE">
            <Select label="Ražotājs:" id="manufacturer" value={manufacturer} onChange={e => onInputChange('manufacturer', e.target.value)}>
                {Object.keys(PRODUCT_DATA).map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}</option>)}
            </Select>
            <Select label="Produkta kategorija:" id="category" value={category} onChange={e => onInputChange('category', e.target.value)} disabled={!availableCategories.length}>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div>
                <Select label="Produkta nosaukums:" id="product" value={product} onChange={e => onInputChange('product', e.target.value)} disabled={!availableProducts.length}>
                    {availableProducts.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </Select>
                 {selectedProductData?.dimensions && (
                    <p className="text-xs text-slate-500 mt-1 pl-1">Izmērs: {selectedProductData.dimensions}</p>
                )}
            </div>
            <Select label="Krāsa / variācija:" id="variant" value={variant} onChange={e => onInputChange('variant', e.target.value)} disabled={!availableVariants.length}>
                {availableVariants.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
            </Select>
        </Fieldset>
        
        <Fieldset legend="APJOMS">
            <Input 
                label={productUnit === 'm2' ? "Kvadratūra:" : "Daudzums:"}
                id="quantity" 
                type="number" 
                min="1" 
                step="0.01" 
                value={inputs.quantity} 
                onChange={e => onInputChange('quantity', parseFloat(e.target.value))} 
                unit={productUnit === 'm2' ? 'm²' : 'gab.'}
            />
            {productUnit === 'm2' && (
                <Input label="Piezāģes:" id="cutting" type="number" min="0" max="100" value={inputs.cutting} onChange={e => onInputChange('cutting', parseInt(e.target.value, 10))} unit="%"/>
            )}
        </Fieldset>

        <Fieldset legend="PIEGĀDES INFORMĀCIJA">
            <Input label="Piegādes Attālums (vienā virzienā):" id="distance" type="number" min="0" step="0.1" value={inputs.distance} onChange={e => onInputChange('distance', parseFloat(e.target.value))} unit="km"/>
            <div className="md:col-span-2">
                <Select label="Piegādes Veids:" id="delivery" value={inputs.delivery} onChange={e => onInputChange('delivery', e.target.value)}>
                    {Object.entries(DELIVERY_VEHICLES).map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}
                </Select>
            </div>
        </Fieldset>

        <Fieldset legend="PALEŠU ATGRIEŠANA">
            <div className="md:col-span-2">
                <Checkbox label="Vēlos atgriezt paletes" id="returnPalettes" checked={returnPalettes} onChange={e => onInputChange('returnPalettes', e.target.checked)} />
            </div>
            {returnPalettes && (
                <>
                    <Select label="Atgriešanas Transporta Veids:" id="returnType" value={inputs.returnType} onChange={e => onInputChange('returnType', e.target.value)}>
                        {Object.entries(RETURN_VEHICLES).map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}
                    </Select>
                    <Input label="Sabojātās Paletes:" id="broken" type="number" min="0" max="100" step="1" value={inputs.brokenPalettes} onChange={e => onInputChange('brokenPalettes', parseInt(e.target.value, 10))} unit="%"/>
                </>
            )}
        </Fieldset>
        
        <div className="mt-8">
            <Button onClick={() => onCalculate(getProductSelection())} className="gap-2">
                <CalculatorIcon/> Aprēķināt Izmaksas
            </Button>
        </div>
      </form>
    </Card>
  );
};

export default CalculatorForm;
