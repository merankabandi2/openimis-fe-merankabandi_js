import React, { useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import _debounce from 'lodash/debounce';
import {
  IconButton, Tooltip, Chip, Grid, FormControl, InputLabel, Select, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  TextInput,
  ControlledField,
  PublishedComponent,
} from '@openimis/fe-core';
import { fetchTicketSummaries } from '../../grievance-actions';
import MultiCategoryPicker from './MultiCategoryPicker';
import MultiChannelPicker from '../../pickers/MultiChannelPicker';

const MODULE_NAME = 'merankabandi';
const GRIEVANCE_MODULE = 'grievanceSocialProtection';
const DEBOUNCE_TIME = 500;

const STATUS_COLORS = {
  OPEN: 'primary',
  IN_PROGRESS: 'primary',
  RESOLVED: 'default',
  CLOSED: 'default',
};

const useFilterStyles = makeStyles((theme) => ({
  form: { padding: '0 0 10px 0', width: '100%' },
  item: { padding: theme.spacing(1) },
}));

function TicketFilter({ filters, onChangeFilters }) {
  const classes = useFilterStyles();
  const modulesManager = useModulesManager();
  const { formatMessage: fm } = useTranslations(MODULE_NAME, modulesManager);
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEBOUNCE_TIME);
  const filterTextValue = (name) => filters?.[name]?.value ?? '';

  return (
    <Grid container className={classes.form}>
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.code"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="ticket.filter.code"
              value={filterTextValue('code')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'code', value: v, filter: v ? `code_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.title"
        field={(
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="ticket.filter.title"
              value={filterTextValue('title')}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'title', value: v, filter: v ? `title_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.status"
        field={(
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="grievanceSocialProtection.TicketStatusPicker"
              withNull
              nullLabel=" "
              value={filters?.status?.value ?? null}
              onChange={(v) => onChangeFilters([
                { id: 'status', value: v, filter: v ? `status: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.priority"
        field={(
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="grievanceSocialProtection.TicketPriorityPicker"
              withNull
              nullLabel=" "
              value={filters?.priority?.value ?? null}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'priority', value: v, filter: v ? `priority_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.category"
        field={(
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="grievanceSocialProtection.CategoryPicker"
              value={filters?.category?.value ?? ''}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'category', value: v, filter: v ? `category_Icontains: "${v}"` : null },
              ])}
              label={fm('TicketFilter.category')}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.channel"
        field={(
          <Grid item xs={3} className={classes.item}>
            <MultiChannelPicker
              value={filters?.channel?.value ?? null}
              onChange={(v) => debouncedOnChangeFilters([
                { id: 'channel', value: v, filter: v ? `channel_Icontains: "${v}"` : null },
              ])}
            />
          </Grid>
        )}
      />
      <ControlledField
        module={MODULE_NAME}
        id="TicketFilter.flags"
        field={(
          <Grid item xs={3} className={classes.item}>
            <FormControl fullWidth>
              <InputLabel>{fm('ticket.filter.flags')}</InputLabel>
              <Select
                value={filters?.flags?.value ?? ''}
                onChange={(e) => onChangeFilters([
                  {
                    id: 'flags',
                    value: e.target.value,
                    filter: e.target.value ? `flags_Icontains: "${e.target.value}"` : null,
                  },
                ])}
              >
                <MenuItem value="">{fm('ticket.filter.all')}</MenuItem>
                <MenuItem value="SENSITIVE">SENSITIVE</MenuItem>
                <MenuItem value="SPECIAL">SPECIAL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      />
    </Grid>
  );
}

function TicketSearcherCustom({
  fetchTicketSummaries: doFetch,
  tickets,
  ticketsPageInfo,
  fetchingTickets,
  onDoubleClick,
  cacheFiltersKey,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage: fm, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const fetch = useCallback((params) => {
    doFetch(modulesManager, params);
  }, []);

  const ticketFilter = ({ filters, onChangeFilters }) => (
    <TicketFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const headers = () => [
    'ticket.header.code',
    'ticket.header.title',
    'ticket.header.reporter',
    'ticket.header.priority',
    'ticket.header.status',
    'ticket.header.category',
    '',
  ];

  const sorts = () => [
    ['code', true],
    ['title', true],
    null,
    ['priority', true],
    ['status', true],
    ['category', true],
  ];

  const itemFormatters = () => [
    (ticket) => ticket.code,
    (ticket) => ticket.title,
    (ticket) => ticket.reporterTypeName || '-',
    (ticket) => ticket.priority || '-',
    (ticket) => (
      <Chip
        label={ticket.status}
        color={STATUS_COLORS[ticket.status] || 'default'}
        size="small"
      />
    ),
    (ticket) => {
      if (!ticket.category) return '-';
      return ticket.category.split(' > ')
        .map((p) => { const t = fm(`grievance.category.${p}`); return t !== `grievance.category.${p}` ? t : p.replace(/_/g, ' '); })
        .join(' > ');
    },
    (ticket) => (
      <Tooltip title={fm('ticket.action.view')}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (onDoubleClick) {
              onDoubleClick(ticket);
            } else {
              history.push(`/grievance/detail/${ticket.id}`);
            }
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  return (
    <Searcher
      module={GRIEVANCE_MODULE}
      cacheFiltersKey={cacheFiltersKey}
      FilterPane={ticketFilter}
      fetch={fetch}
      items={tickets}
      itemsPageInfo={ticketsPageInfo}
      fetchingItems={fetchingTickets}
      tableTitle={formatMessageWithValues('ticket.searcher.results', { totalCount: ticketsPageInfo?.totalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={(t) => t.id}
      onDoubleClick={onDoubleClick}
      rowsPerPageOptions={[10, 20, 50]}
      defaultPageSize={10}
    />
  );
}

const mapStateToProps = (state) => ({
  tickets: state.grievanceSocialProtection?.tickets ?? [],
  ticketsPageInfo: state.grievanceSocialProtection?.ticketsPageInfo ?? {},
  fetchingTickets: state.grievanceSocialProtection?.fetchingTickets ?? false,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicketSummaries,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TicketSearcherCustom);
