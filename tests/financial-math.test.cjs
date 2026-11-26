const assert = require("node:assert/strict");
global.window = globalThis;
require("../js/financial-math.js");

const math = globalThis.CashyMath;
const closeTo = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not close to ${expected}`);

closeTo(math.futureValueMonthly(1000, 0.01, 12), 1126.8250301);
closeTo(math.futureValueAnnual(1000, 0.12, 12), 1120);
closeTo(math.futureValueAnnual(1000, 0.08, 12), 1080);
closeTo(math.futureValueAnnual(1000, -0.1, 12), 900);
closeTo(math.futureValueWithMonthlyContributions(1000, 100, 0, 12), 2200);
closeTo(math.futureValueWithMonthlyContributions(1000, 100, 0.12, 12), 2384.65, 0.02);

process.stdout.write("OK: monthly and annual compounding, contributions, and negative returns.\n");
