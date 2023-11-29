const geneticAlgorithmConstructor = require('geneticalgorithm')
const {
  fitnessFunction,
  allPeriodsGenerator
} = require('./fitness')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const mutate = (g) => {
  const oldValue = g.activity

  const random = Math.random() <= 0.5
  if (oldValue === -1) {
    g.activity = random ? 0 : 1
  } else if (oldValue === 0) {
    g.activity = random ? -1 : 1
  } else {
    g.activity = random ? 0 : -1
  }
}

const mutationFunction = (props) => (phenotype) => {
  const { mutationRate, input, avgImportPrice } = props
  for (let i = 0; i < phenotype.periods.length; i += 1) {
    const g = phenotype.periods[i]
    const { importPrice } = input[i]
    if (importPrice >= avgImportPrice && g.activity === 1) {
      // force mutation for schedules that try to charge above avg import price
      mutate(g)
    } else if (Math.random() < mutationRate) {
      // Mutate action
      mutate(g)
    }
  }
  return {
    periods: phenotype.periods,
    excessPvEnergyUse: phenotype.excessPvEnergyUse
  }
}

const crossoverFunction = (phenotypeA, phenotypeB) => {
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
      periods: childGenes,
      excessPvEnergyUse:
        Math.random() < 0.5
          ? phenotypeA.excessPvEnergyUse
          : phenotypeB.excessPvEnergyUse
    }
  ]
}

const generateStandardPopulation = (activity, numberOfPricePeriods, excessPvEnergyUse) => {
  const timePeriods = []
  for (let j = 0; j < numberOfPricePeriods; j++) {
    const gene = { activity: 0, start: 0, duration: 0 }
    gene.activity = activity
    gene.start = j * 60
    gene.duration = 60
    timePeriods.push(gene)
  }

  return {
    periods: timePeriods,
    excessPvEnergyUse
  }
}

const generatePopulation = (props) => {
  const { populationSize, numberOfPricePeriods, excessPvEnergyUse } = props
  const population = []

  // push some standard populations with charge only, discharge only and idle only
  population.push(generateStandardPopulation(-1, numberOfPricePeriods, excessPvEnergyUse))
  population.push(generateStandardPopulation(0, numberOfPricePeriods, excessPvEnergyUse))
  population.push(generateStandardPopulation(1, numberOfPricePeriods, excessPvEnergyUse))

  for (let i = 0; i < populationSize; i++) {
    const timePeriods = []
    for (let j = 0; j < numberOfPricePeriods; j++) {
      const gene = { activity: 0, start: 0, duration: 0 }
      const random = Math.random()
      gene.activity = random <= 1 / 3 ? -1 : random <= 2 / 3 ? 0 : 1
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

  // day ahead prices get announced at 13:00, then we get them until 23:00 next day, so 35h is max
  const numberOfPricePeriods = Math.min(35, input.length)

  const props = {
    ...config,
    input,
    totalDuration: numberOfPricePeriods * 60,
    numberOfPricePeriods,
    avgImportPrice: input.reduce((val, i) => val + i.importPrice, 0) / input.length
  }

  const options = {
    mutationFunction: mutationFunction(props),
    crossoverFunction,
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
  crossoverFunction,
  mutationFunction,
  fitnessFunction,
  calculateBatteryChargingStrategy
}
