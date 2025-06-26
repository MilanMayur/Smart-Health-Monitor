// utils/tipCardConfig.ts

export interface TipCardConfig {
  key: string;
  label: string;
  unit?: string;
  thresholds: {
    high: number;
    moderate: number;
  };
  labels: {
    high: string;
    moderate: string;
    low: string;
    default?: string;
  };
}

export const tipCardConfigs: TipCardConfig[] = [
  {
    key: "bmi",
    label: "BMI",
    unit: "",
    thresholds: { high: 30, moderate: 25 },
    labels: {
      high: "Obese",
      moderate: "Overweight",
      low: "Normal",
      default: "Underweight",
    },
  },
  {
    key: "maxHeartRate",
    label: "Max Heart Rate",
    unit: "bpm",
    thresholds: { high: 200, moderate: 100 },
    labels: {
      high: "High",
      moderate: "Normal",
      low: "Low",
    },
  },
  {
    key: "glucose",
    label: "Glucose",
    unit: "mg/dL",
    thresholds: { high: 126, moderate: 100 },
    labels: {
      high: "Diabetes",
      moderate: "Prediabetes",
      low: "Normal",
    },
  },
  {
    key: "insulin",
    label: "Insulin",
    unit: "μU/mL",
    thresholds: { high: 150, moderate: 25 },
    labels: {
      high: "High",
      moderate: "Moderate",
      low: "Normal",
      default: "Low",
    },
  },
  {
    key: "bloodPressure",
    label: "Blood Pressure",
    unit: "mmHg",
    thresholds: { high: 140, moderate: 120 },
    labels: {
      high: "High",
      moderate: "Elevated",
      low: "Normal",
    },
  },
  {
    key: "cholesterol",
    label: "Cholesterol",
    unit: "mg/dL",
    thresholds: { high: 240, moderate: 200 },
    labels: {
      high: "High",
      moderate: "Borderline High",
      low: "Desirable",
    },
  },
];
