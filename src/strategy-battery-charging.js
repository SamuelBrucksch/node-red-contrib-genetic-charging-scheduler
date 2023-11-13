const {
  calculateBatteryChargingStrategy
} = require('./strategy-battery-charging-functions')

const node = (RED) => {
  RED.nodes.registerType(
    'strategy-genetic-charging',
    function callback (config) {
      config.populationSize = parseInt(config.populationSize)
      config.numberOfPricePeriods = parseInt(config.numberOfPricePeriods)
      config.generations = parseInt(config.generations)
      config.mutationRate = parseInt(config.mutationRate)
      config.batteryMaxEnergy = parseFloat(config.batteryMaxEnergy)
      config.batteryMaxInputPower = parseFloat(config.batteryMaxInputPower)
      config.batteryMaxOutputPower = parseFloat(config.batteryMaxOutputPower)
      config.averageConsumption = parseFloat(config.averageConsumption)
      config.excessPvEnergyUse = parseInt(config.excessPvEnergyUse)
      config.batteryCost = parseFloat(config.batteryCost)
      config.efficiency = 1 // TODO: fix efficiency parseInt(config.efficiency)
      RED.nodes.createNode(this, config)

      const {
        populationSize,
        numberOfPricePeriods,
        generations,
        mutationRate,
        batteryMaxEnergy,
        batteryMaxInputPower,
        batteryMaxOutputPower,
        averageConsumption,
        excessPvEnergyUse, // 0=Feed to grid, 1=Charge
        batteryCost,
        efficiency
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
          excessPvEnergyUse,
          soc: soc / 100,
          batteryCost,
          efficiency
        })

        const payload = msg.payload ?? {}

        if (strategy && Object.keys(strategy).length > 0) {
          msg.payload.schedule = strategy.best.schedule
          msg.payload.cost = strategy.best.cost
          msg.payload.excessPvEnergyUse = excessPvEnergyUse === 1 ? 'CHARGE_BATTERY' : 'GRID_FEED_IN'
          msg.payload.noBattery = {
            schedule: strategy.noBattery.schedule,
            excessPvEnergyUse: strategy.noBattery.excessPvEnergyUse === 1 ? 'CHARGE_BATTERY' : 'GRID_FEED_IN',
            cost: strategy.noBattery.cost
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
