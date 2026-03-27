import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, TablePagination, CircularProgress,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage } from '@openimis/fe-core';
import { MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../../constants';

function WizardBeneficiaryList({ intl, benefitPlanId, selectedLocation, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchBeneficiaries = useCallback((currentPage, currentPageSize) => {
    setLoading(true);
    const first = currentPageSize;
    const offset = currentPage * currentPageSize;
    const filters = [
      `benefitPlan_Id: "${benefitPlanId}"`,
      `first: ${first}`,
      `offset: ${offset}`,
      `orderBy: ["-json_ext__pmt_score"]`,
    ];
    if (selectedLocation?.uuid && selectedLocation?.type) {
      const levelMap = { D: 0, W: 1, V: 2 };
      const level = levelMap[selectedLocation.type];
      if (level !== undefined) {
        filters.push(`parentLocation: "${selectedLocation.uuid}"`);
        filters.push(`parentLocationLevel: ${level}`);
      }
    }
    const query = `{
      groupBeneficiary(${filters.join(', ')}) {
        edges{node{id group{id head{firstName lastName dob} jsonExt}jsonExt status}}
        totalCount
      }
    }`;
    dispatch(graphql(query, 'MERANKABANDI_WIZARD_BENEFICIARIES'))
      .then((result) => {
        const data = result?.payload?.data?.groupBeneficiary;
        if (data) {
          setBeneficiaries((data.edges || []).map((e) => e.node));
          setTotalCount(data.totalCount || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [benefitPlanId, selectedLocation?.uuid, selectedLocation?.type, dispatch]);

  useEffect(() => {
    if (benefitPlanId) fetchBeneficiaries(page, pageSize);
  }, [benefitPlanId, selectedLocation?.uuid, selectedLocation?.type, page, pageSize]);

  const handleExportCsv = () => {
    const headers = ['ID', 'Nom', 'Prenom', 'DateNaissance', 'ScorePMT', 'Statut'];
    const rows = beneficiaries.map((b) => [
      b.id,
      b.group?.head?.lastName || '',
      b.group?.head?.firstName || '',
      b.group?.head?.dob || '',
      b.jsonExt?.pmt_score ?? '',
      b.status || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pmt_ranking_${benefitPlanId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          {formatMessage(intl, MODULE_NAME, 'wizard.pmt.totalBeneficiaries')}: {totalCount}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<GetAppIcon />}
          onClick={handleExportCsv}
          disabled={beneficiaries.length === 0}
        >
          {formatMessage(intl, MODULE_NAME, 'wizard.action.exportCsv')}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.lastName')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.firstName')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.dob')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.pmtScore')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beneficiaries.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.group?.head?.lastName}</TableCell>
                <TableCell>{b.group?.head?.firstName}</TableCell>
                <TableCell>{b.group?.head?.dob}</TableCell>
                <TableCell align="right">{b.jsonExt?.pmt_score ?? '-'}</TableCell>
                <TableCell>{b.status}</TableCell>
              </TableRow>
            ))}
            {beneficiaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {formatMessage(intl, MODULE_NAME, 'wizard.pmt.noBeneficiaries')}
                </TableCell>
              </TableRow>
            )}
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

export default injectIntl(WizardBeneficiaryList);
