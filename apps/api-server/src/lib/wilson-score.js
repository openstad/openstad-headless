/**
 * Calculates the Wilson score interval lower bound for a given number of positive and negative votes.
 * @param wp Amount of positive votes
 * @param wn Amount of negative votes
 * @returns {number} Lower bound of the Wilson Score interval
 *
 * Source: https://github.com/Rayraegah/wilsonscore
 *
 * z = statistical confidence
 * Level,  z*value
 * 80%,    1.28
 * 85%,    1.44
 * 90%,    1.64
 * 95%,    1.96
 * 98%,    2.33
 * 99%,    2.58
 *
 * This z value can be adjusted via the WILSON_SCORE_Z environment variable and defaults to 1.96 (95% confidence).
 * To set it to 90% confidence, for example, set WILSON_SCORE_Z=1.64 in your environment.
 * For reference, Reddit uses a z value of 1.28 for an 80% confidence level.
 */
module.exports = function(wp, wn) {
  
  // Let the z value be configurable via environment variable, defaults to 1.96 (95% confidence)
  const z = process.env.WILSON_SCORE_Z ? parseFloat(process.env.WILSON_SCORE_Z) : 1.96;
  
  const n = wp + wn;
  
  if (n === 0) {
    return 0;
  }
  
  const p        = wp / n;
  const sqrtexpr = (p * (1 - p) + (z * z) / (4 * n)) / n;
  
  return (
    (p + (z * z) / (2 * n) - z * Math.sqrt(sqrtexpr)) / (1 + (z * z) / n)
  );
};
