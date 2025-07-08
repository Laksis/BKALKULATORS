
import React, { useState, useCallback } from 'react';
import { CalculatorState, Results, ProductSelection } from './types';
import { INITIAL_CALCULATOR_STATE, PRODUCT_DATA, DELIVERY_VEHICLES, RETURN_VEHICLES } from './constants';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);
  const [results, setResults] = useState<Results | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [lastProductSelection, setLastProductSelection] = useState<ProductSelection | null>(null);

  const handleInputChange = useCallback((field: keyof CalculatorState, value: string | number | boolean) => {
    setInputs(prev => {
        const newInputs = { ...prev, [field]: value };
        // If a calculation has already been made, re-calculate on every input change
        if (hasCalculated && lastProductSelection) {
            calculateCosts(lastProductSelection, newInputs);
        }
        return newInputs;
    });
  }, [hasCalculated, lastProductSelection]);

  const resetCalculator = useCallback(() => {
    setInputs(INITIAL_CALCULATOR_STATE);
    setResults(null);
    setHasCalculated(false);
    setLastProductSelection(null);
  }, []);

  const calculateCosts = useCallback((productSelection: ProductSelection | null, currentInputs: CalculatorState = inputs) => {
    if (!productSelection) {
        if(hasCalculated) return; // Don't show alert on subsequent automatic recalculations
        alert("Lūdzu, aizpildiet visus produkta atlases laukus.");
        return;
    }

    const { manufacturer, quantity, cutting, distance, delivery, returnPalettes, returnType, brokenPalettes } = currentInputs;
    const { pricePerUnit, weightKgPerUnit, unitsPerPalette, unit } = productSelection;

    const manufacturerData = PRODUCT_DATA[manufacturer];
    const paletteDeposit = manufacturerData.paletteDeposit;

    // 1. Paving Costs
    const totalUnits = unit === 'm2' ? quantity * (1 + cutting / 100) : quantity;
    const pavingCost = totalUnits * pricePerUnit;

    // 2. Palette and Weight Calculation
    const palettesNeeded = Math.ceil(totalUnits / unitsPerPalette);
    const totalWeightKg = totalUnits * weightKgPerUnit;
    const totalWeightTons = totalWeightKg / 1000;

    // 3. Delivery Costs
    const deliveryVehicle = DELIVERY_VEHICLES[delivery];
    const deliveryTrips = Math.ceil(totalWeightTons / deliveryVehicle.capacityTons);
    let deliveryCost = 0;

    if (distance > 0) {
        const totalDeliveryDistanceKm = deliveryTrips * distance * 2; // round trip
        const calculatedDeliveryCost = totalDeliveryDistanceKm * deliveryVehicle.costPerKm;
        // Apply vehicle-specific minimum fee, but only if there is a delivery.
        deliveryCost = Math.max(calculatedDeliveryCost, deliveryVehicle.minCost);
    }


    // 4. Palette Return Calculation
    let paletteDepositTotal = palettesNeeded * paletteDeposit;
    let paletteReturnNet = 0;
    let returnTransportCost = 0;
    let paletteRefund = 0;
    
    if (returnPalettes && palettesNeeded > 0) {
        const returnablePalettes = Math.floor(palettesNeeded * (1 - brokenPalettes / 100));
        if (returnablePalettes > 0) {
            const returnVehicle = RETURN_VEHICLES[returnType];
            const returnTrips = Math.ceil(returnablePalettes / returnVehicle.capacityPalettes);
            const totalReturnDistanceKm = returnTrips * distance * 2;
            const calculatedReturnCost = totalReturnDistanceKm * returnVehicle.costPerKm;
            // Apply vehicle-specific minimum fee for returns
            returnTransportCost = Math.max(calculatedReturnCost, returnVehicle.minCost);
            paletteRefund = returnablePalettes * paletteDeposit;
        }
        paletteReturnNet = paletteRefund - returnTransportCost;
    } else {
        // If not returning, the deposit is a cost
        paletteReturnNet = -paletteDepositTotal;
    }
    
    // 5. Total Costs
    const totalCost = pavingCost + deliveryCost - paletteReturnNet;

    setResults({
        totalUnits,
        unit,
        pavingCost,
        palettesNeeded,
        totalWeightTons,
        deliveryCost,
        paletteDepositTotal,
        returnTransportCost,
        paletteRefund,
        paletteReturnNet,
        totalCost,
    });

  }, [inputs, hasCalculated]);
  
  const handleInitialCalculate = useCallback((selection: ProductSelection | null) => {
    setLastProductSelection(selection);
    setHasCalculated(true);
    calculateCosts(selection, inputs);
  }, [inputs, calculateCosts]);


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">IZMAKSU KALKULATORS</h1>
            <p className="mt-2 text-lg text-slate-600">Aprēķiniet sava nākamā projekta izmaksas ātri un vienkārši.</p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <CalculatorForm 
              inputs={inputs} 
              onInputChange={handleInputChange} 
              onCalculate={handleInitialCalculate}
              onReset={resetCalculator}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsDisplay results={results} />
          </div>
        </main>
        <footer className="text-center mt-12 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Izmaksu Kalkulators. Visas tiesības aizsargātas.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
