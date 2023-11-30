const { mockRandom } = require('jest-mock-random')
const {
  mutationFunction
} = require('../src/strategy-battery-charging-functions')

describe('Mutation', () => {
  // mockRandomForEach(0.4)

  test('should mutate to idle', () => {
    mockRandom(1 / 3)
    const mutate = mutationFunction({ totalDuration: 120, mutationRate: 1, input: [{ importPrice: 0 }] })

    const p = mutate({
      periods: [{ start: 0, activity: 1, duration: 10 }],
      excessPvEnergyUse: 0
    })

    expect(p).toMatchObject({
      periods: [{ start: 0, activity: 0, duration: 10 }]
    })
  })

  test('should mutate to discharging', () => {
    mockRandom(2 / 3)
    const mutate = mutationFunction({ totalDuration: 120, mutationRate: 1, input: [{ importPrice: 0 }] })

    const p = mutate({
      periods: [{ start: 0, activity: 1, duration: 10 }],
      excessPvEnergyUse: 0
    })

    expect(p).toMatchObject({
      periods: [{ start: 0, activity: -1, duration: 10 }]
    })
  })

  test('should mutate to charging', () => {
    mockRandom(0.9)
    const mutate = mutationFunction({ totalDuration: 120, mutationRate: 1, input: [{ importPrice: 0 }] })

    const p = mutate({
      periods: [{ start: 0, activity: -1, duration: 10 }],
      excessPvEnergyUse: 0
    })

    expect(p).toMatchObject({
      periods: [{ start: 0, activity: 1, duration: 10 }]
    })
  })
})
