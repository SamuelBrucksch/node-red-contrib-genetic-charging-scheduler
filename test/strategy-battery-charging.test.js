const node = require('../src/strategy-battery-charging')
const helper = require('node-red-node-test-helper')

describe('Battery charging strategy Node', () => {
  afterEach(() => {
    helper.unload()
  })

  it('should be loaded', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name'
      }
    ]

    helper.load(node, flow, function callback () {
      const n1 = helper.getNode('n1')
      expect(n1.name).toBe('test name')
      done()
    })
  })

  it('should send schedule in payload', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 10,
        numberOfPricePeriods: 3,
        generations: 10,
        mutationRate: 3,
        batteryMaxEnergy: 5,
        batteryMaxInputPower: 2.5,
        averageConsumption: 1.5,
        wires: [['n2']]
      },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(node, flow, function callback () {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback (msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')
        done()
      })

      let now = Date.now()
      now = now - (now % (60 * 60 * 1000))
      const inputPayload = {
        payload: {
          priceData: [
            {
              value: 1,
              start: new Date(now + 60 * 60 * 1000 * 0).toString()
            },
            {
              value: 2,
              start: new Date(now + 60 * 60 * 1000 * 1).toString()
            },
            {
              value: 5,
              start: new Date(now + 60 * 60 * 1000 * 2).toString()
            }
          ]
        }
      }

      n1.receive(inputPayload)
    })
  })

  it('should calculate schedule with old input', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 10,
        numberOfPricePeriods: 3,
        generations: 10,
        mutationRate: 3,
        batteryMaxEnergy: 5,
        batteryMaxInputPower: 2.5,
        averageConsumption: 1.5,
        wires: [['n2']]
      },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(node, flow, function callback () {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback (msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')

        expect(msg.payload.excessPvEnergyUse).toEqual('GRID_FEED_IN')

        console.log(JSON.stringify(msg.payload, null, 1))
        done()
      })

      let now = Date.now()
      now = now - (now % (24 * 60 * 60 * 1000))
      const inputPayload = {
        soc: 75,
        priceData: [
          {
            value: 2.1419,
            start: new Date(now + 60 * 60 * 1000 * 0).toString()
          },
          {
            value: 1.9709,
            start: new Date(now + 60 * 60 * 1000 * 1).toString()
          },
          {
            value: 1.8481,
            start: new Date(now + 60 * 60 * 1000 * 2).toString()
          },
          {
            value: 1.7586,
            start: new Date(now + 60 * 60 * 1000 * 3).toString()
          },
          {
            value: 2.0838,
            start: new Date(now + 60 * 60 * 1000 * 4).toString()
          },
          {
            value: 2.143,
            start: new Date(now + 60 * 60 * 1000 * 5).toString()
          },
          {
            value: 2.4856,
            start: new Date(now + 60 * 60 * 1000 * 6).toString()
          },
          {
            value: 2.8673,
            start: new Date(now + 60 * 60 * 1000 * 7).toString()
          },
          {
            value: 3.1644,
            start: new Date(now + 60 * 60 * 1000 * 8).toString()
          },
          {
            value: 2.847,
            start: new Date(now + 60 * 60 * 1000 * 9).toString()
          },
          {
            value: 2.513,
            start: new Date(now + 60 * 60 * 1000 * 10).toString()
          },
          {
            value: 2.0868,
            start: new Date(now + 60 * 60 * 1000 * 11).toString()
          },
          {
            value: 2.066,
            start: new Date(now + 60 * 60 * 1000 * 12).toString()
          },
          {
            value: 1.9902,
            start: new Date(now + 60 * 60 * 1000 * 13).toString()
          },
          {
            value: 2.1663,
            start: new Date(now + 60 * 60 * 1000 * 14).toString()
          },
          {
            value: 2.5038,
            start: new Date(now + 60 * 60 * 1000 * 15).toString()
          },
          {
            value: 2.7555,
            start: new Date(now + 60 * 60 * 1000 * 16).toString()
          },
          {
            value: 3.2038,
            start: new Date(now + 60 * 60 * 1000 * 17).toString()
          },
          {
            value: 3.5277,
            start: new Date(now + 60 * 60 * 1000 * 18).toString()
          },
          {
            value: 3.2972,
            start: new Date(now + 60 * 60 * 1000 * 19).toString()
          },
          {
            value: 2.8811,
            start: new Date(now + 60 * 60 * 1000 * 20).toString()
          },
          {
            value: 2.7304,
            start: new Date(now + 60 * 60 * 1000 * 21).toString()
          },
          {
            value: 2.357,
            start: new Date(now + 60 * 60 * 1000 * 22).toString()
          },
          {
            value: 1.7825,
            start: new Date(now + 60 * 60 * 1000 * 23).toString()
          }
        ]
      }

      n1.receive({ payload: inputPayload })
    })
  })

  it('should send handle empty priceData', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        wires: [['n2']]
      },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(node, flow, function callback () {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback (msg) {
        expect(msg).toHaveProperty('payload')
        done()
      })

      n1.receive({ payload: {} })
      n1.receive({})
    })
  })

  it('uses forecasted solar data, consumption data and price data', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 50,
        generations: 150,
        mutationRate: 3,
        batteryMaxEnergy: 14.52,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
        excessPvEnergyUse: '1',
        batteryCost: 0,
        efficiency: 90,
        minSoc: 15
      },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(node, flow, function callback () {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback (msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')
        expect(msg.payload.cost).not.toBe(NaN)
        for (const s of msg.payload.schedule) {
          expect(s.socStart).toBeGreaterThanOrEqual(0)
          expect(s.socStart).toBeLessThanOrEqual(100)
          expect(s.socEnd).toBeGreaterThanOrEqual(0)
          expect(s.socEnd).toBeLessThanOrEqual(100)
        }

        // is converted to int on input
        // expect(msg.payload.excessPvEnergyUse).toEqual('CHARGE_BATTERY')

        console.log(JSON.stringify(msg.payload, null, 1))
        done()
      })

      const inputPayload = { consumptionForecast: [{ start: '2023-11-29T23:00:00.000Z', value: 0.35 }, { start: '2023-11-30T00:00:00.000Z', value: 0.35 }, { start: '2023-11-30T01:00:00.000Z', value: 0.35 }, { start: '2023-11-30T02:00:00.000Z', value: 0.35 }, { start: '2023-11-30T03:00:00.000Z', value: 0.35 }, { start: '2023-11-30T04:00:00.000Z', value: 0.35 }, { start: '2023-11-30T05:00:00.000Z', value: 0.5 }, { start: '2023-11-30T06:00:00.000Z', value: 0.55 }, { start: '2023-11-30T07:00:00.000Z', value: 1 }, { start: '2023-11-30T08:00:00.000Z', value: 1 }, { start: '2023-11-30T09:00:00.000Z', value: 1 }, { start: '2023-11-30T10:00:00.000Z', value: 2 }, { start: '2023-11-30T11:00:00.000Z', value: 1.5 }, { start: '2023-11-30T12:00:00.000Z', value: 0.6 }, { start: '2023-11-30T13:00:00.000Z', value: 0.6 }, { start: '2023-11-30T14:00:00.000Z', value: 0.6 }, { start: '2023-11-30T15:00:00.000Z', value: 0.5 }, { start: '2023-11-30T16:00:00.000Z', value: 0.4 }, { start: '2023-11-30T17:00:00.000Z', value: 0.5 }, { start: '2023-11-30T18:00:00.000Z', value: 0.6 }, { start: '2023-11-30T19:00:00.000Z', value: 0.6 }, { start: '2023-11-30T20:00:00.000Z', value: 0.6 }, { start: '2023-11-30T21:00:00.000Z', value: 0.6 }, { start: '2023-11-30T22:00:00.000Z', value: 0.35 }, { start: '2023-11-30T23:00:00.000Z', value: 0.35 }, { start: '2023-12-01T00:00:00.000Z', value: 0.35 }, { start: '2023-12-01T01:00:00.000Z', value: 0.35 }, { start: '2023-12-01T02:00:00.000Z', value: 0.35 }, { start: '2023-12-01T03:00:00.000Z', value: 0.35 }, { start: '2023-12-01T04:00:00.000Z', value: 0.35 }, { start: '2023-12-01T05:00:00.000Z', value: 0.5 }, { start: '2023-12-01T06:00:00.000Z', value: 0.55 }, { start: '2023-12-01T07:00:00.000Z', value: 1 }, { start: '2023-12-01T08:00:00.000Z', value: 1 }, { start: '2023-12-01T09:00:00.000Z', value: 1 }, { start: '2023-12-01T10:00:00.000Z', value: 2 }, { start: '2023-12-01T11:00:00.000Z', value: 1.5 }, { start: '2023-12-01T12:00:00.000Z', value: 0.6 }, { start: '2023-12-01T13:00:00.000Z', value: 0.6 }, { start: '2023-12-01T14:00:00.000Z', value: 0.6 }, { start: '2023-12-01T15:00:00.000Z', value: 0.5 }, { start: '2023-12-01T16:00:00.000Z', value: 0.4 }, { start: '2023-12-01T17:00:00.000Z', value: 0.5 }, { start: '2023-12-01T18:00:00.000Z', value: 0.6 }, { start: '2023-12-01T19:00:00.000Z', value: 0.6 }, { start: '2023-12-01T20:00:00.000Z', value: 0.6 }, { start: '2023-12-01T21:00:00.000Z', value: 0.6 }, { start: '2023-12-01T22:00:00.000Z', value: 0.35 }, { start: '2023-12-01T23:00:00.000Z', value: 0.35 }, { start: '2023-12-02T00:00:00.000Z', value: 0.35 }, { start: '2023-12-02T01:00:00.000Z', value: 0.35 }, { start: '2023-12-02T02:00:00.000Z', value: 0.35 }, { start: '2023-12-02T03:00:00.000Z', value: 0.35 }, { start: '2023-12-02T04:00:00.000Z', value: 0.35 }, { start: '2023-12-02T05:00:00.000Z', value: 0.5 }, { start: '2023-12-02T06:00:00.000Z', value: 0.55 }, { start: '2023-12-02T07:00:00.000Z', value: 1 }, { start: '2023-12-02T08:00:00.000Z', value: 1 }, { start: '2023-12-02T09:00:00.000Z', value: 1 }, { start: '2023-12-02T10:00:00.000Z', value: 2 }, { start: '2023-12-02T11:00:00.000Z', value: 1.5 }, { start: '2023-12-02T12:00:00.000Z', value: 0.6 }, { start: '2023-12-02T13:00:00.000Z', value: 0.6 }, { start: '2023-12-02T14:00:00.000Z', value: 0.6 }, { start: '2023-12-02T15:00:00.000Z', value: 0.5 }, { start: '2023-12-02T16:00:00.000Z', value: 0.4 }, { start: '2023-12-02T17:00:00.000Z', value: 0.5 }, { start: '2023-12-02T18:00:00.000Z', value: 0.6 }, { start: '2023-12-02T19:00:00.000Z', value: 0.6 }, { start: '2023-12-02T20:00:00.000Z', value: 0.6 }, { start: '2023-12-02T21:00:00.000Z', value: 0.6 }, { start: '2023-12-02T22:00:00.000Z', value: 0.35 }], productionForecast: [{ value: 0, start: '2023-11-29T17:00:00.000Z' }, { value: 0, start: '2023-11-29T18:00:00.000Z' }, { value: 0, start: '2023-11-29T19:00:00.000Z' }, { value: 0, start: '2023-11-29T20:00:00.000Z' }, { value: 0, start: '2023-11-29T21:00:00.000Z' }, { value: 0, start: '2023-11-29T22:00:00.000Z' }, { value: 0, start: '2023-11-29T23:00:00.000Z' }, { value: 0, start: '2023-11-30T00:00:00.000Z' }, { value: 0, start: '2023-11-30T01:00:00.000Z' }, { value: 0, start: '2023-11-30T02:00:00.000Z' }, { value: 0, start: '2023-11-30T03:00:00.000Z' }, { value: 0, start: '2023-11-30T04:00:00.000Z' }, { value: 0, start: '2023-11-30T05:00:00.000Z' }, { value: 0, start: '2023-11-30T06:00:00.000Z' }, { value: 0.377, start: '2023-11-30T07:00:00.000Z' }, { value: 0.58, start: '2023-11-30T08:00:00.000Z' }, { value: 0.668, start: '2023-11-30T09:00:00.000Z' }, { value: 1.473, start: '2023-11-30T10:00:00.000Z' }, { value: 2.026, start: '2023-11-30T11:00:00.000Z' }, { value: 1.824, start: '2023-11-30T12:00:00.000Z' }, { value: 0.75, start: '2023-11-30T13:00:00.000Z' }, { value: 0.264, start: '2023-11-30T14:00:00.000Z' }, { value: 0, start: '2023-11-30T15:00:00.000Z' }, { value: 0, start: '2023-11-30T16:00:00.000Z' }, { value: 0, start: '2023-11-30T17:00:00.000Z' }, { value: 0, start: '2023-11-30T18:00:00.000Z' }, { value: 0, start: '2023-11-30T19:00:00.000Z' }, { value: 0, start: '2023-11-30T20:00:00.000Z' }, { value: 0, start: '2023-11-30T21:00:00.000Z' }, { value: 0, start: '2023-11-30T22:00:00.000Z' }, { value: 0, start: '2023-11-30T23:00:00.000Z' }, { value: 0, start: '2023-12-01T00:00:00.000Z' }, { value: 0, start: '2023-12-01T01:00:00.000Z' }, { value: 0, start: '2023-12-01T02:00:00.000Z' }, { value: 0, start: '2023-12-01T03:00:00.000Z' }, { value: 0, start: '2023-12-01T04:00:00.000Z' }, { value: 0, start: '2023-12-01T05:00:00.000Z' }, { value: 0, start: '2023-12-01T06:00:00.000Z' }, { value: 0, start: '2023-12-01T07:00:00.000Z' }, { value: 0.526, start: '2023-12-01T08:00:00.000Z' }, { value: 0.589, start: '2023-12-01T09:00:00.000Z' }, { value: 0.749, start: '2023-12-01T10:00:00.000Z' }, { value: 0.736, start: '2023-12-01T11:00:00.000Z' }, { value: 0.743, start: '2023-12-01T12:00:00.000Z' }, { value: 0.577, start: '2023-12-01T13:00:00.000Z' }, { value: 0.526, start: '2023-12-01T14:00:00.000Z' }, { value: 0, start: '2023-12-01T15:00:00.000Z' }, { value: 0, start: '2023-12-01T16:00:00.000Z' }, { value: 0, start: '2023-12-01T17:00:00.000Z' }, { value: 0, start: '2023-12-01T18:00:00.000Z' }, { value: 0, start: '2023-12-01T19:00:00.000Z' }, { value: 0, start: '2023-12-01T20:00:00.000Z' }, { value: 0, start: '2023-12-01T21:00:00.000Z' }, { value: 0, start: '2023-12-01T22:00:00.000Z' }, { value: 0, start: '2023-12-01T23:00:00.000Z' }, { value: 0, start: '2023-12-02T00:00:00.000Z' }, { value: 0, start: '2023-12-02T01:00:00.000Z' }, { value: 0, start: '2023-12-02T02:00:00.000Z' }, { value: 0, start: '2023-12-02T03:00:00.000Z' }, { value: 0, start: '2023-12-02T04:00:00.000Z' }, { value: 0, start: '2023-12-02T05:00:00.000Z' }, { value: 0, start: '2023-12-02T06:00:00.000Z' }, { value: 0.178, start: '2023-12-02T07:00:00.000Z' }, { value: 0.37, start: '2023-12-02T08:00:00.000Z' }, { value: 0.688, start: '2023-12-02T09:00:00.000Z' }, { value: 1.487, start: '2023-12-02T10:00:00.000Z' }, { value: 1.57, start: '2023-12-02T11:00:00.000Z' }, { value: 1.47, start: '2023-12-02T12:00:00.000Z' }, { value: 1.24, start: '2023-12-02T13:00:00.000Z' }, { value: 0.455, start: '2023-12-02T14:00:00.000Z' }, { value: 0, start: '2023-12-02T15:00:00.000Z' }, { value: 0, start: '2023-12-02T16:00:00.000Z' }, { value: 0, start: '2023-12-02T17:00:00.000Z' }, { value: 0, start: '2023-12-02T18:00:00.000Z' }, { value: 0, start: '2023-12-02T19:00:00.000Z' }, { value: 0, start: '2023-12-02T20:00:00.000Z' }, { value: 0, start: '2023-12-02T21:00:00.000Z' }, { value: 0, start: '2023-12-02T22:00:00.000Z' }, { value: 0, start: '2023-12-02T23:00:00.000Z' }, { value: 0, start: '2023-12-03T00:00:00.000Z' }, { value: 0, start: '2023-12-03T01:00:00.000Z' }, { value: 0, start: '2023-12-03T02:00:00.000Z' }, { value: 0, start: '2023-12-03T03:00:00.000Z' }, { value: 0, start: '2023-12-03T04:00:00.000Z' }, { value: 0, start: '2023-12-03T05:00:00.000Z' }, { value: 0, start: '2023-12-03T06:00:00.000Z' }, { value: 0.179, start: '2023-12-03T07:00:00.000Z' }, { value: 0.644, start: '2023-12-03T08:00:00.000Z' }, { value: 1.466, start: '2023-12-03T09:00:00.000Z' }, { value: 1.681, start: '2023-12-03T10:00:00.000Z' }, { value: 1.799, start: '2023-12-03T11:00:00.000Z' }, { value: 1.755, start: '2023-12-03T12:00:00.000Z' }, { value: 1.658, start: '2023-12-03T13:00:00.000Z' }, { value: 0.941, start: '2023-12-03T14:00:00.000Z' }, { value: 0, start: '2023-12-03T15:00:00.000Z' }, { value: 0, start: '2023-12-03T16:00:00.000Z' }, { value: 0, start: '2023-12-03T17:00:00.000Z' }], priceData: [{ value: 0.286, start: '2023-11-30T00:00:00.000+01:00', exportPrice: 0 }, { value: 0.2857, start: '2023-11-30T01:00:00.000+01:00', exportPrice: 0 }, { value: 0.283, start: '2023-11-30T02:00:00.000+01:00', exportPrice: 0 }, { value: 0.2803, start: '2023-11-30T03:00:00.000+01:00', exportPrice: 0 }, { value: 0.2823, start: '2023-11-30T04:00:00.000+01:00', exportPrice: 0 }, { value: 0.2878, start: '2023-11-30T05:00:00.000+01:00', exportPrice: 0 }, { value: 0.3153, start: '2023-11-30T06:00:00.000+01:00', exportPrice: 0 }, { value: 0.3614, start: '2023-11-30T07:00:00.000+01:00', exportPrice: 0 }, { value: 0.4223, start: '2023-11-30T08:00:00.000+01:00', exportPrice: 0 }, { value: 0.4435, start: '2023-11-30T09:00:00.000+01:00', exportPrice: 0 }, { value: 0.4261, start: '2023-11-30T10:00:00.000+01:00', exportPrice: 0 }, { value: 0.4271, start: '2023-11-30T11:00:00.000+01:00', exportPrice: 0 }, { value: 0.3936, start: '2023-11-30T12:00:00.000+01:00', exportPrice: 0 }, { value: 0.3872, start: '2023-11-30T13:00:00.000+01:00', exportPrice: 0 }, { value: 0.3934, start: '2023-11-30T14:00:00.000+01:00', exportPrice: 0 }, { value: 0.3934, start: '2023-11-30T15:00:00.000+01:00', exportPrice: 0 }, { value: 0.4303, start: '2023-11-30T16:00:00.000+01:00', exportPrice: 0 }, { value: 0.4719, start: '2023-11-30T17:00:00.000+01:00', exportPrice: 0 }, { value: 0.4581, start: '2023-11-30T18:00:00.000+01:00', exportPrice: 0 }, { value: 0.3928, start: '2023-11-30T19:00:00.000+01:00', exportPrice: 0 }, { value: 0.3445, start: '2023-11-30T20:00:00.000+01:00', exportPrice: 0 }, { value: 0.3193, start: '2023-11-30T21:00:00.000+01:00', exportPrice: 0 }, { value: 0.3098, start: '2023-11-30T22:00:00.000+01:00', exportPrice: 0 }, { value: 0.2968, start: '2023-11-30T23:00:00.000+01:00', exportPrice: 0 }, { value: 0.2886, start: '2023-12-01T00:00:00.000+01:00', exportPrice: 0 }, { value: 0.2835, start: '2023-12-01T01:00:00.000+01:00', exportPrice: 0 }, { value: 0.2793, start: '2023-12-01T02:00:00.000+01:00', exportPrice: 0 }, { value: 0.2754, start: '2023-12-01T03:00:00.000+01:00', exportPrice: 0 }, { value: 0.2757, start: '2023-12-01T04:00:00.000+01:00', exportPrice: 0 }, { value: 0.2831, start: '2023-12-01T05:00:00.000+01:00', exportPrice: 0 }, { value: 0.3042, start: '2023-12-01T06:00:00.000+01:00', exportPrice: 0 }, { value: 0.3424, start: '2023-12-01T07:00:00.000+01:00', exportPrice: 0 }, { value: 0.4035, start: '2023-12-01T08:00:00.000+01:00', exportPrice: 0 }, { value: 0.4263, start: '2023-12-01T09:00:00.000+01:00', exportPrice: 0 }, { value: 0.4176, start: '2023-12-01T10:00:00.000+01:00', exportPrice: 0 }, { value: 0.4154, start: '2023-12-01T11:00:00.000+01:00', exportPrice: 0 }, { value: 0.3959, start: '2023-12-01T12:00:00.000+01:00', exportPrice: 0 }, { value: 0.3698, start: '2023-12-01T13:00:00.000+01:00', exportPrice: 0 }, { value: 0.3688, start: '2023-12-01T14:00:00.000+01:00', exportPrice: 0 }, { value: 0.3808, start: '2023-12-01T15:00:00.000+01:00', exportPrice: 0 }, { value: 0.3994, start: '2023-12-01T16:00:00.000+01:00', exportPrice: 0 }, { value: 0.4359, start: '2023-12-01T17:00:00.000+01:00', exportPrice: 0 }, { value: 0.3983, start: '2023-12-01T18:00:00.000+01:00', exportPrice: 0 }, { value: 0.3619, start: '2023-12-01T19:00:00.000+01:00', exportPrice: 0 }, { value: 0.3308, start: '2023-12-01T20:00:00.000+01:00', exportPrice: 0 }, { value: 0.3102, start: '2023-12-01T21:00:00.000+01:00', exportPrice: 0 }, { value: 0.3022, start: '2023-12-01T22:00:00.000+01:00', exportPrice: 0 }, { value: 0.29, start: '2023-12-01T23:00:00.000+01:00', exportPrice: 0 }], batteryEnergyCost: 0.2163325618393338, soc: 58.3, minSoc: 15, schedule: [{ start: '2023-11-30T17:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.5263157894736841, socStart: 58.3, socEnd: 54.675235609685366 }, { start: '2023-11-30T18:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 54.675235609685366, socEnd: 50.325518341307806 }, { start: '2023-11-30T19:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 50.325518341307806, socEnd: 45.97580107293025 }, { start: '2023-11-30T20:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 45.97580107293025, socEnd: 41.62608380455269 }, { start: '2023-11-30T21:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 41.62608380455269, socEnd: 37.27636653617514 }, { start: '2023-11-30T22:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.36842105263157876, socStart: 37.27636653617514, socEnd: 34.7390314629549 }, { start: '2023-11-30T23:00:00.000Z', activity: 0, name: 'idle', duration: 60, cost: 0.10101, charge: 0, socStart: 34.7390314629549, socEnd: 34.7390314629549 }, { start: '2023-12-01T00:00:00.000Z', activity: 0, name: 'idle', duration: 60, cost: 0.09922499999999998, charge: 0, socStart: 34.7390314629549, socEnd: 34.7390314629549 }, { start: '2023-12-01T01:00:00.000Z', activity: 1, name: 'charging', duration: 60, cost: 0.991515, charge: 3.04, socStart: 34.7390314629549, socEnd: 55.675670581412206 }, { start: '2023-12-01T02:00:00.000Z', activity: 1, name: 'charging', duration: 60, cost: 0.97767, charge: 3.039999999999999, socStart: 55.675670581412206, socEnd: 76.6123096998695 }, { start: '2023-12-01T03:00:00.000Z', activity: 0, name: 'idle', duration: 60, cost: 0.096495, charge: 0, socStart: 76.6123096998695, socEnd: 76.6123096998695 }, { start: '2023-12-01T04:00:00.000Z', activity: 0, name: 'idle', duration: 60, cost: 0.099085, charge: 0, socStart: 76.6123096998695, socEnd: 76.6123096998695 }, { start: '2023-12-01T05:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.526315789473685, socStart: 76.6123096998695, socEnd: 72.98754530955486 }, { start: '2023-12-01T06:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.5789473684210531, socStart: 72.98754530955486, socEnd: 69.00030448020877 }, { start: '2023-12-01T07:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -1.0526315789473681, socStart: 69.00030448020877, socEnd: 61.750775699579506 }, { start: '2023-12-01T08:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.49894736842105303, socStart: 61.750775699579506, socEnd: 58.31449905756124 }, { start: '2023-12-01T09:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.4326315789473689, socStart: 58.31449905756124, socEnd: 55.3349427287226 }, { start: '2023-12-01T10:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -1.3168421052631576, socStart: 55.3349427287226, socEnd: 46.2657822241554 }, { start: '2023-12-01T11:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.8042105263157895, socStart: 46.2657822241554, socEnd: 40.727142235754656 }, { start: '2023-12-01T12:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: 0.13584999999999958, socStart: 40.727142235754656, socEnd: 41.66274829636071 }, { start: '2023-12-01T13:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.024210526315789238, socStart: 41.66274829636071, socEnd: 41.496009134406236 }, { start: '2023-12-01T14:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.07789473684210524, socStart: 41.496009134406236, socEnd: 40.959544004639675 }, { start: '2023-12-01T15:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.5263157894736841, socStart: 40.959544004639675, socEnd: 37.33477961432504 }, { start: '2023-12-01T16:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.4210526315789478, socStart: 37.33477961432504, socEnd: 34.43496810207334 }, { start: '2023-12-01T17:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.5263157894736841, socStart: 34.43496810207334, socEnd: 30.81020371175871 }, { start: '2023-12-01T18:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 30.81020371175871, socEnd: 26.460486443381154 }, { start: '2023-12-01T19:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 26.460486443381154, socEnd: 22.110769175003593 }, { start: '2023-12-01T20:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0, charge: -0.6315789473684212, socStart: 22.110769175003593, socEnd: 17.761051906626037 }, { start: '2023-12-01T21:00:00.000Z', activity: -1, name: 'discharging', duration: 60, cost: 0.06016658852631713, charge: -0.4220049861495796, socStart: 17.761051906626037, socEnd: 14.85468147859863 }, { start: '2023-12-01T22:00:00.000Z', activity: 0, name: 'idle', duration: 60, cost: 0.10149999999999999, charge: 0, socStart: 14.85468147859863, socEnd: 14.85468147859863 }], cost: 2.5266665885263175, excessPvEnergyUse: 'CHARGE_BATTERY', noBattery: { schedule: [{ start: '2023-11-30T17:00:00.000Z', activity: 0, name: 'idle', duration: 1800, cost: 6.8715, charge: 0, socStart: 58.3, socEnd: 58.3 }], excessPvEnergyUse: 'GRID_FEED_IN', cost: 6.8715 } }

      n1.receive({ payload: inputPayload })
    })
  })

  xit('correctly working efficiency', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 50,
        numberOfPricePeriods: 14,
        generations: 100,
        mutationRate: 3,
        batteryMaxEnergy: 12.5,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
        excessPvEnergyUse: '1',
        batteryCost: 0.05,
        efficiency: 0.9
      },
      { id: 'n2', type: 'helper' }
    ]
    helper.load(node, flow, function callback () {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback (msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')
        expect(msg.payload.cost).not.toBe(NaN)

        // is converted to int on input
        expect(msg.payload.excessPvEnergyUse).toEqual('CHARGE_BATTERY')

        console.log(JSON.stringify(msg.payload, null, 1))
        done()
      })

      const inputPayload = {
        consumptionForecast: [
          { start: '2023-11-12T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-13T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-13T07:00:00.000Z', value: 1 },
          { start: '2023-11-13T08:00:00.000Z', value: 1 },
          { start: '2023-11-13T09:00:00.000Z', value: 1 },
          { start: '2023-11-13T10:00:00.000Z', value: 2 },
          { start: '2023-11-13T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-13T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-13T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-13T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-13T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-13T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-13T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-14T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-14T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-14T07:00:00.000Z', value: 1 },
          { start: '2023-11-14T08:00:00.000Z', value: 1 },
          { start: '2023-11-14T09:00:00.000Z', value: 1 },
          { start: '2023-11-14T10:00:00.000Z', value: 2 },
          { start: '2023-11-14T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-14T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-14T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-14T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-14T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-14T22:00:00.000Z', value: 0.35 }
        ],
        soc: 2.1999999999999993,
        productionForecast: [
          { start: '2023-11-12T18:00:00.000Z', value: 0 },
          { start: '2023-11-12T19:00:00.000Z', value: 0 },
          { start: '2023-11-12T20:00:00.000Z', value: 0 },
          { start: '2023-11-12T21:00:00.000Z', value: 0 },
          { start: '2023-11-12T22:00:00.000Z', value: 0 },
          { start: '2023-11-12T23:00:00.000Z', value: 0 },
          { start: '2023-11-13T00:00:00.000Z', value: 0 },
          { start: '2023-11-13T01:00:00.000Z', value: 0 },
          { start: '2023-11-13T02:00:00.000Z', value: 0 },
          { start: '2023-11-13T03:00:00.000Z', value: 0 },
          { start: '2023-11-13T04:00:00.000Z', value: 0 },
          { start: '2023-11-13T05:00:00.000Z', value: 0 },
          { start: '2023-11-13T06:00:00.000Z', value: 0 },
          { start: '2023-11-13T07:00:00.000Z', value: 0.8632705628516 },
          { start: '2023-11-13T08:00:00.000Z', value: 0.8579637943369001 },
          { start: '2023-11-13T09:00:00.000Z', value: 0.7951530077777 },
          { start: '2023-11-13T10:00:00.000Z', value: 0.7441742409044 },
          { start: '2023-11-13T11:00:00.000Z', value: 0.7387340391753999 },
          { start: '2023-11-13T12:00:00.000Z', value: 0.7784026024899 },
          { start: '2023-11-13T13:00:00.000Z', value: 1.1882781469500001 },
          { start: '2023-11-13T14:00:00.000Z', value: 0.5024809888292 },
          { start: '2023-11-13T15:00:00.000Z', value: 0 },
          { start: '2023-11-13T16:00:00.000Z', value: 0 },
          { start: '2023-11-13T17:00:00.000Z', value: 0 },
          { start: '2023-11-13T18:00:00.000Z', value: 0 },
          { start: '2023-11-13T19:00:00.000Z', value: 0 },
          { start: '2023-11-13T20:00:00.000Z', value: 0 },
          { start: '2023-11-13T21:00:00.000Z', value: 0 },
          { start: '2023-11-13T22:00:00.000Z', value: 0 },
          { start: '2023-11-13T23:00:00.000Z', value: 0 },
          { start: '2023-11-14T00:00:00.000Z', value: 0 },
          { start: '2023-11-14T01:00:00.000Z', value: 0 },
          { start: '2023-11-14T02:00:00.000Z', value: 0 },
          { start: '2023-11-14T03:00:00.000Z', value: 0 },
          { start: '2023-11-14T04:00:00.000Z', value: 0 },
          { start: '2023-11-14T05:00:00.000Z', value: 0 },
          { start: '2023-11-14T06:00:00.000Z', value: 0 },
          { start: '2023-11-14T07:00:00.000Z', value: 0.1761527855842 },
          { start: '2023-11-14T08:00:00.000Z', value: 0.7112882892174001 },
          { start: '2023-11-14T09:00:00.000Z', value: 0.7482029022643 },
          { start: '2023-11-14T10:00:00.000Z', value: 1.5275184710428 },
          { start: '2023-11-14T11:00:00.000Z', value: 1.9539738365803 },
          { start: '2023-11-14T12:00:00.000Z', value: 1.8442485650573002 },
          { start: '2023-11-14T13:00:00.000Z', value: 1.6157506986663 },
          { start: '2023-11-14T14:00:00.000Z', value: 1.1795052568259 },
          { start: '2023-11-14T15:00:00.000Z', value: 0 },
          { start: '2023-11-14T16:00:00.000Z', value: 0 },
          { start: '2023-11-14T17:00:00.000Z', value: 0 },
          { start: '2023-11-14T18:00:00.000Z', value: 0 },
          { start: '2023-11-14T19:00:00.000Z', value: 0 },
          { start: '2023-11-14T20:00:00.000Z', value: 0 },
          { start: '2023-11-14T21:00:00.000Z', value: 0 },
          { start: '2023-11-14T22:00:00.000Z', value: 0 },
          { start: '2023-11-14T23:00:00.000Z', value: 0 },
          { start: '2023-11-15T00:00:00.000Z', value: 0 },
          { start: '2023-11-15T01:00:00.000Z', value: 0 },
          { start: '2023-11-15T02:00:00.000Z', value: 0 },
          { start: '2023-11-15T03:00:00.000Z', value: 0 },
          { start: '2023-11-15T04:00:00.000Z', value: 0 },
          { start: '2023-11-15T05:00:00.000Z', value: 0 },
          { start: '2023-11-15T06:00:00.000Z', value: 0 },
          { start: '2023-11-15T07:00:00.000Z', value: 0.5143413139651 },
          { start: '2023-11-15T08:00:00.000Z', value: 0.7708792742163 },
          { start: '2023-11-15T09:00:00.000Z', value: 1.3555000283991 },
          { start: '2023-11-15T10:00:00.000Z', value: 2.0080862505682 },
          { start: '2023-11-15T11:00:00.000Z', value: 2.1346718096727 },
          { start: '2023-11-15T12:00:00.000Z', value: 2.0561009784861 },
          { start: '2023-11-15T13:00:00.000Z', value: 1.8186763128531 },
          { start: '2023-11-15T14:00:00.000Z', value: 1.5340201912098 },
          { start: '2023-11-15T15:00:00.000Z', value: 0.46467725871110005 },
          { start: '2023-11-15T16:00:00.000Z', value: 0 },
          { start: '2023-11-15T17:00:00.000Z', value: 0 },
          { start: '2023-11-15T18:00:00.000Z', value: 0 },
          { start: '2023-11-15T19:00:00.000Z', value: 0 },
          { start: '2023-11-15T20:00:00.000Z', value: 0 },
          { start: '2023-11-15T21:00:00.000Z', value: 0 },
          { start: '2023-11-15T22:00:00.000Z', value: 0 },
          { start: '2023-11-15T23:00:00.000Z', value: 0 },
          { start: '2023-11-16T00:00:00.000Z', value: 0 },
          { start: '2023-11-16T01:00:00.000Z', value: 0 },
          { start: '2023-11-16T02:00:00.000Z', value: 0 },
          { start: '2023-11-16T03:00:00.000Z', value: 0 },
          { start: '2023-11-16T04:00:00.000Z', value: 0 },
          { start: '2023-11-16T05:00:00.000Z', value: 0 },
          { start: '2023-11-16T06:00:00.000Z', value: 0 },
          { start: '2023-11-16T07:00:00.000Z', value: 0.6086959174727 },
          { start: '2023-11-16T08:00:00.000Z', value: 0.8506773171806 },
          { start: '2023-11-16T09:00:00.000Z', value: 1.9942427087237 },
          { start: '2023-11-16T10:00:00.000Z', value: 2.185146813068 },
          { start: '2023-11-16T11:00:00.000Z', value: 2.1573263619309 },
          { start: '2023-11-16T12:00:00.000Z', value: 2.0861506896219 },
          { start: '2023-11-16T13:00:00.000Z', value: 2.0250475190944 },
          { start: '2023-11-16T14:00:00.000Z', value: 1.547800842696 },
          { start: '2023-11-16T15:00:00.000Z', value: 0 },
          { start: '2023-11-16T16:00:00.000Z', value: 0 },
          { start: '2023-11-16T17:00:00.000Z', value: 0 },
          { start: '2023-11-16T18:00:00.000Z', value: 0 }
        ],
        priceData: [
          {
            value: 0.2699,
            start: '2023-11-13T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2647,
            start: '2023-11-13T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2649,
            start: '2023-11-13T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2652,
            start: '2023-11-13T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2676,
            start: '2023-11-13T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2723,
            start: '2023-11-13T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3095,
            start: '2023-11-13T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3304,
            start: '2023-11-13T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.342,
            start: '2023-11-13T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3197,
            start: '2023-11-13T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3063,
            start: '2023-11-13T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3077,
            start: '2023-11-13T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3057,
            start: '2023-11-13T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2963,
            start: '2023-11-13T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2761,
            start: '2023-11-13T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2652,
            start: '2023-11-13T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2579,
            start: '2023-11-13T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2592,
            start: '2023-11-13T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2634,
            start: '2023-11-13T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2581,
            start: '2023-11-13T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2505,
            start: '2023-11-13T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2344,
            start: '2023-11-13T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2221,
            start: '2023-11-13T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1734,
            start: '2023-11-13T23:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1733,
            start: '2023-11-14T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1626,
            start: '2023-11-14T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1613,
            start: '2023-11-14T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1612,
            start: '2023-11-14T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1613,
            start: '2023-11-14T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1626,
            start: '2023-11-14T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2168,
            start: '2023-11-14T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2529,
            start: '2023-11-14T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2591,
            start: '2023-11-14T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.254,
            start: '2023-11-14T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2478,
            start: '2023-11-14T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.248,
            start: '2023-11-14T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2507,
            start: '2023-11-14T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2507,
            start: '2023-11-14T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2577,
            start: '2023-11-14T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2685,
            start: '2023-11-14T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2694,
            start: '2023-11-14T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3013,
            start: '2023-11-14T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3039,
            start: '2023-11-14T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3005,
            start: '2023-11-14T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2809,
            start: '2023-11-14T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2681,
            start: '2023-11-14T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2674,
            start: '2023-11-14T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2631,
            start: '2023-11-14T23:00:00.000+01:00',
            exportPrice: 0
          }
        ],
        schedule: [
          {
            start: '2023-11-13T19:00:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 2,
            cost: 0.005162,
            charge: 0,
            socStart: 2.2,
            socEnd: 2.2
          },
          {
            start: '2023-11-13T19:02:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 176,
            cost: 0.07872050000000001,
            charge: -1112.3137499999996,
            socStart: 2.2,
            socEnd: -8896.3
          },
          {
            start: '2023-11-13T21:58:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 1562,
            cost: 2.4256953277942057,
            charge: 149.85326524940592,
            socStart: -8896.3,
            socEnd: -7697.5
          }
        ],
        cost: 2.509577827794206,
        excessPvEnergyUse: 'CHARGE_BATTERY',
        noBattery: {
          schedule: [
            {
              start: '2023-11-13T18:00:00.000Z',
              activity: 0,
              name: 'idle',
              duration: 1740,
              cost: 2.866807327794206,
              charge: 0,
              socStart: 2.2,
              socEnd: 2.2
            }
          ],
          excessPvEnergyUse: 'GRID_FEED_IN',
          cost: 2.866807327794206
        }
      }

      n1.receive({ payload: inputPayload })
    })
  })
})
