(() => {
  "use strict";
  const effectiveMonthlyRate = (annualRate) => Math.pow(1 + annualRate, 1 / 12) - 1;
  const futureValueMonthly = (principal, monthlyRate, months) => principal * Math.pow(1 + monthlyRate, months);
  const futureValueAnnual = (principal, annualRate, months) => futureValueMonthly(principal, effectiveMonthlyRate(annualRate), months);
  const futureValueWithMonthlyContributions = (initial, contribution, annualRate, months) => {
    const monthlyRate = effectiveMonthlyRate(annualRate);
    const initialValue = futureValueMonthly(initial, monthlyRate, months);
    const contributionsValue = monthlyRate === 0
      ? contribution * months
      : contribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return initialValue + contributionsValue;
  };
  window.CashyMath = Object.freeze({ effectiveMonthlyRate, futureValueMonthly, futureValueAnnual, futureValueWithMonthlyContributions });
})();
