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
        numberOfPricePeriods: 24,
        generations: 150,
        mutationRate: 3,
        batteryMaxEnergy: 14.52,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
        excessPvEnergyUse: '1',
        batteryCost: 0.03,
        efficiency: 0.9,
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

      const inputPayload = {
        consumptionForecast: [
          { start: '2023-11-24T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-25T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-25T07:00:00.000Z', value: 1 },
          { start: '2023-11-25T08:00:00.000Z', value: 1 },
          { start: '2023-11-25T09:00:00.000Z', value: 1 },
          { start: '2023-11-25T10:00:00.000Z', value: 2 },
          { start: '2023-11-25T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-25T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-25T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-25T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-25T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-25T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-26T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-26T07:00:00.000Z', value: 1 },
          { start: '2023-11-26T08:00:00.000Z', value: 1 },
          { start: '2023-11-26T09:00:00.000Z', value: 1 },
          { start: '2023-11-26T10:00:00.000Z', value: 2 },
          { start: '2023-11-26T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-26T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-26T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-26T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-26T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-26T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-26T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-27T05:00:00.000Z', value: 0.5 }
        ],
        priceData: [
          {
            value: 0.2542,
            start: '2023-11-25T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2494,
            start: '2023-11-25T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2471,
            start: '2023-11-25T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2466,
            start: '2023-11-25T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2446,
            start: '2023-11-25T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2496,
            start: '2023-11-25T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2563,
            start: '2023-11-25T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.265,
            start: '2023-11-25T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2735,
            start: '2023-11-25T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2705,
            start: '2023-11-25T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2675,
            start: '2023-11-25T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2649,
            start: '2023-11-25T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2623,
            start: '2023-11-25T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2602,
            start: '2023-11-25T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2685,
            start: '2023-11-25T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2752,
            start: '2023-11-25T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2981,
            start: '2023-11-25T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.309,
            start: '2023-11-25T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3126,
            start: '2023-11-25T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3127,
            start: '2023-11-25T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3055,
            start: '2023-11-25T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.298,
            start: '2023-11-25T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2985,
            start: '2023-11-25T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2839,
            start: '2023-11-25T23:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2935,
            start: '2023-11-26T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2872,
            start: '2023-11-26T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2835,
            start: '2023-11-26T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2805,
            start: '2023-11-26T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.277,
            start: '2023-11-26T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2777,
            start: '2023-11-26T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2801,
            start: '2023-11-26T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2863,
            start: '2023-11-26T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2954,
            start: '2023-11-26T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3009,
            start: '2023-11-26T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2985,
            start: '2023-11-26T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2978,
            start: '2023-11-26T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2963,
            start: '2023-11-26T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2923,
            start: '2023-11-26T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2983,
            start: '2023-11-26T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.308,
            start: '2023-11-26T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.321,
            start: '2023-11-26T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3325,
            start: '2023-11-26T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3394,
            start: '2023-11-26T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3324,
            start: '2023-11-26T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3231,
            start: '2023-11-26T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.307,
            start: '2023-11-26T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3029,
            start: '2023-11-26T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2832,
            start: '2023-11-26T23:00:00.000+01:00',
            exportPrice: 0
          }
        ],
        productionForecast: [
          { start: '2023-11-24T12:00:00.000Z', value: 0 },
          { start: '2023-11-24T13:00:00.000Z', value: 0.6548044487611 },
          { start: '2023-11-24T14:00:00.000Z', value: 0.42478017742449997 },
          { start: '2023-11-24T15:00:00.000Z', value: 0 },
          { start: '2023-11-24T16:00:00.000Z', value: 0 },
          { start: '2023-11-24T17:00:00.000Z', value: 0 },
          { start: '2023-11-24T18:00:00.000Z', value: 0 },
          { start: '2023-11-24T19:00:00.000Z', value: 0 },
          { start: '2023-11-24T20:00:00.000Z', value: 0 },
          { start: '2023-11-24T21:00:00.000Z', value: 0 },
          { start: '2023-11-24T22:00:00.000Z', value: 0 },
          { start: '2023-11-24T23:00:00.000Z', value: 0 },
          { start: '2023-11-25T00:00:00.000Z', value: 0 },
          { start: '2023-11-25T01:00:00.000Z', value: 0 },
          { start: '2023-11-25T02:00:00.000Z', value: 0 },
          { start: '2023-11-25T03:00:00.000Z', value: 0 },
          { start: '2023-11-25T04:00:00.000Z', value: 0 },
          { start: '2023-11-25T05:00:00.000Z', value: 0 },
          { start: '2023-11-25T06:00:00.000Z', value: 0 },
          { start: '2023-11-25T07:00:00.000Z', value: 0.045343363462299995 },
          { start: '2023-11-25T08:00:00.000Z', value: 0.6782903417877 },
          { start: '2023-11-25T09:00:00.000Z', value: 1.1011521565901001 },
          { start: '2023-11-25T10:00:00.000Z', value: 1.0664654115466998 },
          { start: '2023-11-25T11:00:00.000Z', value: 1.3851447361185 },
          { start: '2023-11-25T12:00:00.000Z', value: 0.8696365091681999 },
          { start: '2023-11-25T13:00:00.000Z', value: 0.9225947890016 },
          { start: '2023-11-25T14:00:00.000Z', value: 0.3132915760618 },
          { start: '2023-11-25T15:00:00.000Z', value: 0 },
          { start: '2023-11-25T16:00:00.000Z', value: 0 },
          { start: '2023-11-25T17:00:00.000Z', value: 0 },
          { start: '2023-11-25T18:00:00.000Z', value: 0 },
          { start: '2023-11-25T19:00:00.000Z', value: 0 },
          { start: '2023-11-25T20:00:00.000Z', value: 0 },
          { start: '2023-11-25T21:00:00.000Z', value: 0 },
          { start: '2023-11-25T22:00:00.000Z', value: 0 },
          { start: '2023-11-25T23:00:00.000Z', value: 0 },
          { start: '2023-11-26T00:00:00.000Z', value: 0 },
          { start: '2023-11-26T01:00:00.000Z', value: 0 },
          { start: '2023-11-26T02:00:00.000Z', value: 0 },
          { start: '2023-11-26T03:00:00.000Z', value: 0 },
          { start: '2023-11-26T04:00:00.000Z', value: 0 },
          { start: '2023-11-26T05:00:00.000Z', value: 0 },
          { start: '2023-11-26T06:00:00.000Z', value: 0 },
          { start: '2023-11-26T07:00:00.000Z', value: 0.205015455446 },
          { start: '2023-11-26T08:00:00.000Z', value: 0.7977939626588 },
          { start: '2023-11-26T09:00:00.000Z', value: 0.9177473865311 },
          { start: '2023-11-26T10:00:00.000Z', value: 1.4847052805951 },
          { start: '2023-11-26T11:00:00.000Z', value: 1.570298524285 },
          { start: '2023-11-26T12:00:00.000Z', value: 1.5937238861826 },
          { start: '2023-11-26T13:00:00.000Z', value: 1.3490278090381 },
          { start: '2023-11-26T14:00:00.000Z', value: 0.6911178203213 },
          { start: '2023-11-26T15:00:00.000Z', value: 0 },
          { start: '2023-11-26T16:00:00.000Z', value: 0 },
          { start: '2023-11-26T17:00:00.000Z', value: 0 },
          { start: '2023-11-26T18:00:00.000Z', value: 0 },
          { start: '2023-11-26T19:00:00.000Z', value: 0 },
          { start: '2023-11-26T20:00:00.000Z', value: 0 },
          { start: '2023-11-26T21:00:00.000Z', value: 0 },
          { start: '2023-11-26T22:00:00.000Z', value: 0 },
          { start: '2023-11-26T23:00:00.000Z', value: 0 },
          { start: '2023-11-27T00:00:00.000Z', value: 0 },
          { start: '2023-11-27T01:00:00.000Z', value: 0 },
          { start: '2023-11-27T02:00:00.000Z', value: 0 },
          { start: '2023-11-27T03:00:00.000Z', value: 0 },
          { start: '2023-11-27T04:00:00.000Z', value: 0 },
          { start: '2023-11-27T05:00:00.000Z', value: 0 },
          { start: '2023-11-27T06:00:00.000Z', value: 0 },
          { start: '2023-11-27T07:00:00.000Z', value: 0.4198514902153 },
          { start: '2023-11-27T08:00:00.000Z', value: 0.6997289724642 },
          { start: '2023-11-27T09:00:00.000Z', value: 0.9231165697801 },
          { start: '2023-11-27T10:00:00.000Z', value: 0.9348332221655999 },
          { start: '2023-11-27T11:00:00.000Z', value: 1.0581552457463 },
          { start: '2023-11-27T12:00:00.000Z', value: 1.4414005960454999 },
          { start: '2023-11-27T13:00:00.000Z', value: 0.9151747404305001 },
          { start: '2023-11-27T14:00:00.000Z', value: 0.6291496917864 },
          { start: '2023-11-27T15:00:00.000Z', value: 0 },
          { start: '2023-11-27T16:00:00.000Z', value: 0 },
          { start: '2023-11-27T17:00:00.000Z', value: 0 },
          { start: '2023-11-27T18:00:00.000Z', value: 0 },
          { start: '2023-11-27T19:00:00.000Z', value: 0 },
          { start: '2023-11-27T20:00:00.000Z', value: 0 },
          { start: '2023-11-27T21:00:00.000Z', value: 0 },
          { start: '2023-11-27T22:00:00.000Z', value: 0 },
          { start: '2023-11-27T23:00:00.000Z', value: 0 },
          { start: '2023-11-28T00:00:00.000Z', value: 0 },
          { start: '2023-11-28T01:00:00.000Z', value: 0 },
          { start: '2023-11-28T02:00:00.000Z', value: 0 },
          { start: '2023-11-28T03:00:00.000Z', value: 0 },
          { start: '2023-11-28T04:00:00.000Z', value: 0 },
          { start: '2023-11-28T05:00:00.000Z', value: 0 },
          { start: '2023-11-28T06:00:00.000Z', value: 0 },
          { start: '2023-11-28T07:00:00.000Z', value: 0.4019143954168 },
          { start: '2023-11-28T08:00:00.000Z', value: 0.7075801039555 },
          { start: '2023-11-28T09:00:00.000Z', value: 0.8609485886052001 },
          { start: '2023-11-28T10:00:00.000Z', value: 0.9138277820859999 },
          { start: '2023-11-28T11:00:00.000Z', value: 0.9692527938334 },
          { start: '2023-11-28T12:00:00.000Z', value: 0.9446257555821 }
        ],
        soc: 16.7,
        minSoc: 15,
        schedule: [
          {
            start: '2023-11-25T12:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: 0.2696365091681998,
            socStart: 16.7,
            socEnd: 18.557000751847106
          },
          {
            start: '2023-11-25T13:00:00.000Z',
            activity: 1,
            name: 'charging',
            duration: 60,
            cost: 0.7725832991530704,
            charge: 3.2000000000000006,
            socStart: 18.557000751847106,
            socEnd: 40.595568244960056
          },
          {
            start: '2023-11-25T14:00:00.000Z',
            activity: 1,
            name: 'charging',
            duration: 60,
            cost: 0.9595421582677927,
            charge: 3.1999999999999993,
            socStart: 40.595568244960056,
            socEnd: 62.634135738073006
          },
          {
            start: '2023-11-25T15:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5,
            socStart: 62.634135738073006,
            socEnd: 59.1906095672741
          },
          {
            start: '2023-11-25T16:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.40000000000000036,
            socStart: 59.1906095672741,
            socEnd: 56.43578863063499
          },
          {
            start: '2023-11-25T17:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5,
            socStart: 56.43578863063499,
            socEnd: 52.992262459836084
          },
          {
            start: '2023-11-25T18:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5999999999999996,
            socStart: 52.992262459836084,
            socEnd: 48.8600310548774
          },
          {
            start: '2023-11-25T19:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5999999999999996,
            socStart: 48.8600310548774,
            socEnd: 44.72779964991873
          },
          {
            start: '2023-11-25T20:00:00.000Z',
            activity: 1,
            name: 'charging',
            duration: 60,
            cost: 1.1324,
            charge: 3.200000000000001,
            socStart: 44.72779964991873,
            socEnd: 66.76636714303169
          },
          {
            start: '2023-11-25T21:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5999999999999996,
            socStart: 66.76636714303169,
            socEnd: 62.63413573807301
          },
          {
            start: '2023-11-25T22:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 62.63413573807301,
            socEnd: 60.223667418513784
          },
          {
            start: '2023-11-25T23:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 60.223667418513784,
            socEnd: 57.81319909895456
          },
          {
            start: '2023-11-26T00:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 57.81319909895456,
            socEnd: 55.402730779395334
          },
          {
            start: '2023-11-26T01:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 55.402730779395334,
            socEnd: 52.992262459836105
          },
          {
            start: '2023-11-26T02:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 52.992262459836105,
            socEnd: 50.581794140276884
          },
          {
            start: '2023-11-26T03:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 50.581794140276884,
            socEnd: 48.171325820717655
          },
          {
            start: '2023-11-26T04:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.34999999999999964,
            socStart: 48.171325820717655,
            socEnd: 45.76085750115843
          },
          {
            start: '2023-11-26T05:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5,
            socStart: 45.76085750115843,
            socEnd: 42.31733133035953
          },
          {
            start: '2023-11-26T06:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5499999999999998,
            socStart: 42.31733133035953,
            socEnd: 38.52945254248074
          },
          {
            start: '2023-11-26T07:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.7949845445540005,
            socStart: 38.52945254248074,
            socEnd: 33.054352373376055
          },
          {
            start: '2023-11-26T08:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.2022060373411998,
            socStart: 33.054352373376055,
            socEnd: 31.661748810420136
          },
          {
            start: '2023-11-26T09:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.08225261346890012,
            socStart: 31.661748810420136,
            socEnd: 31.095270756226608
          },
          {
            start: '2023-11-26T10:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5152947194049,
            socStart: 31.095270756226608,
            socEnd: 27.546409052336113
          },
          {
            start: '2023-11-26T11:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: 0.07029852428499961,
            socStart: 27.546409052336113,
            socEnd: 28.03055866862399
          },
          {
            start: '2023-11-26T12:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: 0.9937238861826003,
            socStart: 28.03055866862399,
            socEnd: 34.874387085859524
          },
          {
            start: '2023-11-26T13:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: 0.7490278090381004,
            socStart: 34.874387085859524,
            socEnd: 40.03298081201724
          },
          {
            start: '2023-11-26T14:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: 0.09111782032130034,
            socStart: 40.03298081201724,
            socEnd: 40.66051400982234
          },
          {
            start: '2023-11-26T15:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5,
            socStart: 40.66051400982234,
            socEnd: 37.216987839023446
          },
          {
            start: '2023-11-26T16:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.40000000000000036,
            socStart: 37.216987839023446,
            socEnd: 34.462166902384325
          },
          {
            start: '2023-11-26T17:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.5,
            socStart: 34.462166902384325,
            socEnd: 31.01864073158543
          },
          {
            start: '2023-11-26T18:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.6000000000000001,
            socStart: 31.01864073158543,
            socEnd: 26.886409326626747
          },
          {
            start: '2023-11-26T19:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.6000000000000001,
            socStart: 26.886409326626747,
            socEnd: 22.75417792166807
          },
          {
            start: '2023-11-26T20:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0,
            charge: -0.6000000000000001,
            socStart: 22.75417792166807,
            socEnd: 18.62194651670939
          },
          {
            start: '2023-11-26T21:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0.02244288049288294,
            charge: -0.5259066342262035,
            socStart: 18.62194651670939,
            socEnd: 15
          },
          {
            start: '2023-11-26T22:00:00.000Z',
            activity: -1,
            name: 'discharging',
            duration: 60,
            cost: 0.09912,
            charge: 0,
            socStart: 15,
            socEnd: 15
          }
        ],
        cost: 2.9860883379137464,
        excessPvEnergyUse: 'CHARGE_BATTERY',
        noBattery: {
          schedule: [
            {
              start: '2023-11-25T12:00:00.000Z',
              activity: 0,
              name: 'idle',
              duration: 2100,
              cost: 0,
              charge: 0,
              socStart: 16.7,
              socEnd: 16.7
            }
          ],
          excessPvEnergyUse: 'GRID_FEED_IN',
          cost: 0
        }
      }

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
