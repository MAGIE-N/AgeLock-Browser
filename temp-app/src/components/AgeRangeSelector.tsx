import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { window } from 'electron';
import ContentFilterService from '../services/ContentFilterService';

const AgeRangeSelector = () => {
    const [selectedRange, setSelectedRange] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ageRanges = [
        { label: '5-12 Years', value: '5-12' },
        { label: '13-17 Years', value: '13-17' },
        { label: '18+ Years', value: '18+' }
    ];

    const handleAgeRangeSelect = async (range: string) => {
        setLoading(true);
        setError(null);

        try {
            // Verify age with TPM
            const result = await window.electron.verifyAge({
                age: range,
                timestamp: new Date().toISOString()
            });

            if (!result.success) {
                throw new Error(result.error || 'Age verification failed');
            }

            // Set age range in content filter
            ContentFilterService.setAgeRange(range);
            setSelectedRange(range);
            navigate('/browser');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
                    Select Your Age Range
                </h1>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ageRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => handleAgeRangeSelect(range.value)}
                            className={`
                                p-6 rounded-xl transition-all duration-300
                                ${selectedRange === range.value 
                                    ? 'bg-indigo-500 text-white shadow-lg' 
                                    : 'bg-white text-indigo-700 hover:shadow-lg'
                                }
                            `}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                {range.label}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {range.value === '5-12' && (
                                    <>
                                        Educational content only
                                        <br />
                                        Whitelisted websites only
                                    </>
                                )}
                                {range.value === '13-17' && (
                                    <>
                                        Social media allowed
                                        <br />
                                        Limited content filtering
                                    </>
                                )}
                                {range.value === '18+' && (
                                    <>
                                        All content allowed
                                        <br />
                                        Basic filtering only
                                    </>
                                )}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgeRangeSelector;
