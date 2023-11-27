const end = (g) => g.start + g.duration

const calculateNormalPeriod = (g1, g2) => {
  return {
    start: end(g1),
    duration: g2.start - end(g1),
    activity: 0
  }
}

function * allPeriodsGenerator (props, phenotype) {
  const { batteryMaxEnergy, soc, totalDuration, minSoc = 0 } = props
  const { excessPvEnergyUse, periods } = phenotype

  let currentCharge = soc * batteryMaxEnergy
  const minCharge = minSoc * batteryMaxEnergy

  const addCosts = (period) => {
    const score = calculatePeriodScore(
      props,
      period,
      excessPvEnergyUse,
      currentCharge,
      minCharge
    )
    period.socStart = currentCharge / batteryMaxEnergy
    currentCharge += score[1]
    period.cost = score[0]
    period.charge = score[1]
    period.socEnd = currentCharge / batteryMaxEnergy
    return period
  }

  for (let i = 0; i < periods.length; i += 1) {
    const normalPeriod = calculateNormalPeriod(
      periods[i - 1] ?? { start: 0, duration: 0 },
      periods[i]
    )
    if (normalPeriod.duration > 0) yield addCosts(normalPeriod)
    yield addCosts(periods[i])
  }

  const normalPeriod = calculateNormalPeriod(
    periods.at(-1) ?? { start: 0, duration: 0 },
    {
      start: totalDuration
    }
  )
  if (normalPeriod.duration > 0) yield addCosts(normalPeriod)
}

const allPeriods = (props, phenotype) => {
  return [...allPeriodsGenerator(props, phenotype)]
}

// const FEED_TO_GRID = 0
const CHARGE = 1

const calculateDischargeScore = (props) => {
  const {
    exportPrice,
    importPrice,
    consumption,
    production,
    maxDischarge,
    maxCharge,
    excessPvEnergyUse,
    efficiency
  } = props

  // we assume half of the loss is on charge, and the other on discharge
  const dischargeEfficiency = (1 - efficiency) / 2
  const efficiencyMultiplyFactor = efficiency + dischargeEfficiency

  const consumedFromProduction = Math.min(consumption, production)

  const batteryChargeFromProduction =
    excessPvEnergyUse === CHARGE
      ? Math.min(production - consumedFromProduction, maxCharge)
      : 0

  const batteryChargeFromProductionAfterLoss =
    batteryChargeFromProduction * efficiencyMultiplyFactor

  const consumedFromBattery = Math.min(
    consumption - consumedFromProduction,
    maxDischarge
  )
  const consumedFromBatteryWithLoss =
    consumedFromBattery + consumedFromBattery * dischargeEfficiency
  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid =
    consumption - consumedFromProduction - consumedFromBattery

  const cost = consumedFromGrid * importPrice - soldFromProduction * exportPrice

  const discharge =
    batteryChargeFromProductionAfterLoss - consumedFromBatteryWithLoss

  return [cost, discharge]
}

const calculateNormalScore = (props) => {
  const {
    exportPrice,
    importPrice,
    maxCharge,
    consumption,
    production,
    excessPvEnergyUse,
    efficiency
  } = props

  // we assume half of the loss is on charge, and the other on discharge
  const chargeEfficiency = (1 - efficiency) / 2

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction =
    excessPvEnergyUse === CHARGE
      ? Math.min(production - consumedFromProduction, maxCharge)
      : 0
  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid = consumption - consumedFromProduction

  const cost = importPrice * consumedFromGrid - exportPrice * soldFromProduction
  const charge = batteryChargeFromProduction
  const loss = chargeEfficiency * charge
  return [cost, charge - loss]
}

const calculateChargeScore = (props) => {
  const {
    exportPrice,
    importPrice,
    consumption,
    production,
    maxCharge,
    efficiency
  } = props

  // we assume half of the loss is on charge, and the other on discharge
  const chargeEfficiency = (1 - efficiency) / 2

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction = Math.min(
    production - consumedFromProduction,
    maxCharge
  )

  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid = consumption - consumedFromProduction
  const chargedFromGrid = maxCharge - batteryChargeFromProduction

  const cost =
    (consumedFromGrid + chargedFromGrid) * importPrice -
    soldFromProduction * exportPrice
  const charge = batteryChargeFromProduction + chargedFromGrid

  const loss = charge * chargeEfficiency

  return [cost, charge - loss]
}

const calculateIntervalScore = (props) => {
  switch (props.activity) {
    case -1:
      return calculateDischargeScore(props)
    case 1:
      return calculateChargeScore(props)
    default:
      return calculateNormalScore(props)
  }
}

const calculatePeriodScore = (
  props,
  period,
  excessPvEnergyUse,
  _currentCharge,
  minCharge
) => {
  const {
    input,
    batteryMaxEnergy,
    batteryMaxInputPower,
    batteryMaxOutputPower,
    batteryCost,
    efficiency
  } = props
  let currentCharge = _currentCharge
  const duration = period.duration / 60
  const maxCharge = Math.min(
    batteryMaxInputPower * duration,
    batteryMaxEnergy - currentCharge
  )
  const maxDischarge = Math.min(
    batteryMaxOutputPower * duration,
    currentCharge - minCharge
  )
  const { importPrice, exportPrice, consumption, production } =
    input[Math.floor(period.start / 60)]

  const v = calculateIntervalScore({
    activity: period.activity,
    importPrice,
    exportPrice,
    consumption: consumption * duration,
    production: production * duration,
    maxCharge,
    maxDischarge,
    excessPvEnergyUse,
    batteryCost,
    efficiency
  })
  const cost = v[0]
  currentCharge += v[1]

  if (period.activity === 0 && cost === 0) {
    // prefer discharge over idle mode, if idle is not really needed
    const vAlternative = calculateIntervalScore({
      activity: -1,
      importPrice,
      exportPrice,
      consumption: consumption * duration,
      production: production * duration,
      maxCharge,
      maxDischarge,
      excessPvEnergyUse,
      batteryCost,
      efficiency
    })

    if (v[0] === vAlternative[0] && v[1] === vAlternative[1]) {
      period.activity = -1
    }
  }

  return [cost, currentCharge - _currentCharge]
}

const fitnessFunction = (props) => (phenotype) => {
  let cost = 0

  for (const period of allPeriodsGenerator(props, phenotype)) {
    cost -= period.cost
  }

  return cost
}

const calculateBatteryCost = (p, batteryCost) => {
  return p.periods.reduce((batCost, period) => {
    if (period.activity === -1 && period.charge < 0) {
      return batCost + Math.abs(period.charge) * batteryCost
    }
    return batCost
  }, 0)
}

const doesABeatBFunction = (props) => (p1, p2) => {
  const { batteryCost } = props
  const fitness1 = fitnessFunction(props)(p1)
  const fitness2 = fitnessFunction(props)(p2)

  // enhance costs with batterycost
  const batteryCost1 = calculateBatteryCost(p1, batteryCost)
  const batteryCost2 = calculateBatteryCost(p2, batteryCost)

  return fitness1 - batteryCost1 >= fitness2 - batteryCost2
}

module.exports = {
  fitnessFunction,
  allPeriodsGenerator,
  allPeriods,
  calculatePeriodScore,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
  doesABeatBFunction
}
