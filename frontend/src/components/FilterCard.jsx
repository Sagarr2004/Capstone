// import React, { useEffect, useState } from 'react'
// import { RadioGroup, RadioGroupItem } from './ui/radio-group'
// import { Label } from './ui/label'
// import { useDispatch } from 'react-redux'
// import { setSearchedQuery } from '@/redux/jobSlice'

// const fitlerData = [
//     {
//         fitlerType: "Location",
//         array: ["Delhi", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
//     },
//     {
//         fitlerType: "Industry",
//         array: ["Frontend Developer", "Backend Developer", "FullStack Developer", "Devops"]
//     },
//     {
//         fitlerType: "Salary",
//         array: ["2LPA-4LPA", "4LPA-8LPA", "8LPA to 12LPA","12LPA and Above"]
//     },
// ]

// const FilterCard = () => {
//     const [selectedValue, setSelectedValue] = useState('');
//     const dispatch = useDispatch();
//     const changeHandler = (value) => {
//         setSelectedValue(value);
//     }
//     useEffect(()=>{
//         dispatch(setSearchedQuery(selectedValue));
//     },[selectedValue]);
//     return (
//         <div className='w-full bg-white p-3 rounded-md'>
//             <h1 className='font-bold text-lg'>Filter Jobs</h1>
//             <hr className='mt-3' />
//             <RadioGroup value={selectedValue} onValueChange={changeHandler}>
//                 {
//                     fitlerData.map((data, index) => (
//                         <div>
//                             <h1 className='font-bold text-lg'>{data.fitlerType}</h1>
//                             {
//                                 data.array.map((item, idx) => {
//                                     const itemId = `id${index}-${idx}`
//                                     return (
//                                         <div className='flex items-center space-x-2 my-2'>
//                                             <RadioGroupItem value={item} id={itemId} />
//                                             <Label htmlFor={itemId}>{item}</Label>
//                                         </div>
//                                     )
//                                 })
//                             }
//                         </div>
//                     ))
//                 }
//             </RadioGroup>
//         </div>
//     )
// }

// export default FilterCard



import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useDispatch } from 'react-redux';
import { setSearchedQuery, setSearchJobBySalary } from '@/redux/jobSlice';

const filterData = [
    {
        filterType: 'Location',
        array: ['Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Mumbai'],
    },
    {
        filterType: 'Industry',
        array: ['Frontend Developer', 'Backend Developer', 'FullStack Developer', 'AI/ML','DevOps'],
    },
];

const salaryOptions = [
    { value: '2-4', label: '2LPA-4LPA' },
    { value: '4-8', label: '4LPA-8LPA' },
    { value: '8-12', label: '8LPA to 12LPA' },
    { value: '12', label: '12LPA and Above' },
];

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedSalary, setSelectedSalary] = useState('');
    const dispatch = useDispatch();

    const changeHandler = (value) => {
        setSelectedValue(value);
    };

    const changeSalaryHandler = (value) => {
        setSelectedSalary(value);
    };

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
        dispatch(setSearchJobBySalary(selectedSalary));
    }, [selectedValue, selectedSalary]);

    return (
        <div className="w-full bg-white p-3 rounded-md">
            <h1 className="font-bold text-lg">Filter Jobs</h1>
            <hr className="mt-3" />
            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                {filterData.map((data, index) => (
                    <div key={index}>
                        <h1 className="font-bold text-lg">{data.filterType}</h1>
                        {data.array.map((item, idx) => {
                            const itemId = `id${index}-${idx}`;
                            return (
                                <div className="flex items-center space-x-2 my-2" key={idx}>
                                    <RadioGroupItem value={item} id={itemId} />
                                    <Label htmlFor={itemId}>{item}</Label>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </RadioGroup>

            {/* Salary Filter */}
            <h1 className="font-bold text-lg mt-4">Salary</h1>
            <RadioGroup value={selectedSalary} onValueChange={changeSalaryHandler}>
                {salaryOptions.map((option, idx) => {
                    const itemId = `salary-${idx}`;
                    return (
                        <div className="flex items-center space-x-2 my-1" key={idx}>
                            <RadioGroupItem value={option.value} id={itemId} />
                            <Label htmlFor={itemId}>{option.label}</Label>
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
};

export default FilterCard;
