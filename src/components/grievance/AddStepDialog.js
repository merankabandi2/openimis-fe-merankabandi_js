import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, List, ListItem, ListItemText, ListSubheader,
  Typography, Chip, InputAdornment, CircularProgress,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';

function AddStepDialog({ open, onClose, onAdd, stepTemplates = [], loading = false }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (open) { setSearch(''); setSelected(null); }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return stepTemplates;
    const q = search.toLowerCase();
    return stepTemplates.filter(s =>
      s.label?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.workflowTemplateLabel?.toLowerCase().includes(q)
    );
  }, [stepTemplates, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const key = s.workflowTemplateLabel || s.workflowTemplateName || 'Autres';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filtered]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter une étape</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth size="small" variant="outlined"
          placeholder="Rechercher une étape..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          style={{ marginBottom: 12 }}
        />
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><CircularProgress size={32} /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 16 }}>Aucune étape trouvée</Typography>
        ) : (
          <List dense style={{ maxHeight: 400, overflow: 'auto' }}>
            {Object.entries(grouped).map(([templateName, steps]) => (
              <React.Fragment key={templateName}>
                <ListSubheader style={{ backgroundColor: '#f5f5f5', lineHeight: '32px', fontSize: '0.75rem' }}>{templateName}</ListSubheader>
                {steps.map(step => (
                  <ListItem key={step.id} button selected={selected?.id === step.id} onClick={() => setSelected(step)} style={{ paddingLeft: 24 }}>
                    <ListItemText primary={step.label} secondary={step.role}
                      primaryTypographyProps={{ style: { fontSize: '0.85rem' } }}
                      secondaryTypographyProps={{ style: { fontSize: '0.7rem' } }} />
                    {step.actionType && <Chip size="small" label={step.actionType} variant="outlined" style={{ fontSize: '0.65rem', height: 20, marginLeft: 8 }} />}
                  </ListItem>
                ))}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={() => selected && onAdd(selected)} color="primary" variant="contained" disabled={!selected}>Ajouter</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddStepDialog;
