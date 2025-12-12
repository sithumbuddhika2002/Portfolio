import React from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { SnowAnimation } from './SnowAnimation';
import { NewYearAnimation } from './NewYearAnimation';

export const SeasonalManager: React.FC = () => {
    const { data, loading } = usePortfolioData();

    // Don't render anything while data is loading or if settings is undefined
    if (loading || !data.settings) {
        return null;
    }

    const { season } = data.settings;

    if (season === 'christmas') {
        return <SnowAnimation />;
    }

    if (season === 'newyear') {
        return <NewYearAnimation />;
    }

    return null;
};
