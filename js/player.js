let player = {
  lastUpdate: Date.now(),
  lowTiers: Infinity,
  highTiers: Infinity,
  lowLayers: Infinity,
  highLayers: Infinity,
  singularity: {
    unlocked: false,
    currencyAmount: new Decimal(1)
  },
  incrementali: initialIncrementali(),
  generators: [],
  currentTheme: 'ng3 buttons',
  metaDisplay: true,
  saveType: 'full',
  legacyLayers: false,
  version: 6
}

initializeTier();
