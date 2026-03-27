import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import { withModulesManager, ControlledField, PublishedComponent } from '@openimis/fe-core';

const DEFAULT_LOCATION_TYPES = ['R', 'D', 'W', 'V'];

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

/**
 * Burundi 3-level location filter: Province (D) -> Commune (W) -> Colline (V).
 * Replaces the upstream DetailedLocationFilter which shows all 4 levels
 * (Region/Pays -> District/Province -> Ward/Commune -> Village/Colline).
 *
 * This component skips the Region/Country level and starts from Province (level 1).
 * With locationTypes = ["R","D","W","V"] (4 items), the pickers start at:
 *   i=0 -> level 1 (Province)
 *   i=1 -> level 2 (Commune)
 *   i=2 -> level 3 (Colline)
 */
class BurundiLocationFilter extends Component {
  state = {
    reset: 0,
  };

  constructor(props) {
    super(props);
    this.locationTypes = props.modulesManager.getConf(
      'fe-location',
      'Location.types',
      DEFAULT_LOCATION_TYPES,
    );
  }

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _parentFilter = (v, l) => {
    if (v) {
      return {
        id: this.props.anchor,
        value: v,
        filter: `${this.props.anchor}: "${v.uuid}", ${this.props.anchor}Level: ${l}`,
      };
    }
    return { id: this.props.anchor, value: null, filter: null };
  };

  _levelFilter = (l, v) => {
    if (v) {
      return {
        id: `${this.props.anchor}_${l}`,
        value: v,
        filter: null,
      };
    }
    return { id: `${this.props.anchor}_${l}`, value: null, filter: null };
  };

  onChange = (l, v) => {
    const parentFilterValue = this._filterValue(`${this.props.anchor}_${l - 1}`);
    const filters = [v ? this._parentFilter(v, l) : this._parentFilter(parentFilterValue, l - 1)];
    let value = v ? v.parent : null;
    for (let i = l - 1; i >= 0; i--) {
      filters.push(
        this._levelFilter(i, value || this._filterValue(`${this.props.anchor}_${i}`)),
      );
      value = value ? value.parent : null;
    }
    filters.push(this._levelFilter(l, v));
    for (let i = this.locationTypes.length; i > l; i--) {
      filters.push(this._levelFilter(i, null));
    }
    this.props.onChangeFilters(filters);
    this.setState((state) => ({ reset: state.reset + 1 }));
    this.props.dispatch({
      type: 'LOCATION_FILTER_SELECTED',
      payload: { location: v, level: l, maxLevels: this.locationTypes.length },
    });
  };

  render() {
    const { classes, split = false } = this.props;
    const grid = split ? 12 : 6;
    const numTypes = this.locationTypes.length;
    // Show all location types as flat pickers (no CoarseFilter region/district split).
    // With ["D","W","V"] (3 types): 3 pickers at levels 0,1,2 (Province, Commune, Colline)
    // With ["R","D","W","V"] (4 types): 3 pickers at levels 1,2,3 (Province, Commune, Colline)
    const maxLevels = parseInt(
      this.props.modulesManager.getRef('location.Location.MaxLevels') || numTypes,
      10,
    );
    const startLevel = numTypes - maxLevels;
    const numPickers = maxLevels;
    return (
      <Grid container className={classes.form}>
        {_.times(numPickers, (i) => {
          const level = startLevel + i;
          return (
            <ControlledField
              module="location"
              id={`LocationFilter.location_${level}`}
              key={`location_${level}`}
              field={
                <Grid item xs={Math.floor(grid / numPickers)} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={this._filterValue(`${this.props.anchor}_${level}`)}
                    withNull
                    reset={this.state.reset}
                    onChange={(v, s) => this.onChange(level, v, s)}
                    parentLocation={this._filterValue(`${this.props.anchor}_${level - 1}`)}
                    locationLevel={level}
                  />
                </Grid>
              }
            />
          );
        })}
      </Grid>
    );
  }
}

const mapStateToProps = () => ({});

export default withModulesManager(
  connect(mapStateToProps)(withTheme(withStyles(styles)(BurundiLocationFilter))),
);
