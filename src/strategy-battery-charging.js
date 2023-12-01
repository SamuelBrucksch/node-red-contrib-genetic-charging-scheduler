const {
  calculateBatteryChargingStrategy
} = require('./strategy-battery-charging-functions')

const node = (RED) => {
  RED.nodes.registerType(
    'strategy-genetic-charging',
    function callback (config) {
      config.populationSize = parseInt(config.populationSize)
      config.generations = parseInt(config.generations)
      config.mutationRate = parseInt(config.mutationRate)
      config.batteryMaxEnergy = parseFloat(config.batteryMaxEnergy)
      config.batteryMaxInputPower = parseFloat(config.batteryMaxInputPower)
      config.batteryMaxOutputPower = parseFloat(config.batteryMaxOutputPower)
      config.averageConsumption = parseFloat(config.averageConsumption)
      config.excessPvEnergyUse = parseInt(config.excessPvEnergyUse)
      config.batteryCost = 0 // TODO: fix battery cost parseFloat(config.batteryCost)
      config.efficiency = parseInt(config.efficiency)
      RED.nodes.createNode(this, config)

      const {
        populationSize,
        generations,
        mutationRate,
        batteryMaxEnergy,
        batteryMaxInputPower,
        batteryMaxOutputPower,
        averageConsumption,
        excessPvEnergyUse, // 0=Feed to grid, 1=Charge
        efficiency,
        batteryCost // battery price / (cycles * capacity)
      } = config

      this.on('input', async (msg, send, done) => {
        const priceData = msg.payload?.priceData ?? []
        const consumptionForecast = msg.payload?.consumptionForecast ?? []
        const productionForecast = msg.payload?.productionForecast ?? []
        const soc = msg.payload?.soc
        const minSoc = msg.payload?.minSoc ?? 0
        const batteryEnergyCost = msg.payload?.batteryCost ?? 0 // price / kwh currently stored in battery

        const strategy = calculateBatteryChargingStrategy({
          priceData,
          consumptionForecast,
          productionForecast,
          populationSize,
          generations,
          mutationRate: mutationRate / 100,
          batteryMaxEnergy,
          batteryMaxOutputPower,
          batteryMaxInputPower,
          averageConsumption,
          excessPvEnergyUse,
          soc: soc / 100,
          batteryCost,
          efficiency: efficiency / 100,
          minSoc: minSoc / 100,
          batteryEnergyCost
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
