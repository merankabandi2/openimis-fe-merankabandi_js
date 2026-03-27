import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TablePagination, CircularProgress, Chip,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../../constants';

function WizardPreCollectePanel({ intl, benefitPlanId, selectedLocation, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchRecords = useCallback((currentPage, currentPageSize) => {
    setLoading(true);
    const first = currentPageSize;
    const offset = currentPage * currentPageSize;
    const filters = [
      `benefitPlan_Id: "${benefitPlanId}"`,
      `first: ${first}`,
      `offset: ${offset}`,
      'orderBy: ["-id"]',
    ];
    if (selectedLocation?.uuid && selectedLocation?.type) {
      const levelMap = { D: 0, W: 1, V: 2 };
      const level = levelMap[selectedLocation.type];
      if (level !== undefined) {
        filters.push(`location_Parent_Id: "${selectedLocation.uuid}"`);
      }
    }
    const query = `{
      preCollecte(${filters.join(', ')}) {
        edges { node { id socialId nom prenom sexe telephone status location { name } } }
        totalCount
      }
    }`;
    dispatch(graphql(query, 'MERANKABANDI_WIZARD_PRECOLLECTE'))
      .then((result) => {
        const data = result?.payload?.data?.preCollecte;
        if (data) {
          setRecords((data.edges || []).map((e) => e.node));
          setTotalCount(data.totalCount || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [benefitPlanId, selectedLocation, dispatch]);

  useEffect(() => {
    if (benefitPlanId) fetchRecords(page, pageSize);
  }, [benefitPlanId, page, pageSize, fetchRecords]);

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {totalCount} {formatMessage(intl, MODULE_NAME, 'wizard.precollecte.count')}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.socialId')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.lastName')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.firstName')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.sex')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.phone')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.colline')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell><strong>{r.socialId}</strong></TableCell>
                <TableCell>{r.nom}</TableCell>
                <TableCell>{r.prenom}</TableCell>
                <TableCell>{r.sexe}</TableCell>
                <TableCell>{r.telephone}</TableCell>
                <TableCell>{r.location?.name}</TableCell>
                <TableCell><Chip label={r.status} size="small" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
}

export default injectIntl(WizardPreCollectePanel);
