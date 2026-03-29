import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import { CircularProgress, Typography } from '@material-ui/core';

const REQUESTED_WITH = 'webapp';

function ActivitiesBarChart({ filters = {}, compact = false }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildFilters = () => {
    const filterParts = [];
    if (filters.collines && filters.collines.length > 0) {
      filterParts.push(`location_Id: ${parseInt(decodeId(filters.collines[0]))}`);
    } else if (filters.communes && filters.communes.length > 0) {
      filterParts.push(`location_Parent_Id: ${parseInt(decodeId(filters.communes[0]))}`);
    } else if (filters.provinces && filters.provinces.length > 0) {
      filterParts.push(`location_Parent_Parent_Id: ${parseInt(decodeId(filters.provinces[0]))}`);
    }
    if (filters.year) {
      filterParts.push(`sensitizationDate_Year: ${filters.year}`);
    }
    return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
  };

  const loadActivitiesData = async () => {
    setIsLoading(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const baseHeaders = apiHeaders();
      const filterString = buildFilters();

      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          query: `
            {
              sensitizationTraining${filterString} {
                totalCount
              }
              behaviorChangePromotion${filterString} {
                totalCount
              }
              microProject${filterString} {
                totalCount
              }
            }
          `,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch activities data');

      const { data } = await response.json();
      setChartData([
        { type: 'Sensibilisations', count: data.sensitizationTraining.totalCount || 0 },
        { type: 'Changement de comportement', count: data.behaviorChangePromotion.totalCount || 0 },
        { type: 'Micro projets', count: data.microProject.totalCount || 0 },
      ]);
    } catch (error) {
      console.error('Error loading activities data:', error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivitiesData();
  }, [filters]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: compact ? '240px' : '300px',
      }}>
        <CircularProgress />
      </div>
    );
  }

  if (!chartData.length || chartData.every((d) => d.count === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <Typography variant="body2" color="textSecondary">
          Aucune donnée disponible
        </Typography>
      </div>
    );
  }

  const colors = ['#5a8dee', '#ff8f00', '#00d0bd'];

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        borderRadius: 6,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString('fr-FR'),
      style: {
        fontSize: '13px',
        fontWeight: 600,
        colors: ['#333'],
      },
      offsetX: 8,
    },
    colors,
    xaxis: {
      categories: chartData.map((item) => item.type),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString('fr-FR'),
      },
    },
  };

  const series = [{
    name: 'Activités',
    data: chartData.map((item) => item.count),
  }];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={compact ? 200 : 250}
    />
  );
}

export default ActivitiesBarChart;
