/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2024, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import React, { forwardRef, useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { styled } from '@mui/styles';
import PropTypes from 'prop-types';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PgIconButton } from './Buttons';
import clsx from 'clsx';
import CustomPropTypes from '../custom_prop_types';
import { InputSwitch } from './FormComponents';


const StyledDiv = styled('div')(({theme})=>({
  '&.pgrt': {
    display: 'grid',
    overflow: 'auto',
    position: 'relative',
    flexGrow: 1,
  },

  // by default the table has no outer border.
  // the parent container has to take care of border.
  '& .pgrt-table': {
    borderSpacing: 0,
    borderRadius: theme.shape.borderRadius,
    display: 'grid',
    gridAutoRows: 'max-content',
    flexGrow: 1,
    flexDirection: 'column',

    '& .pgrt-header': {
      position: 'sticky',
      top: 0,
      zIndex: 1,

      '& .pgrt-header-row': {
        height: '34px',
        display: 'flex',

        '& .pgrt-header-cell': {
          position: 'relative',
          fontWeight: theme.typography.fontWeightBold,
          padding: theme.spacing(0.5),
          textAlign: 'left',
          alignContent: 'center',
          backgroundColor: theme.otherVars.tableBg,
          overflow: 'hidden',
          ...theme.mixins.panelBorder.bottom,
          ...theme.mixins.panelBorder.right,

          '& > div': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textWrap: 'nowrap'
          },

          '& .pgrt-header-resizer': {
            display: 'inline-block',
            width: '5px',
            height: '100%',
            position: 'absolute',
            right: 0,
            top: 0,
            transform: 'translateX(50%)',
            zIndex: 1,
            cursor: 'col-resize',
          }
        }
      }
    },

    '& .pgrt-body': {
      position: 'relative',
      flexGrow: 1,
      minHeight: 0,

      '& .pgrt-row': {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        width: '100%',

        '& .pgrt-row-content': {
          display: 'flex',
          minHeight: 0,

          '& .pgrd-row-cell': {
            margin: 0,
            padding: theme.spacing(0.25, 0.5),
            ...theme.mixins.panelBorder.bottom,
            ...theme.mixins.panelBorder.right,
            position: 'relative',
            height: '30px',
            display: 'flex',
            alignItems: 'flex-start',
            backgroundColor: theme.otherVars.tableBg,

            '&.btn-cell': {
              textAlign: 'center',
            },
            '&.expanded-icon-cell': {
              backgroundColor: theme.palette.grey[400],
              borderBottom: 'none',
            },
            '&.row-warning': {
              backgroundColor: theme.palette.warning.main + '!important'
            },
            '&.row-alert': {
              backgroundColor: theme.palette.error.main + '!important'
            },
            '&.cell-with-icon': {
              paddingLeft: '1.8em',
              borderRadius: 0,
              backgroundPosition: '1%',
            },

            '& .pgrd-row-cell-content': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              userSelect: 'text',
              width: '100%',
            }
          }
        },

        '& .pgrt-expanded-content': {
          ...theme.mixins.panelBorder.all,
          margin: '8px',
          flexGrow: 1,
        }
      }
    }
  }
}));

export const PgReactTableCell = forwardRef(({row, cell, children, className}, ref)=>{
  let classNames = ['pgrd-row-cell'];
  if (typeof (cell.column.id) == 'string' && cell.column.id.startsWith('btn-')) {
    classNames.push('btn-cell');
  }
  if (cell.column.id == 'btn-edit' && row.getIsExpanded()) {
    classNames.push('expanded-icon-cell');
  }
  if (row.original.row_type === 'warning') {
    classNames.push('row-warning');
  }
  if (row.original.row_type === 'alert') {
    classNames.push('row-alert');
  }
  if(row.original.icon && row.original.icon[cell.column.id]) {
    classNames.push(row.original.icon[cell.column.id], 'cell-with-icon');
  }

  classNames.push(className);

  return (
    <div ref={ref} key={cell.id} style={{
      flex: `var(--col-${cell.column.id.replace(/\W/g, '_')}-size) 0 auto`,
      width: `calc(var(--col-${cell.column.id.replace(/\W/g, '_')}-size)*1px)`,
      ...(cell.column.columnDef.maxSize ? { maxWidth: `${cell.column.columnDef.maxSize}px` } : {})
    }} role='cell'
    className={clsx(...classNames)}
    title={String(cell.getValue() ?? '')}>
      <div className='pgrd-row-cell-content'>{children}</div>
    </div>
  );
});

PgReactTableCell.displayName = 'PgReactTableCell';
PgReactTableCell.propTypes = {
  row: PropTypes.object,
  cell: PropTypes.object,
  children: CustomPropTypes.children,
  className: PropTypes.any,
};

export const PgReactTableRow = forwardRef(({ children, className, ...props }, ref)=>{
  return (
    <div className={clsx('pgrt-row', className)} ref={ref} role="row" {...props}>
      {children}
    </div>
  );
});
PgReactTableRow.displayName = 'PgReactTableRow';
PgReactTableRow.propTypes = {
  children: CustomPropTypes.children,
  className: PropTypes.any,
};

export const PgReactTableRowContent = forwardRef(({children, className, ...props}, ref)=>{
  return (
    <div className={clsx('pgrt-row-content', className)} ref={ref} {...props}>
      {children}
    </div>
  );
});
PgReactTableRowContent.displayName = 'PgReactTableRowContent';
PgReactTableRowContent.propTypes = {
  children: CustomPropTypes.children,
  className: PropTypes.any,
};


export function PgReactTableRowExpandContent({row, children}) {
  if(!row.getIsExpanded()) {
    return <></>;
  }
  return (
    <div className='pgrt-expanded-content' style={{ maxWidth: 'calc(var(--expand-width)*1px)' }}>
      {children}
    </div>
  );
}
PgReactTableRowExpandContent.propTypes = {
  row: PropTypes.object,
  children: CustomPropTypes.children,
};

export function PgReactTableHeader({table}) {
  return (
    <div className='pgrt-header'>
      {table.getHeaderGroups().map((headerGroup, idx) => (
        <div key={idx} className='pgrt-header-row' style={{  }}>
          {headerGroup.headers.map((header) => (
            <div
              key={header.id}
              className='pgrt-header-cell'
              style={{
                flex: `var(--header-${header?.id.replace(/\W/g, '_')}-size) 0 auto`,
                width: `calc(var(--header-${header?.id.replace(/\W/g, '_')}-size)*1px)`,
                ...(header.column.columnDef.maxSize ? { maxWidth: `${header.column.columnDef.maxSize}px` } : {}),
                cursor: header.column.getCanSort() ? 'pointer' : 'initial',
              }}
              onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
            >
              <div title={flexRender(header.column.columnDef.header, header.getContext())}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanSort() && header.column.getIsSorted() &&
                  <span>
                    {header.column.getIsSorted() == 'desc' ?
                      <KeyboardArrowDownIcon style={{ fontSize: '1.2rem' }} />
                      : <KeyboardArrowUpIcon style={{ fontSize: '1.2rem' }} />}
                  </span>}
              </div>
              {header.column.getCanResize() && (
                <div
                  onDoubleClick={() => header.column.resetSize()}
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className='pgrt-header-resizer'
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
PgReactTableHeader.propTypes = {
  table: PropTypes.object,
};

export function PgReactTableBody({children, style}) {
  return (
    <div className='pgrt-body' style={style}>
      {children}
    </div>
  );
}
PgReactTableBody.propTypes = {
  style: PropTypes.object,
  children: CustomPropTypes.children,
};

export const PgReactTable = forwardRef(({children, table, rootClassName, tableClassName, ...props}, ref)=>{
  const columns = table.getAllColumns();

  useEffect(()=>{
    const setMaxExpandWidth = ()=>{
      if(ref.current) {
        ref.current.style['--expand-width'] = (ref.current.getBoundingClientRect().width ?? 430) - 30; //margin,scrollbar,etc.
      }
    };
    const tableResizeObserver = new ResizeObserver(()=>{
      setMaxExpandWidth();
    });
    tableResizeObserver.observe(ref.current);
  }, []);

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      colSizes[`--header-${header.id.replace(/\W/g, '_')}-size`] = header.getSize();
      colSizes[`--col-${header.column.id.replace(/\W/g, '_')}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [columns, table.getState().columnSizingInfo]);

  return (
    <StyledDiv className={clsx('pgrt', rootClassName)} ref={ref} >
      <div className={clsx('pgrt-table', tableClassName)} style={{ ...columnSizeVars }} {...props}>
        {children}
      </div>
    </StyledDiv>
  );
});
PgReactTable.displayName = 'PgReactTable';
PgReactTable.propTypes = {
  table: PropTypes.object,
  rootClassName: PropTypes.any,
  tableClassName: PropTypes.any,
  children: CustomPropTypes.children,
};

export function getExpandCell({ onClick, ...props }) {
  const Cell = ({ row }) => {
    const onClickFinal = (e) => {
      e.preventDefault();
      row.toggleExpanded();
      onClick?.(row, e);
    };
    return (
      <PgIconButton
        size="xs"
        icon={
          row.getIsExpanded() ? (
            <KeyboardArrowDownIcon />
          ) : (
            <ChevronRightIcon />
          )
        }
        noBorder
        {...props}
        onClick={onClickFinal}
        aria-label={props.title}
      />
    );
  };

  Cell.displayName = 'ExpandCell';
  Cell.propTypes = {
    title: PropTypes.string,
    row: PropTypes.any,
  };

  return Cell;
}

export function getSwitchCell() {
  const Cell = ({ getValue }) => {
    return <InputSwitch value={getValue()} readonly />;
  };

  Cell.displayName = 'SwitchCell';
  Cell.propTypes = {
    getValue: PropTypes.func,
  };

  return Cell;
}
