const prestigeThreshold = Decimal.pow(10, 24);

function getPrestigeGain (x) {
  x = x.max(1e3);
  let steps = x.log(prestigeThreshold) - 1;
  let gens = Math.log2(x.log(10));
  let pow = 8 * steps / gens;
  return Decimal.floor(Decimal.pow(10, pow));
}

const singularityUnlockExp = 1e4;

function getSingularityPowerEffect () {
  return 1 + (getSingularityPowerCap() - 1) * (1 - Math.exp(-player.singularity.currencyAmount.log10() / 8));
}

function getBoost (tier) {
  let ret = new Decimal(1);
  for (let i = tier + 1; i < player.generators.length; i++) {
    ret = ret.times(player.generators[i].currencyAmount.pow(i - tier));
  }
  return ret;
}

function getMult (i, j) {
  if (isLiquified(i)) {
    if (j === 0) {
      return getLiquifiedMult(i);
    } else {
      return new Decimal(0);
    }
  } else {
    return player.generators[i].list[j].mult.times(getBoost(i)).times(getIncrementaliEffect()).pow(getSingularityPowerEffect());
  }
}

function initializeTier () {
  player.generators.push(getInitialTier(player.generators.length));
}

function resetTier (i) {
  Vue.set(player.generators, i, getInitialTier(i));
}

function partialResetTier (i) {
  player.generators[i].currencyAmount = new Decimal(1);
  for (let j = 0; j < player.generators[i].list.length; j++) {
    player.generators[i].list[j].amount = new Decimal(player.generators[i].list[j].bought);
  }
}

function getInitialTier (i) {
  let r = {
    prestigeAmount: (i === 0) ? new Decimal(1) : new Decimal(0),
    prestigeName: getPrestigeCurrencyName(i),
    nextPrestigeName: getPrestigeCurrencyName(i + 1),
    displayName: getDisplayName(i),
    autoMaxAll: i < player.generators.length ? player.generators[i].autoMaxAll : false,
    prestigeGain: i < player.generators.length ? player.generators[i].prestigeGain : false,
    display: i < player.generators.length ? player.generators[i].display : true,
    list: [getInitialGenerator(i, 0)]
  }
  if (i !== 0) {
    r.currencyAmount = new Decimal(1);
    r.currencyName = getProducedCurrencyName(i);
  }
  return r;
}

function initializeGenerator (i) {
  player.generators[i].list.push(getInitialGenerator(i, player.generators[i].list.length));
}

function getInitialGenerator (i, j) {
  return {
    cost: Decimal.pow(10, (j === 0) ? 0 : Math.pow(2, j)),
    mult: new Decimal(1),
    amount: new Decimal(0),
    bought: 0,
    generatorName: ((i === 0) ? '' : (getPrestigeName(i, title=true))) + ' Dimension ' + (j + 1)
  }
}

// For now I'm not including the singularity layer, because there's already something
// called "singularity power" in Infinite Layers and it boosts all layers.
let prestiges = [
  ['Infinity', 'Eternity', 'Quantum', 'Ghostify',
   'Hadronize', 'Stellar', 'Ethereal', 'Universal', 'Fractalize',
   'Omniversal', 'Abstraction', 'Beyond'],
  ['Infinity', 'Eternity', 'Quantum', 'Ghostify', 'Ethereal',
   'Hadronize', 'Stellar', 'Universal', 'Fractalize', 'Abstraction',
   'Cosmological', 'Beyond', 'Meta', '?', 'Virtualize',
   'Digitize', 'Infinitize', 'Timeless', 'Continuum', 'Omniscient',
   'Spiritual', 'Enlighten']
];
// Universal (both normal and legacy) has two prestige currencies so I had to pick one of them.
// The other is singularity energy in normal, and phantom energy in legacy.
let prestigeCurrencies = [
  ['infinity points', 'eternity points', 'quarks', 'ghost particles',
   'antiquarks', 'dwarf stars', 'starlight', 'phantom energy', 'archverses',
   'infiniteverses', 'transcendentems', 'reality foams'],
  ['infinity points', 'eternity points', 'quarks', 'ghost particles', 'ethereal preons',
   'antiquarks', 'stellar fragments', 'protoverses', 'bubble archverses', 'fractalverses',
   'omniverse foams', 'unreality foams', 'monocosmic objects', '???', 'virtual antimatter',
   'reality bits', 'metamatter', 'eternal universes', 'quantum foams', 'omnipotent memories',
   'immortal spirits', 'reality shards']
];
let numPrestiges = [prestiges[0].length, prestiges[1].length];

function getPrestigeCurrencyName (i) {
  if (i === 0) {
    return 'antimatter';
  } else {
    let legacy = player.legacyLayers ? 1 : 0;
    let r = prestigeCurrencies[legacy][(i + numPrestiges[legacy] - 1) % numPrestiges[legacy]];
    let metaLevel = Math.floor((i - 1) / numPrestiges[legacy]);
    if (metaLevel > 0) {
      r = 'Mk' + (metaLevel + 1) + ' ' + r;
    }
    return r;
  }
}

function getProducedCurrencyName (i) {
  return getPrestigeName(i) + ' power';
}

function getPrestigeName (i, title=false) {
  let legacy = player.legacyLayers ? 1 : 0;
  let main = prestiges[legacy][(i + numPrestiges[legacy] - 1) % numPrestiges[legacy]];
  let metaLevel = Math.floor((i - 1) / numPrestiges[legacy]);
  let r = main;
  if (!title) {
    r = r.toLowerCase();
  }
  if (metaLevel > 0) {
    r = 'Mk' + (metaLevel + 1) + ' ' + r;
  }
  return r;
}

function getDisplayName (i) {
  if (i === 0) {
    return 'Normal';
  } else {
    return getPrestigeName(i, title=true);
  }
}

function updateNames () {
  for (let i = 0; i < player.generators.length; i++) {
    let r = player.generators[i];
    r.prestigeName = getPrestigeCurrencyName(i);
    r.nextPrestigeName = getPrestigeCurrencyName(i + 1);
    r.displayName = getDisplayName(i);
    if (i !== 0) {
      r.currencyName = getProducedCurrencyName(i);
    }
    for (let j = 0; j < r.list.length; j++) {
      r.list[j].generatorName = ((i === 0) ? '' : (getPrestigeName(i, title=true))) + ' Dimension ' + (j + 1);
    }
  }
}
