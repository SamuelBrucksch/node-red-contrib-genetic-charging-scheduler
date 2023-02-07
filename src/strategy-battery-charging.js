const {
  calculateBatteryChargingStrategy,
} = require('./strategy-battery-charging-functions')

const node = (RED) => {
  RED.nodes.registerType(
    'enell-strategy-genetic-charging',
    function callback(config) {
      RED.nodes.createNode(this, config)

      const {
        populationSize,
        numberOfPricePeriods,
        generations,
        mutationRate,
        batteryMaxEnergy,
        batteryMaxOutputPower,
        batteryMaxInputPower,
        averageConsumption,
      } = config

      this.on('input', async (msg, send, done) => {
        const priceData = msg.payload?.priceData ?? []
        const consumptionForecast = msg.payload?.consumptionForecast ?? []
        const productionForecast = msg.payload?.productionForecast ?? []
        const soc = msg.payload?.soc

        const strategy = calculateBatteryChargingStrategy({
          priceData,
          consumptionForecast,
          productionForecast,
          populationSize,
          numberOfPricePeriods,
          generations,
          mutationRate: mutationRate / 100,
          batteryMaxEnergy,
          batteryMaxOutputPower,
          batteryMaxInputPower,
          averageConsumption,
          consumptionForecast,
          productionForecast,
          soc: soc / 100,
        })

        const payload = msg.payload ?? {}

        if (strategy && Object.keys(strategy).length > 0) {
          msg.payload.schedule = strategy.best.schedule
          msg.payload.excessPvEnergyUse = strategy.best.excessPvEnergyUse
          msg.payload.cost = strategy.best.cost
          msg.payload.noBattery = {
            schedule: strategy.best.schedule,
            excessPvEnergyUse: strategy.best.excessPvEnergyUse,
            cost: strategy.best.cost,
          }
        }
        msg.payload = payload

        send(msg)
        done()
      })
    }
  )
}

module.exports = node
