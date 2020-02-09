// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React from 'react';
import axios from 'axios';

import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ReplayIcon from '@material-ui/icons/Replay';
import { green } from '@material-ui/core/colors';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, dateFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';

const CaptionElement = () => (
    <h3
        style={{
            borderRadius: '0.25em',
            textAlign: 'center',
            color: 'purple',
            border: '1px solid purple',
            padding: '0.5em',
        }}
    >
        History
    </h3>
);

// export const axiosInstance = axios.create({
//     baseURL: 'https://iamsourabhh.com/',
//     timeout: 1000,
//     responseType: "json"
//   });

class MovementsTable extends React.Component {
    constructor(props) {
        super(props);

        var old_date_movement = '';
        var old_operator = '';
        var old_quantity = '';

        this.state = {
            rowCount: 10,
            bordered_row_id: -1,

            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray',

            operators_list: [],
        };
    }

    handleEscKeyPressed = event => {
        if (event.keyCode === 27) {
            this.handleAbortMovementEdit(this.state.bordered_row_id);
        }
    };

    handleAbortMovementEdit = rowIndex => {
        let cellContext = this.table.cellEditContext;
        let record_number = cellContext.props.data.length;
        cellContext.props.data[record_number - rowIndex - 1]['date_movement'] = this.old_date_movement;
        cellContext.props.data[record_number - rowIndex - 1]['operator'] = this.old_operator;
        cellContext.props.data[record_number - rowIndex - 1]['quantity'] = this.old_quantity;

        // Reset graphics
        this.setState({
            bordered_row_id: -1,
            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray',
        });

        // console.log(rowIndex)
        // console.log(this.table.cellEditContext)
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleEscKeyPressed, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleEscKeyPressed, false);
    }

    componentWillReceiveProps(nextProps) {
        // Get a unique list of operators
        let operators = [...new Set(nextProps.data.map(value => value.operator))];
        // Format this list as an array of label-value
        let op_list = operators.map(function(op) {
            return {
                value: op, 
                label: op
            }
        });

        this.setState({ operators_list: op_list });
    }

    handleDataChange = ({ dataSize }) => {
        this.setState({
            rowCount: dataSize,
        });
    };

    quantityFormatter(cell, row) {
        let col = 'black';

        if (cell > 0) col = '#009e73';
        // green
        else if (cell < 0) col = '#DC3220'; // red

        return (
            <span>
                <strong style={{ color: col }}>{cell}</strong>
            </span>
        );
    }

    itemFormatter(cell, row) {
        return (
            <span>
                <strong style={{ color: '#0072b2' }}>{cell}</strong>
            </span>
        );
    }

    itemHeaderFormatter(column, colIndex, { sortElement, filterElement }) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {column.text} {sortElement}
                {filterElement}
            </div>
        );
    }

    dateFormatter(cell, row) {
        let dateObj = cell;
        if (typeof cell !== 'object') {
            dateObj = new Date(cell);
        }

        return `${('0' + dateObj.getUTCDate()).slice(-2)}/${('0' + (dateObj.getUTCMonth() + 1)).slice(
            -2,
        )}/${dateObj.getUTCFullYear()}`;
    }

    handleMovementDelete = (movement_id, rowIndex) => {
        if (window.confirm('Are you sure you wish to delete this item?')) {
            const movement_id_obj = {
                id: movement_id,
            };

            axios
                .post('http://127.0.0.1:5000/delete_movement', {
                    movement_id_obj,
                })
                .then(response => {
                    alert('Removed movement with ID: ' + response.data['ID']);
                })
                .catch(err => {
                    console.log(err);
                });

            // remove event_id from the table
            this.props.onTableDelete(movement_id);
        }
    };

    handleMovementEdit = (row, rowIndex) => {
        // Saving present values
        this.old_date_movement = row.date_movement;
        this.old_operator = row.operator;
        this.old_quantity = row.quantity;

        this.setState({
            bordered_row_id: rowIndex,
            edit_color: 'disabled',
            cancel_color: 'disabled',
            done_color: green[500],
        });
    };

    setRowStyle = (row, rowIndex) => {
        const style = {};
        if (rowIndex === this.state.bordered_row_id) {
            // style.backgroundColor = '#c8e6c9';
            style.border = '3px solid red';
        }

        return style;
    };

    setEditCellStyle = (cell, row, rowIndex, colIndex) => {
        if (rowIndex === this.state.bordered_row_id) {
            return {
                backgroundColor: '#c8e6c9',
            };
        }
        return {
            backgroundColor: '#FFFFFF',
        };
    };

    handleCommitAllEditsForMovement = (movement_id, date_movement, operator, quantity, rowIndex) => {
        if (rowIndex === this.state.bordered_row_id) {
            // Handle here the commit of changes to database

            const movement_info = {
                id: movement_id,
                date_movement: date_movement,
                operator: operator,
                quantity: quantity,
            };

            axios
                .post('http://127.0.0.1:5000/edit_movement', { movement_info })
                .then(response => {
                    alert('Altered movement with ID: ' + response.data['ID']);
                })
                .catch(err => {
                    console.log(err);
                });

            // remove event_id from the table
            this.props.onTableEdit(movement_id);

            // buttons reset
            this.setState({
                bordered_row_id: -1,
                cancel_color: 'secondary',
                edit_color: 'primary',
                done_color: 'gray',
            });
        }
    };

    setEditableCell = (content, row, rowIndex, columnIndex) => {
        return rowIndex === this.state.bordered_row_id;
    };

    handleEditCell = (oldValue, newValue, row, column) => {
        if (column.dataField === 'date_movement') {
            this.old_date_movement = oldValue;
        } else if (column.dataField === 'operator') {
            this.old_operator = oldValue;
        } else if (column.dataField === 'quantity') {
            this.old_quantity = oldValue;
        }
    };

    formatHeader = data => {
        const sorted_header = [
            {
                dataField: 'id',
                text: 'ID',
                sort: true,
                hidden: true,
            },
            {
                dataField: 'date_movement',
                text: 'Movement date',
                filter: dateFilter(),
                formatter: this.dateFormatter,
                editable: this.setEditableCell,
                sort: true,
                headerStyle: (column, colIndex) => {
                    return { width: '220px' };
                },
                style: this.setEditCellStyle,
            },
            {
                dataField: 'operator',
                text: 'Operator',
                filter: textFilter(),
                // style: {
                //     fontStyle: 'italic',
                //     // fontSize: '18px'
                // },
                style: this.setEditCellStyle,
                editor: {
                    type: Type.SELECT,
                    options: this.state.operators_list,
                },
                editable: this.setEditableCell,
                sort: true,
            },
            {
                dataField: 'category',
                text: 'Category',
                filter: textFilter(),
                editable: false,
                sort: true,
            },
            {
                dataField: 'company',
                text: 'Company',
                filter: textFilter(),
                editable: false,
                sort: true,
            },
            {
                dataField: 'code_item',
                text: 'Item code',
                sort: true,
                filter: textFilter(),
                editable: false,
                // onSort: (field, order) => {
                //     console.log('....');
                //   }
            },
            {
                dataField: 'item',
                text: 'Item',
                filter: textFilter(),
                formatter: this.itemFormatter,
                headerFormatter: this.itemHeaderFormatter,
                editable: false,
                // events: {
                //     onDoubleClick: (e, column, columnIndex, row, rowIndex) => {
                //       console.log(e);
                //       console.log(column);
                //       console.log(columnIndex);
                //       console.log(row);
                //       console.log(rowIndex);
                //       alert('Click on Product ID field');
                //     }
                // },
                sort: true,
                // headerStyle: (column, colIndex) => {
                //     return { width: '400px' };
                // }
            },
            {
                dataField: 'batches',
                text: 'Batch',
                filter: textFilter(),
                editable: false,
                sort: true,
            },
            {
                dataField: 'quantity',
                text: 'Quantity',
                align: 'center',
                type: 'number',
                // filter: textFilter(),
                formatter: this.quantityFormatter,
                editable: this.setEditableCell,
                sort: true,
                style: this.setEditCellStyle,
            },
            {
                dataField: 'deleteIcon',
                isDummyField: true,
                text: 'Actions',
                editable: false,
                // headerStyle: (column, colIndex) => {
                //     return { width: '70px' };
                // },
                formatter: (cell, row, rowIndex, extraData) => {
                    if (row.operator !== 'Tom' && this.state.bordered_row_id === -1) {
                        return (
                            <div>
                                <CancelIcon
                                    color={extraData[0]}
                                    onClick={e => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementDelete(row.id, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <EditIcon
                                    color={extraData[1]}
                                    onClick={e => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementEdit(row, rowIndex);
                                    }}
                                />
                            </div>
                        );
                    } else if (
                        row.operator !== 'Tom' &&
                        this.state.bordered_row_id !== -1 &&
                        rowIndex !== -1 &&
                        rowIndex === this.state.bordered_row_id
                    ) {
                        return (
                            <div>
                                <CancelIcon
                                    color={extraData[0]}
                                    onClick={e => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementDelete(row.id, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <EditIcon
                                    color={extraData[1]}
                                    onClick={e => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementEdit(row, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <DoneAllIcon
                                    style={{ color: extraData[2] }}
                                    onClick={e =>
                                        extraData[0] === 'gray'
                                            ? ''
                                            : this.handleCommitAllEditsForMovement(
                                                  row.id,
                                                  row.date_movement,
                                                  row.operator,
                                                  row.quantity,
                                                  rowIndex,
                                              )
                                    }
                                />
                                &nbsp;&nbsp;
                                <ReplayIcon
                                    style={{ color: extraData[2] }}
                                    onClick={e =>
                                        extraData[0] === 'gray' ? '' : this.handleAbortMovementEdit(rowIndex)
                                    }
                                />
                            </div>
                        );
                    } else {
                        return (
                            <h5>
                                <CancelIcon color="disabled" />
                                &nbsp;&nbsp;
                                <EditIcon color="disabled" />
                            </h5>
                        );
                    }
                },
                formatExtraData: [this.state.cancel_color, this.state.edit_color, this.state.done_color],
            },
        ];

        return sorted_header;

        // const keys = (data[0] && Object.keys(data[0])) || [];
        // if (sorted_header.every(sh => keys.indexOf(sh.dataField) > -1)) {
        //     return sorted_header;
        // } else {
        //     return [{
        //         dataField: 'error',
        //         text: 'Database and Schema do not match'
        //     }]
        // }
    };

    render() {
        if (!this.props.data) return null;

        return (
            <div>
                <BootstrapTable
                    ref={n => (this.table = n)}
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.props.data}
                    //columns={this.state.columns}
                    columns={this.formatHeader()}
                    rowStyle={this.setRowStyle}
                    cellEdit={cellEditFactory({
                        mode: 'dbclick',
                        blurToSave: true,
                        afterSaveCell: this.handleEditCell,
                    })}
                    filter={filterFactory()}
                    filterPosition="top"
                    pagination={paginationFactory()}
                    bordered={true}
                    noDataIndication="Empty table"
                    // caption="Caption here"
                    caption={<CaptionElement />}
                    // tabIndexCell
                    // selectRow={{ mode: 'checkbox' }}
                    defaultSorted={[
                        {
                            dataField: 'id',
                            order: 'desc',
                        },
                    ]}
                    bootstrap4
                />
                <button onClick={e => this.handleClick(e)}>Click Me</button>
            </div>
        );
    }
}

export default MovementsTable;
