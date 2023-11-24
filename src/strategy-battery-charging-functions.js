const geneticAlgorithmConstructor = require('geneticalgorithm')
const { fitnessFunction, allPeriodsGenerator } = require('./fitness')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const repair = (phenotype, totalDuration) => {
  const trimGene = (gene) => {
    gene.start = clamp(gene.start, 0, totalDuration - 1)
    gene.duration = clamp(gene.duration, 0, totalDuration - gene.start)
  }

  const p = phenotype.sort((a, b) => a.start - b.start)

  trimGene(p[0])
  for (let i = 1; i < p.length; i += 1) {
    const g1 = p[i - 1]
    const g2 = p[i]
    trimGene(g1)
    trimGene(g2)
    const diff = Math.floor(g2.start - (g1.start + g1.duration))
    if (diff <= 0) {
      const adjustment = (diff / 2) * -1
      g1.duration -= clamp(Math.ceil(adjustment), 0, g1.duration)
      g2.start += Math.floor(adjustment)
      g2.duration -= clamp(Math.floor(adjustment), 0, g2.duration)
    }
  }
  return p
}

const mutationFunction = (props) => (phenotype) => {
  const { totalDuration, mutationRate } = props
  for (let i = 0; i < phenotype.periods.length; i += 1) {
    const g = phenotype.periods[i]
    if (Math.random() < mutationRate) {
      // Mutate action
      g.activity *= -1
    }
  }
  return {
    periods: repair(phenotype.periods, totalDuration),
    excessPvEnergyUse: phenotype.excessPvEnergyUse
  }
}

const crossoverFunction = (props) => (phenotypeA, phenotypeB) => {
  const { totalDuration } = props
  const midpoint = random(0, phenotypeA.periods.length)
  const childGenes = []
  for (let i = 0; i < phenotypeA.periods.length; i += 1) {
    if (i <= midpoint) {
      childGenes[i] = phenotypeA.periods[i]
    } else {
      childGenes[i] = phenotypeB.periods[i]
    }
  }

  return [
    {
      periods: repair(childGenes, totalDuration),
      excessPvEnergyUse:
        Math.random() < 0.5
          ? phenotypeA.excessPvEnergyUse
          : phenotypeB.excessPvEnergyUse
    }
  ]
}

const generatePopulation = (props) => {
  const {
    populationSize,
    numberOfPricePeriods,
    excessPvEnergyUse
  } = props
  const population = []
  for (let i = 0; i < populationSize; i++) {
    const timePeriods = []
    for (let j = 0; j < numberOfPricePeriods; j++) {
      const gene = { activity: 0, start: 0, duration: 0 }
      gene.activity = Math.random() < 0.5 ? -1 : 1
      gene.start = j * 60
      gene.duration = 60
      timePeriods.push(gene)
    }

    population.push({
      periods: timePeriods,
      excessPvEnergyUse
    })
  }
  return population
}

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000)
}

const activityToName = (activity) => {
  switch (activity) {
    case -1:
      return 'discharging'
    case 1:
      return 'charging'
    default:
      return 'idle'
  }
}

const toSchedule = (props, phenotype) => {
  const { input } = props

  const schedule = []
  // props, totalDuration, excessPvEnergyUse, p
  const periodStart = new Date(input[0].start)
  for (const period of allPeriodsGenerator(props, phenotype)) {
    schedule.push({
      start: addMinutes(periodStart, period.start),
      activity: period.activity,
      name: activityToName(period.activity),
      duration: period.duration,
      cost: period.cost,
      charge: period.charge,
      socStart: period.socStart * 100,
      socEnd: period.socEnd * 100
    })
  }

  return schedule
}

const mergeInput = (config) => {
  const {
    averageConsumption,
    averageProduction,
    priceData,
    consumptionForecast,
    productionForecast
  } = config

  let now = Date.now()
  now = new Date(now - (now % (60 * 60 * 1000)))
  return priceData
    .filter((v) => new Date(v.start).getTime() >= now.getTime())
    .map((v) => {
      return {
        start: new Date(v.start),
        importPrice: v.importPrice ?? v.value,
        exportPrice: v.exportPrice ?? v.importPrice ?? v.value,
        consumption:
          consumptionForecast.find(
            (c) => new Date(c.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageConsumption ??
          0,
        production:
          productionForecast.find(
            (p) => new Date(p.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageProduction ??
          0
      }
    })
}

const calculateBatteryChargingStrategy = (config) => {
  const { generations } = config

  const input = mergeInput(config)
  if (input === undefined || input.length === 0) return {}

  const props = {
    ...config,
    input,
    totalDuration: input.length * 60,
    numberOfPricePeriods: input.length
  }

  const options = {
    mutationFunction: mutationFunction(props),
    crossoverFunction: crossoverFunction(props),
    fitnessFunction: fitnessFunction(props),
    population: generatePopulation(props)
  }

  const geneticAlgorithm = geneticAlgorithmConstructor(options)

  for (let i = 0; i < generations; i += 1) {
    geneticAlgorithm.evolve()
  }

  const best = geneticAlgorithm.best()
  const noBattery = { periods: [], excessPvEnergyUse: 0 }
  return {
    best: {
      schedule: toSchedule(props, best),
      excessPvEnergyUse: best.excessPvEnergyUse,
      cost: options.fitnessFunction(best) * -1
    },
    noBattery: {
      schedule: toSchedule(props, noBattery),
      excessPvEnergyUse: noBattery.excessPvEnergyUse,
      cost: options.fitnessFunction(noBattery) * -1
    }
  }
}

module.exports = {
  clamp,
  repair,
  crossoverFunction,
  mutationFunction,
  fitnessFunction,
  calculateBatteryChargingStrategy
}
