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
        numberOfPricePeriods: 8,
        generations: 150,
        mutationRate: 3,
        batteryMaxEnergy: 14.52,
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
          { start: '2023-11-11T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-12T07:00:00.000Z', value: 1 },
          { start: '2023-11-12T08:00:00.000Z', value: 1 },
          { start: '2023-11-12T09:00:00.000Z', value: 1 },
          { start: '2023-11-12T10:00:00.000Z', value: 2 },
          { start: '2023-11-12T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-12T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-12T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T22:00:00.000Z', value: 0.35 },
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
          { start: '2023-11-13T22:00:00.000Z', value: 0.35 }
        ],
        productionForecast: [
          { start: '2023-11-11T19:00:00.000Z', value: 0 },
          { start: '2023-11-11T20:00:00.000Z', value: 0 },
          { start: '2023-11-11T21:00:00.000Z', value: 0 },
          { start: '2023-11-11T22:00:00.000Z', value: 0 },
          { start: '2023-11-11T23:00:00.000Z', value: 0 },
          { start: '2023-11-12T00:00:00.000Z', value: 0 },
          { start: '2023-11-12T01:00:00.000Z', value: 0 },
          { start: '2023-11-12T02:00:00.000Z', value: 0 },
          { start: '2023-11-12T03:00:00.000Z', value: 0 },
          { start: '2023-11-12T04:00:00.000Z', value: 0 },
          { start: '2023-11-12T05:00:00.000Z', value: 0 },
          { start: '2023-11-12T06:00:00.000Z', value: 0 },
          { start: '2023-11-12T07:00:00.000Z', value: 0.9187251992554 },
          { start: '2023-11-12T08:00:00.000Z', value: 1.111406454193 },
          { start: '2023-11-12T09:00:00.000Z', value: 2.0473300973969 },
          { start: '2023-11-12T10:00:00.000Z', value: 2.1681620573177 },
          { start: '2023-11-12T11:00:00.000Z', value: 2.0882592379497003 },
          { start: '2023-11-12T12:00:00.000Z', value: 1.8628509120930001 },
          { start: '2023-11-12T13:00:00.000Z', value: 1.4178307765945002 },
          { start: '2023-11-12T14:00:00.000Z', value: 0.5214328894145 },
          { start: '2023-11-12T15:00:00.000Z', value: 0 },
          { start: '2023-11-12T16:00:00.000Z', value: 0 },
          { start: '2023-11-12T17:00:00.000Z', value: 0 },
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
          { start: '2023-11-13T07:00:00.000Z', value: 0.7726741580683 },
          { start: '2023-11-13T08:00:00.000Z', value: 0.9376658511076 },
          { start: '2023-11-13T09:00:00.000Z', value: 0.8503470422884 },
          { start: '2023-11-13T10:00:00.000Z', value: 0.7981400542625999 },
          { start: '2023-11-13T11:00:00.000Z', value: 0.8313278359866 },
          { start: '2023-11-13T12:00:00.000Z', value: 0.8436328433299 },
          { start: '2023-11-13T13:00:00.000Z', value: 0.6654023337758 },
          { start: '2023-11-13T14:00:00.000Z', value: 0.5641871887294 },
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
          { start: '2023-11-14T07:00:00.000Z', value: 0.611927160149 },
          { start: '2023-11-14T08:00:00.000Z', value: 0.8586987232971 },
          { start: '2023-11-14T09:00:00.000Z', value: 0.9048100983123001 },
          { start: '2023-11-14T10:00:00.000Z', value: 1.434442192041 },
          { start: '2023-11-14T11:00:00.000Z', value: 1.7694625579901 },
          { start: '2023-11-14T12:00:00.000Z', value: 1.6747072726035002 },
          { start: '2023-11-14T13:00:00.000Z', value: 1.2242316464123 },
          { start: '2023-11-14T14:00:00.000Z', value: 0.6203164766917999 },
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
          { start: '2023-11-15T07:00:00.000Z', value: 0.6320587217004 },
          { start: '2023-11-15T08:00:00.000Z', value: 0.961242557842 },
          { start: '2023-11-15T09:00:00.000Z', value: 1.5024861886397 },
          { start: '2023-11-15T10:00:00.000Z', value: 2.2605765197556997 },
          { start: '2023-11-15T11:00:00.000Z', value: 2.5682763082458 },
          { start: '2023-11-15T12:00:00.000Z', value: 2.4808025348296 },
          { start: '2023-11-15T13:00:00.000Z', value: 2.026281210696 },
          { start: '2023-11-15T14:00:00.000Z', value: 1.4582146971969001 },
          { start: '2023-11-15T15:00:00.000Z', value: 0.3712809534091 },
          { start: '2023-11-15T16:00:00.000Z', value: 0 },
          { start: '2023-11-15T17:00:00.000Z', value: 0 },
          { start: '2023-11-15T18:00:00.000Z', value: 0 }
        ],
        priceData: [
          {
            value: 0.2679,
            start: '2023-11-12T00:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2629,
            start: '2023-11-12T01:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2628,
            start: '2023-11-12T02:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2605,
            start: '2023-11-12T03:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2615,
            start: '2023-11-12T04:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2647,
            start: '2023-11-12T05:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.264,
            start: '2023-11-12T06:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2644,
            start: '2023-11-12T07:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2656,
            start: '2023-11-12T08:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2681,
            start: '2023-11-12T09:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2668,
            start: '2023-11-12T10:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2645,
            start: '2023-11-12T11:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2662,
            start: '2023-11-12T12:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2673,
            start: '2023-11-12T13:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2729,
            start: '2023-11-12T14:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2917,
            start: '2023-11-12T15:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3087,
            start: '2023-11-12T16:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3259,
            start: '2023-11-12T17:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.318,
            start: '2023-11-12T18:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3106,
            start: '2023-11-12T19:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.3003,
            start: '2023-11-12T20:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2891,
            start: '2023-11-12T21:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2805,
            start: '2023-11-12T22:00:00.000+01:00',
            exportPrice: 0
          },
          {
            value: 0.2661,
            start: '2023-11-12T23:00:00.000+01:00',
            exportPrice: 0
          },
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
          }
        ],
        soc: 16,
        schedule: [
          {
            start: '2023-11-12T20:00:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 210,
            cost: 0,
            charge: -1.975,
            socStart: 14.8,
            socEnd: 0.7
          },
          {
            start: '2023-11-12T23:30:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 3,
            cost: 0.004656749999999999,
            charge: 0,
            socStart: 0.7,
            socEnd: 0.7
          },
          {
            start: '2023-11-12T23:33:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 5,
            cost: 0.007761249999999999,
            charge: 0,
            socStart: 0.7,
            socEnd: 0.7
          },
          {
            start: '2023-11-12T23:38:00+01:00',
            activity: 1,
            name: 'charging',
            duration: 13,
            cost: 0.20467525,
            charge: 0.6933333333333334,
            socStart: 0.7,
            socEnd: 5.6
          },
          {
            start: '2023-11-12T23:51:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 3,
            cost: 0.004656749999999999,
            charge: 0,
            socStart: 5.6,
            socEnd: 5.6
          },
          {
            start: '2023-11-12T23:54:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 39,
            cost: 0,
            charge: -0.22750000000000004,
            socStart: 5.6,
            socEnd: 4
          },
          {
            start: '2023-11-13T00:33:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 127,
            cost: 0.19696424999999998,
            charge: 0,
            socStart: 4,
            socEnd: 4
          },
          {
            start: '2023-11-13T02:40:00+01:00',
            activity: 1,
            name: 'charging',
            duration: 18,
            cost: 0.2821185,
            charge: 0.96,
            socStart: 4,
            socEnd: 10.9
          },
          {
            start: '2023-11-13T02:58:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 9,
            cost: 0.0139195,
            charge: 0,
            socStart: 10.9,
            socEnd: 10.9
          },
          {
            start: '2023-11-13T03:07:00+01:00',
            activity: 1,
            name: 'charging',
            duration: 17,
            cost: 0.266747,
            charge: 0.9066666666666667,
            socStart: 10.9,
            socEnd: 17.4
          },
          {
            start: '2023-11-13T03:24:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 16,
            cost: 0.024751999999999996,
            charge: 0,
            socStart: 17.4,
            socEnd: 17.4
          },
          {
            start: '2023-11-13T03:40:00+01:00',
            activity: 1,
            name: 'charging',
            duration: 17,
            cost: 0.266747,
            charge: 0.9066666666666667,
            socStart: 17.4,
            socEnd: 23.8
          },
          {
            start: '2023-11-13T03:57:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 119,
            cost: 0.18725233333333333,
            charge: 0,
            socStart: 23.8,
            socEnd: 23.8
          },
          {
            start: '2023-11-13T05:56:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 197,
            cost: 0,
            charge: -1.3141649075250537,
            socStart: 23.8,
            socEnd: 14.4
          },
          {
            start: '2023-11-13T09:13:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 5,
            cost: 0.001660685616741689,
            charge: 0,
            socStart: 14.4,
            socEnd: 14.4
          },
          {
            start: '2023-11-13T09:18:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 5,
            cost: 0.001660685616741689,
            charge: 0,
            socStart: 14.4,
            socEnd: 14.4
          },
          {
            start: '2023-11-13T09:23:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 275,
            cost: 0.011195559432115415,
            charge: -1.7864900105893764,
            socStart: 14.4,
            socEnd: 1.7
          },
          {
            start: '2023-11-13T13:06:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 106,
            cost: 0,
            charge: 0.27595158160260325,
            socStart: 1.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T14:52:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 22,
            cost: 0.0022160967614247235,
            charge: 0.008720311170106632,
            socStart: 3.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T15:14:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 51,
            cost: 0.018027294120871718,
            charge: 0,
            socStart: 3.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T16:05:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 12,
            cost: 0.025790000000000004,
            charge: 0,
            socStart: 3.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T16:17:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 42,
            cost: 0.090265,
            charge: 0,
            socStart: 3.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T16:59:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 2,
            cost: 0.0038771666666666668,
            charge: 0,
            socStart: 3.7,
            socEnd: 3.7
          },
          {
            start: '2023-11-13T17:01:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 103,
            cost: 0.06316762887500907,
            charge: -0.5201836413249465,
            socStart: 3.7,
            socEnd: 0
          },
          {
            start: '2023-11-13T18:44:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 200,
            cost: 0.489804,
            charge: 0,
            socStart: 0,
            socEnd: 0
          },
          {
            start: '2023-11-13T22:04:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 31,
            cost: 0.068851,
            charge: 0,
            socStart: 0,
            socEnd: 0
          },
          {
            start: '2023-11-13T22:35:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 41,
            cost: 0.071709,
            charge: 0,
            socStart: 0,
            socEnd: 0
          },
          {
            start: '2023-11-13T23:16:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 44,
            cost: 0.044506,
            charge: 0,
            socStart: 0,
            socEnd: 0
          }
        ]

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
