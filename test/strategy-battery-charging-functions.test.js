const { expect, describe, beforeAll } = require('@jest/globals')
const { mockRandomForEach } = require('jest-mock-random')
const {
  clamp,
  calculateBatteryChargingStrategy,
  crossoverFunction
} = require('../src/strategy-battery-charging-functions')

describe('Util functions', () => {
  test('clamp', () => {
    expect(clamp(1, 0, 10)).toBe(1)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('Crossover', () => {
  mockRandomForEach(0.4)

  test('should perform a crossover', () => {
    const p = crossoverFunction(
      {
        periods: [
          { start: 0, activity: 1, duration: 10 },
          { start: 30, activity: -1, duration: 10 }
        ],
        excessPvEnergyUse: 0
      },
      {
        periods: [
          { start: 60, activity: 1, duration: 10 },
          { start: 80, activity: -1, duration: 10 }
        ],
        excessPvEnergyUse: 0
      }
    )[0]
    expect(p).toMatchObject({
      periods: [
        { start: 0, activity: 1, duration: 10 },
        { start: 80, activity: -1, duration: 10 }
      ],
      excessPvEnergyUse: 0
    })
  })
})

describe('Calculate', () => {
  beforeAll(() => {
    const now = new Date()
    now.setHours(now.getHours(), 0, 0, 0)
    jest
      .useFakeTimers()
      .setSystemTime(now)
  })
  test('calculate', () => {
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    const priceData = [
      { importPrice: 1, exportPrice: 0, start: new Date(now).toString() },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000).toString()
      },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000 * 2).toString()
      }
    ]
    const productionForecast = priceData.map((v) => {
      return { start: v.start, value: 0 }
    })
    const consumptionForecast = priceData.map((v) => {
      return { start: v.start, value: 1.5 }
    })
    const populationSize = 100
    const numberOfPricePeriods = priceData.length
    const generations = 500
    const mutationRate = 0.03

    const batteryMaxEnergy = 3 // kWh
    const batteryMaxOutputPower = 3 // kW
    const batteryMaxInputPower = 3 // kW
    const averageConsumption = 1.5 // kW
    const averageProduction = 0 // kW
    const soc = 0
    const excessPvEnergyUse = 0
    const efficiency = 1
    const batteryCost = 0

    const config = {
      priceData,
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxOutputPower,
      batteryMaxInputPower,
      averageConsumption,
      averageProduction,
      productionForecast,
      consumptionForecast,
      soc,
      excessPvEnergyUse,
      efficiency,
      batteryCost
    }
    const strategy = calculateBatteryChargingStrategy(config)
    const bestSchedule = strategy.best.schedule
    console.log(bestSchedule)

    expect(bestSchedule.length).toEqual(3)
    expect(bestSchedule[0]).toMatchObject({
      activity: 1,
      duration: 60
    })
    expect(bestSchedule[1]).toMatchObject({
      activity: -1,
      name: 'discharging',
      duration: 60
    })
    expect(bestSchedule[2]).toMatchObject({
      activity: -1,
      name: 'discharging',
      duration: 60
    })

    expect(strategy.best.excessPvEnergyUse).toEqual(excessPvEnergyUse)
    expect(strategy.best.cost).not.toBeNull()
    expect(strategy.best.cost).not.toBeNaN()

    console.log(`best: ${strategy.best.cost}`)
    console.log(`no battery: ${strategy.noBattery.cost}`)

    const values = bestSchedule
      .filter((e) => e.activity !== 0)
      .reduce((total, e) => {
        const toTimeString = (date) => {
          const HH = date.getHours().toString().padStart(2, '0')
          const mm = date.getMinutes().toString().padStart(2, '0')
          return `${HH}:${mm}`
        }

        const touPattern = (start, end, charge) => {
          let pattern = toTimeString(start)
          pattern += '-'
          pattern += toTimeString(end)
          pattern += '/'
          pattern += start.getDay()
          pattern += '/'
          pattern += charge
          return pattern
        }

        const startDate = new Date(e.start)
        const endDate = new Date(startDate.getTime() + (e.duration - 1) * 60000)
        const charge = e.activity === 1 ? '+' : '-'
        if (startDate.getDay() === endDate.getDay()) {
          total.push(touPattern(startDate, endDate, charge))
        } else {
          const endDateDay1 = new Date(startDate)
          endDateDay1.setHours(23)
          endDateDay1.setMinutes(59)
          total.push(touPattern(startDate, endDateDay1, charge))

          const startDateDay2 = new Date(endDate)
          startDateDay2.setHours(0)
          startDateDay2.setMinutes(0)
          total.push(touPattern(startDateDay2, endDate, charge))
        }
        return total
      }, [])
  })
})
