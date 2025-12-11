import React from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { SnowAnimation } from './SnowAnimation';
import { NewYearAnimation } from './NewYearAnimation';

export const SeasonalManager: React.FC = () => {
    const { data } = usePortfolioData();
    const { season } = data.settings;

    if (season === 'christmas') {
        return <SnowAnimation />;
    }

    if (season === 'newyear') {
        return <NewYearAnimation />;
    }

    return null;
};
