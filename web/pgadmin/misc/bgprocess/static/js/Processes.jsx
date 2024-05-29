/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2024, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import React, { useCallback, useEffect, useMemo } from 'react';
import PgTable from 'sources/components/PgTable';
import gettext from 'sources/gettext';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { BgProcessManagerEvents, BgProcessManagerProcessState } from './BgProcessConstants';
import { PgButtonGroup, PgIconButton } from '../../../../static/js/components/Buttons';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/HelpRounded';
import url_for from 'sources/url_for';
import { Box } from '@mui/material';
import { usePgAdmin } from '../../../../static/js/BrowserComponent';
import { BROWSER_PANELS } from '../../../../browser/static/js/constants';
import ErrorBoundary from '../../../../static/js/helpers/ErrorBoundary';
import ProcessDetails from './ProcessDetails';


const useStyles = makeStyles((theme) => ({
  stopButton: {
    color: theme.palette.error.main
  },
  buttonClick: {
    backgroundColor: theme.palette.grey[400]
  },
  emptyPanel: {
    minHeight: '100%',
    minWidth: '100%',
    background: theme.otherVars.emptySpaceBg,
    overflow: 'auto',
    padding: '8px',
    display: 'flex',
  },
  panelIcon: {
    width: '80%',
    margin: '0 auto',
    marginTop: '25px !important',
    position: 'relative',
    textAlign: 'center',
  },
  panelMessage: {
    marginLeft: '0.5rem',
    fontSize: '0.875rem',
  },
  autoResizer: {
    height: '100% !important',
    width: '100% !important',
    background: theme.palette.grey[400],
    padding: '7.5px',
    overflow: 'auto !important',
    minHeight: '100%',
    minWidth: '100%',
  },
  noPadding: {
    padding: 0,
  },
  bgSucess: {
    backgroundColor: theme.palette.success.light,
    height: '100%',
    padding: '4px',
  },
  bgFailed: {
    backgroundColor: theme.palette.error.light,
    height: '100%',
    padding: '4px',
  },
  bgTerm: {
    backgroundColor: theme.palette.warning.light,
    height: '100%',
    padding: '4px',
  },
  bgRunning: {
    backgroundColor: theme.palette.primary.light,
    height: '100%',
    padding: '4px',
  },
}));


const ProcessStateTextAndColor = {
  [BgProcessManagerProcessState.PROCESS_NOT_STARTED]: [gettext('Not started'), 'bgRunning'],
  [BgProcessManagerProcessState.PROCESS_STARTED]: [gettext('Running'), 'bgRunning'],
  [BgProcessManagerProcessState.PROCESS_FINISHED]: [gettext('Finished'), 'bgSucess'],
  [BgProcessManagerProcessState.PROCESS_TERMINATED]: [gettext('Terminated'), 'bgTerm'],
  [BgProcessManagerProcessState.PROCESS_TERMINATING]: [gettext('Terminating...'), 'bgTerm'],
  [BgProcessManagerProcessState.PROCESS_FAILED]: [gettext('Failed'), 'bgFailed'],
};
export default function Processes() {
  const classes = useStyles();
  const pgAdmin = usePgAdmin();
  const [tableData, setTableData] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState([]);

  const onViewDetailsClick = useCallback((p)=>{
    const panelTitle = gettext('Process Watcher - %s', p.type_desc);
    const panelId = BROWSER_PANELS.PROCESS_DETAILS+''+p.id;
    pgAdmin.Browser.docker.openDialog({
      id: panelId,
      title: panelTitle,
      content: (
        <ErrorBoundary>
          <ProcessDetails
            data={p}
          />
        </ErrorBoundary>
      )
    }, pgAdmin.Browser.stdW.md, pgAdmin.Browser.stdH.md);
  }, []);


  const columns = useMemo(()=>{
    const cellPropTypes = {
      row: PropTypes.any,
    };

    const CancelCell = ({ row }) => {
      return (
        <PgIconButton
          size="xs"
          noBorder
          icon={<CancelIcon />}
          className={classes.stopButton}
          disabled={row.original.process_state != BgProcessManagerProcessState.PROCESS_STARTED
            || row.original.server_id != null}
          onClick={(e) => {
            e.preventDefault();
            pgAdmin.Browser.BgProcessManager.stopProcess(row.original.id);
          }}
          aria-label="Stop Process"
          title={gettext('Stop Process')}
        ></PgIconButton>
      );
    };
    CancelCell.displayName = 'CancelCell';
    CancelCell.propTypes = cellPropTypes;

    const LogsCell = ({ row }) => {
      return (
        <PgIconButton
          size="xs"
          icon={<DescriptionOutlinedIcon />}
          noBorder
          onClick={(e) => {
            e.preventDefault();
            onViewDetailsClick(row.original);
          }}
          aria-label="View details"
          title={gettext('View details')}
        />
      );
    };
    LogsCell.displayName = 'LogsCell';
    LogsCell.propTypes = cellPropTypes;

    const StatusCell = ({row})=>{
      const [text, bgcolor] = ProcessStateTextAndColor[row.original.process_state];
      return <Box className={classes[bgcolor]}>{text}</Box>;
    };
    StatusCell.displayName = 'StatusCell';
    StatusCell.propTypes = cellPropTypes;

    return [{
      accessor: 'stop_process',
      Header: () => null,
      sortable: false,
      resizable: false,
      disableGlobalFilter: true,
      width: 35,
      maxWidth: 35,
      minWidth: 35,
      id: 'btn-stop',
      Cell: CancelCell,
    },
    {
      accessor: 'view_details',
      Header: () => null,
      sortable: false,
      resizable: false,
      disableGlobalFilter: true,
      width: 35,
      maxWidth: 35,
      minWidth: 35,
      id: 'btn-logs',
      Cell: LogsCell,
    },
    {
      Header: gettext('PID'),
      accessor: 'utility_pid',
      sortable: true,
      resizable: false,
      width: 70,
      minWidth: 70,
      disableGlobalFilter: false,
    },
    {
      Header: gettext('Type'),
      accessor: (row)=>row.details?.type,
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 70,
      disableGlobalFilter: false,
    },
    {
      Header: gettext('Server'),
      accessor: (row)=>row.details?.server,
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 120,
      disableGlobalFilter: false,
    },
    {
      Header: gettext('Object'),
      accessor: (row)=>row.details?.object,
      sortable: true,
      resizable: true,
      width: 200,
      minWidth: 120,
      disableGlobalFilter: false,
    },
    {
      id: 'stime',
      Header: gettext('Start Time'),
      sortable: true,
      resizable: true,
      disableGlobalFilter: true,
      width: 150,
      minWidth: 150,
      accessor: (row)=>(new Date(row.stime)),
      Cell: ({row})=>(new Date(row.original.stime).toLocaleString()),
    },
    {
      Header: gettext('Status'),
      sortable: true,
      resizable: false,
      disableGlobalFilter: false,
      width: 120,
      minWidth: 120,
      accessor: (row)=>ProcessStateTextAndColor[row.process_state][0],
      dataClassName: classes.noPadding,
      Cell: StatusCell,
    },
    {
      Header: gettext('Time Taken (sec)'),
      accessor: 'execution_time',
      sortable: true,
      resizable: true,
      disableGlobalFilter: true,
    }];
  }, []);

  const updateList = ()=>{
    if(pgAdmin.Browser.BgProcessManager.procList) {
      setTableData([...pgAdmin.Browser.BgProcessManager.procList]);
    }
  };

  useEffect(() => {
    updateList();
    pgAdmin.Browser.BgProcessManager.registerListener(BgProcessManagerEvents.LIST_UPDATED, updateList);
    return ()=>{
      pgAdmin.Browser.BgProcessManager.deregisterListener(BgProcessManagerEvents.LIST_UPDATED, updateList);
    };
  }, []);

  return (
    <PgTable
      data-test="processes"
      className={classes.autoResizer}
      columns={columns}
      data={tableData}
      sortOptions={[{id: 'stime', desc: true}]}
      getSelectedRows={(rows)=>{setSelectedRows(rows);}}
      isSelectRow={true}
      tableProps={{
        autoResetSelectedRows: false,
        getRowId: (row)=>{
          return row.id;
        }
      }}
      CustomHeader={()=>{
        return (
          <Box>
            <PgButtonGroup>
              <PgIconButton
                icon={<DeleteIcon style={{height: '1.4rem'}}/>}
                aria-label="Acknowledge and Remove"
                title={gettext('Acknowledge and Remove')}
                onClick={() => {
                  pgAdmin.Browser.notifier.confirm(gettext('Remove Processes'), gettext('Are you sure you want to remove the selected processes?'), ()=>{
                    pgAdmin.Browser.BgProcessManager.acknowledge(selectedRows.map((p)=>p.original.id));
                  });
                }}
                disabled={selectedRows.length <= 0}
              ></PgIconButton>
              <PgIconButton
                icon={<HelpIcon style={{height: '1.4rem'}}/>}
                aria-label="Help"
                title={gettext('Help')}
                onClick={() => {
                  window.open(url_for('help.static', {'filename': 'processes.html'}));
                }}
              ></PgIconButton>
            </PgButtonGroup>
          </Box>
        );
      }}
    ></PgTable>
  );
}
