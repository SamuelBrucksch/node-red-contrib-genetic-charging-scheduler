const geneticAlgorithmConstructor = require('geneticalgorithm')
const { fitnessFunction, allPeriodsGenerator } = require('./fitness')

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

const cleanupGene = (g, batteryEnergyCost, batteryCost, importPrice) => {
  if (batteryEnergyCost && batteryCost) {
    if (g.activity === -1 && batteryEnergyCost + batteryCost > importPrice) {
      mutate(g)
    }
  }
}

const mutationFunction = (props) => (phenotype) => {
  const {
    mutationRate,
    input,
    avgImportPrice,
    minPrice,
    batteryEnergyCost,
    batteryCost
  } = props
  for (let i = 0; i < phenotype.periods.length; i += 1) {
    const g = phenotype.periods[i]
    const { importPrice } = input[i]
    if (importPrice <= minPrice) {
      g.activity = 1
    } else if (importPrice > avgImportPrice && g.activity === 1) {
      // force mutation for schedules that try to charge above avg import price
      mutate(g)
    } else if (Math.random() < mutationRate) {
      // Mutate action
      mutate(g)
      cleanupGene(g, batteryEnergyCost, batteryCost, importPrice)
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

const generatePopulation = (props) => {
  const {
    populationSize,
    numberOfPricePeriods,
    excessPvEnergyUse,
    input,
    minPrice,
    batteryEnergyCost,
    batteryCost,
    avgImportPrice
  } = props
  const population = []

  for (let i = 0; i < populationSize; i++) {
    const timePeriods = []
    for (let j = 0; j < numberOfPricePeriods; j++) {
      const gene = { activity: 0, start: 0, duration: 0 }

      const { importPrice } = input[j]
      if (importPrice <= minPrice) {
        gene.activity = 1
      } else if (importPrice > avgImportPrice) {
        gene.activity = Math.random() <= 0.5 ? -1 : 0
      } else {
        const random = Math.random()
        gene.activity = random <= 1 / 3 ? -1 : random <= 2 / 3 ? 0 : 1
        cleanupGene(gene, batteryEnergyCost, batteryCost, importPrice)
      }

      if (j === 0) {
        const now = new Date()
        gene.start = now.getMinutes()
        gene.duration = 60 - gene.start
      } else {
        gene.start = j * 60
        gene.duration = 60
      }

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

const batteryEnergyCostFromHistory = (config) => {
  const { priceHistory, chargingHistory, batteryMaxEnergy } = config

  if (!priceHistory?.length) return

  let charged = 0
  let cost = 0
  for (let i = priceHistory.length - 1; i > 0; i--) {
    if (charged >= batteryMaxEnergy) {
      // only consider the last full cycle for price calculation
      break
    }
    const v = priceHistory[i]
    const importPrice = v.importPrice ?? v.value
    const exportPrice = v.exportPrice ?? 0
    const element = chargingHistory.find(
      (c) => new Date(c.start).getTime() === new Date(v.start).getTime()
    )

    if (!element) continue

    charged += element.fromGrid + element.fromProduction
    cost +=
      element.fromGrid * importPrice + element.fromProduction * exportPrice
  }

  return cost / charged
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
        exportPrice: v.exportPrice ?? 0,
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

  const batteryEnergyCost = batteryEnergyCostFromHistory(config)

  // day ahead prices get announced at 13:00, then we get them until 23:00 next day, so 35h is max
  const numberOfPricePeriods = Math.min(35, input.length)

  const props = {
    ...config,
    input,
    totalDuration: numberOfPricePeriods * 60,
    numberOfPricePeriods,
    avgImportPrice:
      input.reduce((val, i) => val + i.importPrice, 0) / input.length,
    batteryEnergyCost
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
