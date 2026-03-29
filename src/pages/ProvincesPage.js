import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Helmet,
  useModulesManager,
  useTranslations,
  useHistory,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  ROUTE_GEOGRAPHY_PROVINCE,
} from '../constants';
import ProvinceMapTable from '../components/geography/ProvinceMapTable';
import { useGeographyProvincesSummary } from '../hooks/useGeographyData';

const useStyles = makeStyles((theme) => ({
  page: {
    ...theme.page,
    display: 'flex',
    flexDirection: 'column',
  },
}));

function ProvincesPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [benefitPlanId, setBenefitPlanId] = useState(null);
  const [year, setYear] = useState(null);

  const { provinces, isLoading, refetch } = useGeographyProvincesSummary(benefitPlanId, year);

  const handleProvinceClick = (uuid) => {
    history.push(`/${ROUTE_GEOGRAPHY_PROVINCE}/${uuid}`);
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('geography.provinces.title')} />
      <ProvinceMapTable
        provinces={provinces}
        isLoading={isLoading}
        benefitPlanId={benefitPlanId}
        year={year}
        onBenefitPlanChange={setBenefitPlanId}
        onYearChange={setYear}
        onProvinceClick={handleProvinceClick}
        onRefresh={refetch}
      />
    </div>
  );
}

export default ProvincesPage;
