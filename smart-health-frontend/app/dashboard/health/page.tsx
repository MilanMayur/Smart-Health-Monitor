//health/page.tsx
'use client';
import Link from 'next/link';

const predictionCards = [
    {
        title: 'Predict Diabetes',
        description: `Diabetes prediction uses machine learning models to identify individuals 
                    at risk of developing diabetes. These models analyze data to predict the 
                    likelihood of diabetes based on various factors like age, gender, BMI, 
                    blood sugar levels, and blood pressure. Early detection and prevention are 
                    key to managing diabetes and reducing complications.`,
        href: '/dashboard/health/diabetes',
        gradient: 'from-sky-500 to-sky-700',
        hover: 'hover:from-sky-600 hover:to-sky-800',
    },
    {
        title: 'Predict Heart Disease',
        description: `Predicting heart disease involves assessing an individual's risk based on 
                    various factors, including age, sex, and lifestyle choices. Risk factors 
                    like high blood pressure, high cholesterol, diabetes, and smoking 
                    significantly increase the chances of heart disease.`,
        href: '/dashboard/health/heart',
        gradient: 'from-fuchsia-500 to-fuchsia-700',
        hover: 'hover:from-fuchsia-600 hover:to-fuchsia-800',
    },
    {
        title: 'Predict Stroke',
        description: `Predicting stroke risk involves identifying factors that increase 
                    the likelihood of a stroke, such as age, high blood pressure, heart disease, 
                    diabetes, smoking, and a history of TIAs. ML helps analyze these risks with 
                    more accuracy.`,
        href: '/dashboard/health/stroke',
        gradient: 'from-stone-500 to-stone-700',
        hover: 'hover:from-stone-600 hover:to-stone-800',
    },
];

export default function HealthForm() {
    return (
        <div className="p-6 mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Health Prediction
            </h1>

            {/* Navigation Links */}
            <div className="space-y-6 max-w-6xl mx-auto">
                {predictionCards.map((card, index) => (
                    <div key={index} className="bg-gradient-to-r from-white via-violet-100 
                        to-sky-200 rounded-xl shadow-lg flex flex-col items-center 
                        justify-center text-center p-4"
                    >
                        <p className="text-justify">{card.description}</p>
                        <Link href={card.href} className="mt-4 w-[200px]">
                            <button className={`text-white px-4 py-2 rounded-xl 
                                cursor-pointer shadow-lg bg-gradient-to-r 
                                ${card.gradient} ${card.hover}`}
                            >
                                {card.title}
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

/*

                <div className="bg-gradient-to-r from-white via-violet-100 to-sky-200 
                    rounded-xl shadow-lg flex flex-col items-center justify-center 
                    text-center p-4">
                    <p className="text-justify">
                        Diabetes prediction uses machine learning models to identify individuals 
                        at risk of developing diabetes. These models analyze data to predict the 
                        likelihood of diabetes based on various factors like age, gender, BMI, 
                        blood sugar levels, and blood pressure. Early detection and prevention 
                        are key to managing diabetes and reducing complications. 
                    </p>
                    <Link href="/dashboard/health/diabetes" className="mt-2 w-[200px]">
                        <button className="text-white px-4 py-2 rounded-xl cursor-pointer
                            bg-gradient-to-r from-sky-500 to-sky-700 shadow-lg
                            hover:from-sky-600 hover:to-sky-800">
                            Predict Diabetes
                        </button>
                    </Link>
                </div>


                <div className="bg-gradient-to-r from-white via-violet-100 to-sky-200 
                    rounded-xl shadow-lg flex flex-col items-center justify-center 
                    text-center p-4">
                    <p className="text-justify">
                        Predicting heart disease involves assessing an individual's risk based on 
                        various factors, including age, sex, lifestyle choices, to analyze this data 
                        and predict the likelihood of developing heart disease. Risk factors like 
                        high blood pressure, high cholesterol, diabetes, and smoking significantly 
                        increase the chances of heart disease.  
                    </p>
                    <Link href="/dashboard/health/heart" className="mt-2 w-[200px]">
                        <button className="text-white px-4 py-2 rounded-xl cursor-pointer
                            bg-gradient-to-r from-fuchsia-500 to-fuchsia-700 shadow-lg
                            hover:from-fuchsia-600 hover:to-fuchsia-800">
                            Predict Heart Disease
                        </button>
                    </Link>
                </div>


                <div className="bg-gradient-to-r from-white via-violet-100 to-sky-200  
                    rounded-xl shadow-lg flex flex-col items-center justify-center 
                    text-center p-4">
                    <p className="text-justify">
                        Predicting stroke risk involves identifying factors that increase the 
                        likelihood of a stroke, such as age, high blood pressure, heart disease, 
                        diabetes, smoking, and a history of transient ischemic attacks (TIAs). 
                        Machine learning techniques are increasingly being used to analyze patient 
                        data and identify these risk factors more accurately. 
                    </p>
                    <Link href="/dashboard/health/stroke" className="mt-2 w-[200px]">
                        <button className="text-white px-4 py-2 rounded-xl cursor-pointer
                            bg-gradient-to-r from-stone-500 to-stone-700 shadow-lg
                            hover:from-stone-600 hover:to-stone-800">
                            Predict Stroke
                        </button>
                    </Link>
                </div>
*/
