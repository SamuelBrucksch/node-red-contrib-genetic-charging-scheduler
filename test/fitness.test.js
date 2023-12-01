const { expect, describe } = require('@jest/globals')
const {
  fitnessFunction,
  allPeriods,
  calculatePeriodScore,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore
} = require('../src/fitness')

let props
let dischargeProps

beforeEach(() => {
  let now = Date.now()
  now = now - (now % (60 * 60 * 1000))
  const input = [
    {
      start: new Date(now).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0
    },
    {
      start: new Date(now + 60 * 60 * 1000).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 2).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 3).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 4).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0
    }
  ]
  props = {
    input,
    totalDuration: input.length * 60,
    batteryMaxEnergy: 1,
    batteryMaxInputPower: 1,
    batteryMaxOutputPower: 2,
    soc: 1,
    batteryCost: 0,
    efficiency: 1
  }
  dischargeProps = {
    ...props,
    input: props.input.map((i) => ({
      ...i,
      consumption: i.consumption * props.batteryMaxOutputPower
    }))
  }
})

describe('Fitness - allPeriods', () => {
  test('should test allPeriods empty', () => {
    expect(
      allPeriods(props, { excessPvEnergyUse: 0, periods: [] })
    ).toMatchObject([])
  })

  test('should test allPeriods one activity', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: [{ start: 0, duration: 300, activity: 1 }]
      })
    ).toMatchObject([{ start: 0, duration: 300, activity: 1 }])
  })
})

describe('Fitness - calculateScore', () => {
  describe('Fitness - calculateDischargeScore', () => {
    test('should discharge full hour, full battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 1,
          efficiency: 1,
          batteryCost: 0
        })
      ).toEqual([0, -1])
    })

    test('should discharge full hour, empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0,
          efficiency: 1,
          batteryCost: 0
        })
      ).toEqual([2, 0])
    })

    test('should discharge full hour, almost empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0.5,
          efficiency: 1,
          batteryCost: 0
        })
      ).toEqual([1, -0.5])
    })

    test('should discharge full hour, full battery, equal production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxDischarge: 1,
          efficiency: 1,
          batteryCost: 0
        })
      ).toEqual([0, 0])
    })

    test('should discharge full hour, full battery, double production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
          efficiency: 1,
          batteryCost: 1
        })
      ).toEqual([-2, 0])
    })

    test('should discharge full hour, full battery, double production, charge preference', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
          maxCharge: 1,
          excessPvEnergyUse: 1,
          efficiency: 1,
          batteryCost: 1
        })
      ).toEqual([0, 1])
    })

    test('battery cost affects discharge price', () => {
      const props = {
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxDischarge: 0.5,
        batteryCost: 1,
        efficiency: 1
      }
      expect(
        calculateDischargeScore(props)
      ).toEqual([1.5, -0.5])
    })

    test('efficiency affects discharged energy, grid only', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxDischarge: 1,
        batteryCost: 0,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateDischargeScore(props)
      ).toEqual([0, -1.0526315789473684])
    })

    test('efficiency affects discharged energy, grid + PV consumption', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 3,
        production: 2,
        maxDischarge: 1,
        maxCharge: 1,
        batteryCost: 0,
        excessPvEnergyUse: 1,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateDischargeScore(props)
      ).toEqual([0, -1.0526315789473684])
    })

    test('efficiency affects discharged energy, charge from PV', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 3,
        production: 6,
        maxDischarge: 1,
        maxCharge: 2,
        batteryCost: 0,
        excessPvEnergyUse: 1,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateDischargeScore(props)
      ).toEqual([-2, 1.9])
    })

    test('efficiency affects discharged energy, charge from grid', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 3,
        production: 0,
        maxDischarge: 1,
        maxCharge: 2,
        batteryCost: 0,
        excessPvEnergyUse: 1,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateDischargeScore(props)
      ).toEqual([4, -1.0526315789473684])
    })
  })

  describe('Fitness - calculateChargeScore', () => {
    test('should charge full hour, full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([2, 0])
    })

    test('should charge full hour, empty battery', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([4, 1])
    })

    test('should charge full hour, almost full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0.5,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([3, 0.5])
    })

    test('should charge full hour, empty battery, equal production', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([2, 1])
    })

    test('should charge full hour, empty battery, double production', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([0, 1])
    })

    test('should charge full hour, empty battery, triple production, charge preference', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 3,
          maxCharge: 1,
          excessPvEnergyUse: 1,
          batteryCost: 0,
          efficiency: 1
        })
      ).toEqual([-2, 1])
    })

    test('efficiency affects charged energy from PV', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 2,
        maxCharge: 1,
        batteryCost: 0,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateChargeScore(props)
      ).toEqual([0, 0.95])
    })

    test('efficiency affects charged energy from grid', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxCharge: 1,
        batteryCost: 0,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateChargeScore(props)
      ).toEqual([4, 0.95])
    })

    test('efficiency affects charged energy from mix of PV + grid', () => {
      const props = {
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 1,
        maxCharge: 1,
        batteryCost: 0,
        efficiency: 0.9 // 0.9 is overall efficiency, so we make it simple and use 0.05 for charging and 0.05 for discharging
      }
      expect(
        calculateChargeScore(props)
      ).toEqual([2, 0.95])
    })
  })

  describe('Fitness - calculateNormalScore', () => {
    test('should consume normal full hour no production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
          efficiency: 1
        })
      ).toEqual([2, 0])
    })

    test('should consume normal full hour with equal production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
          efficiency: 1
        })
      ).toEqual([0, 0])
    })

    test('should consume normal full hour with double production, charge preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 1,
          efficiency: 1
        })
      ).toEqual([0, 1])
    })

    test('should consume normal full hour with double production, feed to grid preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 0,
          efficiency: 1
        })
      ).toEqual([-2, 0])
    })

    test('should consume normal with efficiency loss', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 1,
          efficiency: 0.9
        })
      ).toEqual([0, 0.95])
    })
  })

  describe('Fitness - calculatePeriodScore', () => {
    test('should not charge faster than max input power', () => {
      const period = { start: 0, duration: 1, activity: 1 }
      const currentCharge = 0
      const excessPvEnergyUse = 0
      const score = calculatePeriodScore(
        props,
        period,
        excessPvEnergyUse,
        currentCharge
      )
      const chargeSpeed = score[1] / (1 / 60)
      expect(chargeSpeed).toBeCloseTo(props.batteryMaxInputPower)
      expect(score[0]).toBeCloseTo(2 / 60)
      expect(score[1]).toBeCloseTo(1 / 60)
    })

    test('should not discharge faster than max output power', () => {
      const period = { start: 0, duration: 1, activity: -1 }
      const currentCharge = 100
      const excessPvEnergyUse = 0
      const score = calculatePeriodScore(
        dischargeProps,
        period,
        excessPvEnergyUse,
        currentCharge,
        0
      )
      const dischargeSpeed = (score[1] / (period.duration / 60)) * -1
      expect(dischargeSpeed).toBeCloseTo(props.batteryMaxOutputPower)
      expect(score[0]).toBeCloseTo(0)
      expect(score[1]).toBeCloseTo(
        (period.duration / 60) * -props.batteryMaxOutputPower
      )
    })
  })
})

describe('Fitness', () => {
  test('should calculate fitness', () => {
    props.totalDuration = 180
    props.soc = 0
    const score = fitnessFunction(props)({
      periods: [
        { start: 0, duration: 60, activity: 1 },
        { start: 60, duration: 120, activity: -1 }
      ],
      excessPvEnergyUse: 0
    })
    expect(score).toEqual(-3)
  })

  test('should calculate fitness with soc', () => {
    props.totalDuration = 120
    props.soc = 1
    const score = fitnessFunction(props)({
      periods: [
        { start: 0, duration: 60, activity: 1 },
        { start: 60, duration: 60, activity: -1 }
      ],
      excessPvEnergyUse: 0
    })
    expect(score).toEqual(-1)
  })

  test('should calculate 180 min charge period with full battery', () => {
    props.totalDuration = 180
    props.soc = 1
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    props.input = [
      {
        start: new Date(now).toString(),
        importPrice: 1,
        exportPrice: 1,
        consumption: 1.5,
        production: 0
      },
      {
        start: new Date(now + 60 * 60 * 1000).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0
      },
      {
        start: new Date(now + 60 * 60 * 1000 * 2).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0
      }
    ]
    const score = fitnessFunction(props)({
      periods: [{ start: 0, duration: 60, activity: 1 }, { start: 60, duration: 60, activity: 1 }, { start: 120, duration: 60, activity: 1 }],
      excessPvEnergyUse: 0
    })
    expect(score).toEqual(-1501.5)
  })
})
