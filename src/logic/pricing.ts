import styleTypes from '@src/db/lookups/style-types.ts';
import safetyOptions from '@src/db/lookups/safety-options.ts';
import glassTypes from '@src/db/lookups/glass-types.ts';
import extrasOptions from '@src/db/lookups/extras-options.ts';
import { Job } from '@src/db/queries/job.ts';

const MM_TO_M2_CONVERSION = 0.000001;
const MIN_CHARGEABLE_AREA = 0.3;
const PERIMETER_DIFFICULTY_WEIGHT = 0.002;
const EVS_DIFFICULTY_REDUCTION = 0.3
// In the mobile app condition is 1 of 5 choices. However, Harley indicated that condition is always the default 0.3
// so instead of bothering with another field just fix this to 0.3.
const HANDLING_CONDITION_MODIFIER = 0.3;

export function calcPanelLabourHoursAndCosts(
  width: number,
  height: number,
  center: number,
  styleTypeName: string,
  jobInstance: Job
) {
  let p;
  if (center > height) {
    p = center;
  } else {
    p = height;
  }

  const styleType = styleTypes.find(o => o.name === styleTypeName);
  const dgValue = styleType ? styleType.dg_value : 0;
  const evsValue = styleType ? styleType.evs_value : 0;

  const d = (width + p) * PERIMETER_DIFFICULTY_WEIGHT;
  const d2 = Math.max(width * p * MM_TO_M2_CONVERSION, MIN_CHARGEABLE_AREA);

  const dgHour = dgValue + d2 + (d * HANDLING_CONDITION_MODIFIER);
  const dgCost = dgHour * jobInstance.hourlyRate;
  const evsHour = evsValue + d2 + (d * HANDLING_CONDITION_MODIFIER * EVS_DIFFICULTY_REDUCTION);
  const evsCost = evsHour * jobInstance.hourlyRate;

  return {
    dgHour,
    dgCost,
    evsHour,
    evsCost
  };
}

export function calcGlassCost(
  width: number,
  height: number,
  center: number,
  safetyOptionName: string,
  glassTypeName: string
) {

  let p;
  if (center > height) {
    p = width * center;
  } else {
    p = width * height;
  }

  const safetyOption = safetyOptions.find(o => o.name === safetyOptionName);
  const safetyValue = safetyOption ? safetyOption.value : 0;

  const glassType = glassTypes.find(o => o.name === glassTypeName);
  const glassValue = glassType ? glassType.value : 0;

  return (safetyValue + glassValue) * Math.max(p * MM_TO_M2_CONVERSION, MIN_CHARGEABLE_AREA);
}

export function calcWindowExtraCosts(optionName: string, quantity: number, jobInstance: Job) {
  const extraOption = extrasOptions.find(o => o.name === optionName);
  const unitCost = extraOption ? extraOption.value * jobInstance.productMargin : 0;
  const labourCost = extraOption ? extraOption.hours * jobInstance.hourlyRate : 0;
  const totalCost = (unitCost + labourCost) * (Number(quantity) || 0);

  return {
    unitCost,
    labourCost,
    totalCost
  }
}