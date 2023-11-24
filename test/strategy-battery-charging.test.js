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
        populationSize: 100,
        numberOfPricePeriods: 24,
        generations: 150,
        mutationRate: 3,
        batteryMaxEnergy: 14.52,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
        excessPvEnergyUse: '1',
        batteryCost: 0.05,
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
          { start: '2023-11-22T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-23T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-23T07:00:00.000Z', value: 1 },
          { start: '2023-11-23T08:00:00.000Z', value: 1 },
          { start: '2023-11-23T09:00:00.000Z', value: 1 },
          { start: '2023-11-23T10:00:00.000Z', value: 2 },
          { start: '2023-11-23T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-23T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-23T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-23T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-23T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-23T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-23T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-24T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-24T07:00:00.000Z', value: 1 },
          { start: '2023-11-24T08:00:00.000Z', value: 1 },
          { start: '2023-11-24T09:00:00.000Z', value: 1 },
          { start: '2023-11-24T10:00:00.000Z', value: 2 },
          { start: '2023-11-24T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-24T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-24T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-24T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-24T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-24T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-24T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-25T05:00:00.000Z', value: 0.5 }
        ],
        minSoc: 15,
        soc: 18,
        productionForecast: [
          { start: '2023-11-22T19:00:00.000Z', value: 0 },
          { start: '2023-11-22T20:00:00.000Z', value: 0 },
          { start: '2023-11-22T21:00:00.000Z', value: 0 },
          { start: '2023-11-22T22:00:00.000Z', value: 0 },
          { start: '2023-11-22T23:00:00.000Z', value: 0 },
          { start: '2023-11-23T00:00:00.000Z', value: 0 },
          { start: '2023-11-23T01:00:00.000Z', value: 0 },
          { start: '2023-11-23T02:00:00.000Z', value: 0 },
          { start: '2023-11-23T03:00:00.000Z', value: 0 },
          { start: '2023-11-23T04:00:00.000Z', value: 0 },
          { start: '2023-11-23T05:00:00.000Z', value: 0 },
          { start: '2023-11-23T06:00:00.000Z', value: 0 },
          { start: '2023-11-23T07:00:00.000Z', value: 0.4421550051659 },
          { start: '2023-11-23T08:00:00.000Z', value: 0.9593746167245999 },
          { start: '2023-11-23T09:00:00.000Z', value: 0.8931161020414 },
          { start: '2023-11-23T10:00:00.000Z', value: 0.7427687502415999 },
          { start: '2023-11-23T11:00:00.000Z', value: 1.4846010979770001 },
          { start: '2023-11-23T12:00:00.000Z', value: 0.7511157003350001 },
          { start: '2023-11-23T13:00:00.000Z', value: 1.2073181351202 },
          { start: '2023-11-23T14:00:00.000Z', value: 0.3636050772365 },
          { start: '2023-11-23T15:00:00.000Z', value: 0 },
          { start: '2023-11-23T16:00:00.000Z', value: 0 },
          { start: '2023-11-23T17:00:00.000Z', value: 0 },
          { start: '2023-11-23T18:00:00.000Z', value: 0 },
          { start: '2023-11-23T19:00:00.000Z', value: 0 },
          { start: '2023-11-23T20:00:00.000Z', value: 0 },
          { start: '2023-11-23T21:00:00.000Z', value: 0 },
          { start: '2023-11-23T22:00:00.000Z', value: 0 },
          { start: '2023-11-23T23:00:00.000Z', value: 0 },
          { start: '2023-11-24T00:00:00.000Z', value: 0 },
          { start: '2023-11-24T01:00:00.000Z', value: 0 },
          { start: '2023-11-24T02:00:00.000Z', value: 0 },
          { start: '2023-11-24T03:00:00.000Z', value: 0 },
          { start: '2023-11-24T04:00:00.000Z', value: 0 },
          { start: '2023-11-24T05:00:00.000Z', value: 0 },
          { start: '2023-11-24T06:00:00.000Z', value: 0 },
          { start: '2023-11-24T07:00:00.000Z', value: 0.3341886778579 },
          { start: '2023-11-24T08:00:00.000Z', value: 0.6497670672915 },
          { start: '2023-11-24T09:00:00.000Z', value: 0.8302145592349 },
          { start: '2023-11-24T10:00:00.000Z', value: 1.3035689008322 },
          { start: '2023-11-24T11:00:00.000Z', value: 1.2834447516104999 },
          { start: '2023-11-24T12:00:00.000Z', value: 1.4937318853628 },
          { start: '2023-11-24T13:00:00.000Z', value: 1.1415843865495998 },
          { start: '2023-11-24T14:00:00.000Z', value: 0.4952564051115 },
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
          { start: '2023-11-25T07:00:00.000Z', value: 0.4786234405445 },
          { start: '2023-11-25T08:00:00.000Z', value: 0.832851443621 },
          { start: '2023-11-25T09:00:00.000Z', value: 0.9216629431226999 },
          { start: '2023-11-25T10:00:00.000Z', value: 1.4830407097936 },
          { start: '2023-11-25T11:00:00.000Z', value: 1.4930266358688 },
          { start: '2023-11-25T12:00:00.000Z', value: 1.4916545286064 },
          { start: '2023-11-25T13:00:00.000Z', value: 1.3292055701532999 },
          { start: '2023-11-25T14:00:00.000Z', value: 0.5588662681785 },
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
          { start: '2023-11-26T07:00:00.000Z', value: 0.47789641014620005 },
          { start: '2023-11-26T08:00:00.000Z', value: 0.8329630872244 },
          { start: '2023-11-26T09:00:00.000Z', value: 0.9299246254469 },
          { start: '2023-11-26T10:00:00.000Z', value: 1.4733614571054 },
          { start: '2023-11-26T11:00:00.000Z', value: 1.4838684261914 },
          { start: '2023-11-26T12:00:00.000Z', value: 1.5242771570217 },
          { start: '2023-11-26T13:00:00.000Z', value: 1.3043760284866 },
          { start: '2023-11-26T14:00:00.000Z', value: 0.5635641694131 },
          { start: '2023-11-26T15:00:00.000Z', value: 0 },
          { start: '2023-11-26T16:00:00.000Z', value: 0 },
          { start: '2023-11-26T17:00:00.000Z', value: 0 },
          { start: '2023-11-26T18:00:00.000Z', value: 0 },
          { start: '2023-11-26T19:00:00.000Z', value: 0 }
        ],
        priceData: [
          {
            value: 0.1631,
            start: '2023-11-24T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1615,
            start: '2023-11-24T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1615,
            start: '2023-11-24T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1617,
            start: '2023-11-24T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.1632,
            start: '2023-11-24T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.199,
            start: '2023-11-24T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2453,
            start: '2023-11-24T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2735,
            start: '2023-11-24T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2954,
            start: '2023-11-24T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2732,
            start: '2023-11-24T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2648,
            start: '2023-11-24T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2558,
            start: '2023-11-24T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2522,
            start: '2023-11-24T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2464,
            start: '2023-11-24T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.251,
            start: '2023-11-24T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2534,
            start: '2023-11-24T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2628,
            start: '2023-11-24T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2696,
            start: '2023-11-24T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2687,
            start: '2023-11-24T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.264,
            start: '2023-11-24T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2583,
            start: '2023-11-24T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2503,
            start: '2023-11-24T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2536,
            start: '2023-11-24T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.248,
            start: '2023-11-24T23:00:00.000+01:00',
            exportPrice: 0
          }
        ],
        timestamp: 1700767740021
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
