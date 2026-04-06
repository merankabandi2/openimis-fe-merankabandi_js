import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 4,
      backgroundColor: props => props.color || '#00d0bd',
      borderRadius: '4px 4px 0 0',
    },
  },
  label: {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  vagueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  vagueLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    width: 48,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  progressWrapper: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  vagueCount: {
    fontSize: '0.65rem',
    fontWeight: 600,
    width: 32,
    textAlign: 'right',
    flexShrink: 0,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
}));

function getBarColor(completed, max) {
  const ratio = max > 0 ? completed / max : 0;
  if (ratio >= 0.83) return '#2e7d32';
  if (ratio >= 0.42) return '#1565c0';
  if (ratio > 0) return '#ff8f00';
  return '#bdbdbd';
}

function TransferProgressCard({ vagues = [], isLoading = false, color = '#00d0bd', className }) {
  const classes = useStyles({ color });

  return (
    <Card className={`${className || ''} ${classes.root}`}>
      <CardContent style={{ padding: '16px' }}>
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={40} style={{ color }} />
          </div>
        ) : (
          <Box>
            <Typography className={classes.label} color="textSecondary" variant="overline">
              Transferts
            </Typography>
            <Box mt={1}>
              {vagues.length === 0 ? (
                <Typography variant="caption" color="textSecondary">Aucune vague configurée</Typography>
              ) : (
                vagues.map((v) => {
                  const pct = v.maxRounds > 0 ? (v.completedRounds / v.maxRounds) * 100 : 0;
                  const barColor = getBarColor(v.completedRounds, v.maxRounds);
                  return (
                    <Box key={v.vagueNumber} className={classes.vagueRow}>
                      <Typography className={classes.vagueLabel}>Vague {v.vagueNumber}</Typography>
                      <Box className={classes.progressWrapper}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          style={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' }}
                        />
                      </Box>
                      <Typography className={classes.vagueCount} style={{ color: barColor }}>
                        {v.completedRounds}/{v.maxRounds}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TransferProgressCard;
