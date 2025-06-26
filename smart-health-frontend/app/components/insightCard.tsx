//insightCard.tsx
import React from "react";

interface InsightCardProps {
    label: string;
    value: number | string;
    unit?: string;
    level: "low" | "moderate" | "high" | "none" | "na";
    tip?: string | null;
    thresholds: {
        high: number;
        moderate: number;
    };
    labels: {
        low: string;
        moderate: string;
        high: string;
        default?: string;
    };
}

const colorMap: Record<string, string> = {
    high: `text-red-700 bg-gradient-to-r from-white via-red-100 
            to-red-200 border-l-4 border-red-400`,
    moderate: `text-orange-700 bg-gradient-to-r from-white via-orange-100 
                to-orange-200 border-l-4 border-orange-400`,
    low: `text-green-700 bg-gradient-to-r from-green-200 via-green-100 
            to-white border-l-4 border-green-400`,
    none: `text-slate-700 bg-gradient-to-r from-white via-slate-100 
            to-slate-200 border-l-4 border-slate-400`,
};

export const InsightCard: React.FC<InsightCardProps> = ({
                                                            label, value, unit,
                                                            level, tip, thresholds,
                                                            labels,
                                                        }) => {
    const isNA = value === "N/A" || value === null || value === undefined;

    const getLevelLabel = () => {
        if (isNA) return "Data not available";
        if (typeof value === "number") {
            if (value >= thresholds.high) return labels.high;
            if (value >= thresholds.moderate) return labels.moderate;
            return labels.low;
        }
        return labels.default || "";
    };

    const bgColor = colorMap[level] || colorMap["none"];
    const textColor = bgColor.split(" ")[0];

    return (
        <div className={`p-4 rounded-xl shadow-lg ${bgColor}`}>
            <h3 className="text-md font-bold text-gray-800 mb-1">{label}</h3>
            <p className="text-lg font-semibold text-gray-900">
                {value} {unit}
            </p>
            <p className={`text-sm font-semibold ${textColor}`}>
                {getLevelLabel()}
            </p>
            <p className={`text-sm mt-2 ${textColor}`}>
                *{isNA ? "Please update your records." : tip}
            </p>
        </div>
    );
};
