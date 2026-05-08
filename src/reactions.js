// Brønsted–Lowry acid/base data.
// Each acid has its conjugate base; each base has its conjugate acid.
// `protons` = how many H+ this acid donates in the reaction (default 1).
// `sites`   = how many H+ this base accepts in the reaction (default 1).
// Polyprotic species appear as both single-step and full-transfer entries so
// the random picker can produce mono- and multi-proton reactions.

export const ACIDS = [
  { acid: 'HCl',       acidCharge: 0,  cBase: 'Cl',      cBaseCharge: -1 },
  { acid: 'HBr',       acidCharge: 0,  cBase: 'Br',      cBaseCharge: -1 },
  { acid: 'HF',        acidCharge: 0,  cBase: 'F',       cBaseCharge: -1 },
  { acid: 'HNO_3',     acidCharge: 0,  cBase: 'NO_3',    cBaseCharge: -1 },
  { acid: 'HCN',       acidCharge: 0,  cBase: 'CN',      cBaseCharge: -1 },
  { acid: 'HClO_4',    acidCharge: 0,  cBase: 'ClO_4',   cBaseCharge: -1 },
  { acid: 'CH_3COOH',  acidCharge: 0,  cBase: 'CH_3COO', cBaseCharge: -1 },
  { acid: 'H_2SO_4',   acidCharge: 0,  cBase: 'HSO_4',   cBaseCharge: -1 },
  { acid: 'HSO_4',     acidCharge: -1, cBase: 'SO_4',    cBaseCharge: -2 },
  { acid: 'H_2CO_3',   acidCharge: 0,  cBase: 'HCO_3',   cBaseCharge: -1 },
  { acid: 'HCO_3',     acidCharge: -1, cBase: 'CO_3',    cBaseCharge: -2 },
  { acid: 'H_3O',      acidCharge: 1,  cBase: 'H_2O',    cBaseCharge: 0 },
  { acid: 'NH_4',      acidCharge: 1,  cBase: 'NH_3',    cBaseCharge: 0 },
  { acid: 'CH_3NH_3',  acidCharge: 1,  cBase: 'CH_3NH_2',cBaseCharge: 0 },
  { acid: 'H_2O',      acidCharge: 0,  cBase: 'OH',      cBaseCharge: -1 },
  // Multi-proton acids (full deprotonation).
  { acid: 'H_2SO_4',   acidCharge: 0,  protons: 2, cBase: 'SO_4',   cBaseCharge: -2 },
  { acid: 'H_2CO_3',   acidCharge: 0,  protons: 2, cBase: 'CO_3',   cBaseCharge: -2 },
  { acid: 'H_3PO_4',   acidCharge: 0,  protons: 3, cBase: 'PO_4',   cBaseCharge: -3 },
  { acid: 'H_3PO_4',   acidCharge: 0,  protons: 1, cBase: 'H_2PO_4',cBaseCharge: -1 },
  { acid: 'H_3PO_4',   acidCharge: 0,  protons: 2, cBase: 'HPO_4',  cBaseCharge: -2 },
  { acid: 'H_2PO_4',   acidCharge: -1, protons: 1, cBase: 'HPO_4',  cBaseCharge: -2 },
  { acid: 'H_2PO_4',   acidCharge: -1, protons: 2, cBase: 'PO_4',   cBaseCharge: -3 },
  { acid: 'HPO_4',     acidCharge: -2, protons: 1, cBase: 'PO_4',   cBaseCharge: -3 },
]

export const BASES = [
  { base: 'NH_3',      baseCharge: 0,  cAcid: 'NH_4',     cAcidCharge: 1 },
  { base: 'CH_3NH_2',  baseCharge: 0,  cAcid: 'CH_3NH_3', cAcidCharge: 1 },
  { base: 'H_2O',      baseCharge: 0,  cAcid: 'H_3O',     cAcidCharge: 1 },
  { base: 'OH',        baseCharge: -1, cAcid: 'H_2O',     cAcidCharge: 0 },
  { base: 'F',         baseCharge: -1, cAcid: 'HF',       cAcidCharge: 0 },
  { base: 'CN',        baseCharge: -1, cAcid: 'HCN',      cAcidCharge: 0 },
  { base: 'CH_3COO',   baseCharge: -1, cAcid: 'CH_3COOH', cAcidCharge: 0 },
  { base: 'HCO_3',     baseCharge: -1, cAcid: 'H_2CO_3',  cAcidCharge: 0 },
  { base: 'CO_3',      baseCharge: -2, cAcid: 'HCO_3',    cAcidCharge: -1 },
  { base: 'NO_2',      baseCharge: -1, cAcid: 'HNO_2',    cAcidCharge: 0 },
  { base: 'PO_4',      baseCharge: -3, cAcid: 'HPO_4',    cAcidCharge: -2 },
  // Multi-proton bases (full or partial protonation).
  { base: 'CO_3',      baseCharge: -2, sites: 2, cAcid: 'H_2CO_3', cAcidCharge: 0 },
  { base: 'SO_4',      baseCharge: -2, sites: 2, cAcid: 'H_2SO_4', cAcidCharge: 0 },
  { base: 'PO_4',      baseCharge: -3, sites: 3, cAcid: 'H_3PO_4', cAcidCharge: 0 },
  { base: 'PO_4',      baseCharge: -3, sites: 2, cAcid: 'H_2PO_4', cAcidCharge: -1 },
  { base: 'HPO_4',     baseCharge: -2, sites: 2, cAcid: 'H_3PO_4', cAcidCharge: 0 },
  { base: 'HPO_4',     baseCharge: -2, sites: 1, cAcid: 'H_2PO_4', cAcidCharge: -1 },
  { base: 'H_2PO_4',   baseCharge: -1, sites: 1, cAcid: 'H_3PO_4', cAcidCharge: 0 },
]

// formula equality ignoring charge subscripts since we store them separately
function sameSpecies(a, b) {
  return a.formula === b.formula && a.charge === b.charge
}

function shuffle2(pair) {
  return Math.random() < 0.5 ? pair : [pair[1], pair[0]]
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

// Build a reaction by randomly pairing an acid with a base.
// Skip pairings that produce a trivial / null reaction (acid is the conjugate
// acid of the base, or any product duplicates a reactant).
export function generateReaction() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const a = ACIDS[Math.floor(Math.random() * ACIDS.length)]
    const b = BASES[Math.floor(Math.random() * BASES.length)]

    const protons = a.protons ?? 1
    const sites   = b.sites   ?? 1
    const lcm     = (protons * sites) / gcd(protons, sites)
    const acidCoef = lcm / protons   // also the conjugate-base coefficient
    const baseCoef = lcm / sites     // also the conjugate-acid coefficient

    const reactantAcid = { formula: a.acid,  charge: a.acidCharge,  role: 'acid',          coef: acidCoef }
    const reactantBase = { formula: b.base,  charge: b.baseCharge,  role: 'base',          coef: baseCoef }
    const productCAcid = { formula: b.cAcid, charge: b.cAcidCharge, role: 'conjugateAcid', coef: baseCoef }
    const productCBase = { formula: a.cBase, charge: a.cBaseCharge, role: 'conjugateBase', coef: acidCoef }

    // Reject if the acid IS the conjugate acid of this base (no net reaction).
    if (sameSpecies(reactantAcid, productCAcid)) continue
    // Reject if the base IS the conjugate base of this acid.
    if (sameSpecies(reactantBase, productCBase)) continue
    // Reject if reactants are identical (would just be one species written twice).
    if (sameSpecies(reactantAcid, reactantBase)) continue
    // Reject mid-step disproportionation where a reactant reappears as a product.
    if (sameSpecies(reactantAcid, productCBase)) continue
    if (sameSpecies(reactantBase, productCAcid)) continue
    // Reject convergent reactions where both products are the same species
    // (renders as "X + 2 X" which is confusing — chemically valid but bad UX).
    if (sameSpecies(productCAcid, productCBase)) continue

    return {
      reactants: shuffle2([reactantAcid, reactantBase]),
      products:  shuffle2([productCAcid, productCBase]),
    }
  }
  // Fallback — vanilla water + ammonia.
  return {
    reactants: [
      { formula: 'H_2O', charge: 0, role: 'acid', coef: 1 },
      { formula: 'NH_3', charge: 0, role: 'base', coef: 1 },
    ],
    products: [
      { formula: 'NH_4', charge: 1,  role: 'conjugateAcid', coef: 1 },
      { formula: 'OH',   charge: -1, role: 'conjugateBase', coef: 1 },
    ],
  }
}

// Render a formula like "H_2SO_4" with subscripts, plus a charge superscript.
// Returns an array of {text, kind} segments for React rendering.
export function formulaSegments(formula, charge) {
  const segments = []
  const parts = formula.split('_')
  segments.push({ text: parts[0], kind: 'main' })
  for (let i = 1; i < parts.length; i++) {
    // first character(s) that are digits = subscript, rest = main
    const m = parts[i].match(/^(\d+)(.*)$/)
    if (m) {
      segments.push({ text: m[1], kind: 'sub' })
      if (m[2]) segments.push({ text: m[2], kind: 'main' })
    } else {
      segments.push({ text: parts[i], kind: 'main' })
    }
  }
  if (charge && charge !== 0) {
    let sign
    if (charge === 1) sign = '+'
    else if (charge === -1) sign = '−'
    else if (charge > 0) sign = `${charge}+`
    else sign = `${Math.abs(charge)}−`
    segments.push({ text: sign, kind: 'sup' })
  }
  return segments
}
