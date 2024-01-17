class ConfigService {
  constructor() {
    this.config = null;
  }

  async init() {
    const res = await fetch("../assets/config/config.json");
    const config = await res.json();

    this.config = config;
  }

  getConfig() {
    return this.config;
  }
}
module.exports = new ConfigService();
