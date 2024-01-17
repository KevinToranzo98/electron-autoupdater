const configService = require("./config/config");

// const testUrl =
//   process.env.NODE_ENV === "test"
//     ? "https://pki-dev.boxcustodia.com"
//     : undefined;

// export const configUrl = testUrl || configService.config?.baseUrl

module.exports.configUrl = "https://pki-dev.boxcustodia.com";
