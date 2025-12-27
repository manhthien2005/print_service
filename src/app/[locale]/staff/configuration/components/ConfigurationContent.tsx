'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ConfigurationCategory } from '../types';
import { Tabs } from '@/components/ui/Tabs';
import { PageSizePricesSection } from './PageSizePricesSection';
import { ColorModePricesSection } from './ColorModePricesSection';
import { DepositBonusSection } from './DepositBonusSection';
import { PageDiscountSection } from './PageDiscountSection';
import { PermittedFileTypesSection } from './PermittedFileTypesSection';
import { SemesterBonusSection } from './SemesterBonusSection';
import { GeneralConfigSection } from './GeneralConfigSection';
import { SystemNotificationsSection } from './SystemNotificationsSection';

type TabValue = ConfigurationCategory | 'all';

export function ConfigurationContent() {
  const t = useTranslations('staff.configuration.tabs');
  const [selectedCategory, setSelectedCategory] = useState<TabValue>('all');

  const tabItems = [
    { value: 'all' as TabValue, label: t('all') },
    { value: 'pricing' as TabValue, label: t('pricing') },
    { value: 'bonuses' as TabValue, label: t('bonuses') },
    { value: 'file-types' as TabValue, label: t('fileTypes') },
    { value: 'semester' as TabValue, label: t('semester') },
    { value: 'general' as TabValue, label: t('general') },
    { value: 'notifications' as TabValue, label: t('notifications') },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          items={tabItems}
          value={selectedCategory}
          onChange={newTab => setSelectedCategory(newTab)}
        />
      </div>

      {/* Configuration Sections */}
      {selectedCategory === 'all' || selectedCategory === 'pricing' ? (
        <>
          <PageSizePricesSection />
          <ColorModePricesSection />
        </>
      ) : null}

      {selectedCategory === 'all' || selectedCategory === 'bonuses' ? (
        <>
          <DepositBonusSection />
          <PageDiscountSection />
        </>
      ) : null}

      {selectedCategory === 'all' || selectedCategory === 'file-types' ? (
        <PermittedFileTypesSection />
      ) : null}

      {selectedCategory === 'all' || selectedCategory === 'semester' ? (
        <SemesterBonusSection />
      ) : null}

      {selectedCategory === 'all' || selectedCategory === 'general' ? (
        <GeneralConfigSection />
      ) : null}

      {selectedCategory === 'all' || selectedCategory === 'notifications' ? (
        <SystemNotificationsSection />
      ) : null}
    </div>
  );
}

export default ConfigurationContent;
