import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: 500,
  },
  headerCell: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  clickableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  chipActive: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  chipSuspended: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  chipPotential: {
    backgroundColor: '#2196f3',
    color: '#fff',
  },
  chipDefault: {
    backgroundColor: '#9e9e9e',
    color: '#fff',
  },
}));

function getStatusChipClass(status, classes) {
  if (!status) return classes.chipDefault;
  const upper = status.toUpperCase();
  if (upper === 'ACTIF' || upper === 'ACTIVE') return classes.chipActive;
  if (upper === 'SUSPENDED') return classes.chipSuspended;
  if (upper === 'POTENTIAL') return classes.chipPotential;
  return classes.chipDefault;
}

function HouseholdSummaryTable({ households, onHouseholdClick }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const formatCurrency = (value) => {
    if (value == null) return '-';
    return `${Number(value).toLocaleString('fr-FR')} BIF`;
  };

  const formatPmtScore = (value) => {
    if (value == null) return '-';
    return Number(value).toFixed(1);
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('fr-FR');
  };

  const columns = [
    { id: 'headOfHouseholdName', labelKey: 'geography.detail.households.headName', align: 'left' },
    { id: 'socialId', labelKey: 'geography.detail.households.socialId', align: 'left' },
    { id: 'status', labelKey: 'geography.detail.households.status', align: 'center' },
    { id: 'pmtScore', labelKey: 'geography.detail.households.pmtScore', align: 'right' },
    { id: 'memberCount', labelKey: 'geography.detail.households.members', align: 'right' },
    { id: 'lastPaymentDate', labelKey: 'geography.detail.households.lastPayment', align: 'right' },
    { id: 'lastPaymentAmount', labelKey: 'geography.detail.households.amount', align: 'right' },
  ];

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                className={classes.headerCell}
              >
                {formatMessage(col.labelKey)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(!households || households.length === 0) ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography color="textSecondary">
                  {formatMessage('geography.noData')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            households.map((hh) => (
              <TableRow
                key={hh.groupUuid || hh.socialId}
                className={classes.clickableRow}
                onClick={() => onHouseholdClick && onHouseholdClick(hh.groupUuid)}
              >
                <TableCell>{hh.headOfHouseholdName || '-'}</TableCell>
                <TableCell>{hh.socialId || '-'}</TableCell>
                <TableCell align="center">
                  {hh.status ? (
                    <Chip
                      label={hh.status}
                      size="small"
                      className={getStatusChipClass(hh.status, classes)}
                    />
                  ) : '-'}
                </TableCell>
                <TableCell align="right">{formatPmtScore(hh.pmtScore)}</TableCell>
                <TableCell align="right">{hh.memberCount != null ? hh.memberCount : '-'}</TableCell>
                <TableCell align="right">{formatDate(hh.lastPaymentDate)}</TableCell>
                <TableCell align="right">{formatCurrency(hh.lastPaymentAmount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default HouseholdSummaryTable;
