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

// const CaptionElement = () => (
//     <h3
//         style={{
//             borderRadius: '0.25em',
//             textAlign: 'center',
//             color: 'purple',
//             border: '1px solid purple',
//             padding: '0.5em',
//         }}
//     >
//         History
//     </h3>
// );

class MovementsTable extends React.Component {
    constructor(props) {
        super(props);

        var old_date_movement = '';
        var old_batch = '';
        var old_quantity = '';

        this.state = {
            rowCount: 10,
            bordered_row_id: -1,

            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray',

            window_size: null,
            batches_select: [],
        };
    }

    handleEscKeyPressed = (event) => {
        if (event.keyCode === 27) {
            this.handleAbortMovementEdit(this.state.bordered_row_id);
        }
    };

    handleAbortMovementEdit = (rowIndex) => {
        let cellContext = this.table.cellEditContext;
        let record_number = cellContext.props.data.length;
        cellContext.props.data[record_number - rowIndex - 1]['date_movement'] = this.old_date_movement;
        cellContext.props.data[record_number - rowIndex - 1]['batches'] = this.old_batch;
        cellContext.props.data[record_number - rowIndex - 1]['quantity'] = this.old_quantity;

        // Reset graphics
        this.setState({
            bordered_row_id: -1,
            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray',
        });

        console.log(rowIndex)
        console.log(cellContext.props.data[record_number - rowIndex - 1])
    };

    handleWindowResize = () => {
        let wsize = window.innerWidth - (88 + 120 + 120 + 120 + 55 + 70 + 70 + 115);
        if (wsize < 150) wsize = 150;

        this.setState({
            window_size: wsize,
        });
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleEscKeyPressed, false);
        window.addEventListener('resize', this.handleWindowResize, false);
        this.handleWindowResize();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleEscKeyPressed, false);
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

        return `${('0' + dateObj.getUTCDate()).slice(-2)}/${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${dateObj.getUTCFullYear()}`;
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
                .then((response) => {
                    alert('The item with ID: ' + response.data['ID'] + ' was removed');
                })
                .catch((err) => {
                    console.log(err);
                });

            // remove event_id from the table
            this.props.onTableDelete(movement_id);
        }
    };

    handleMovementEdit = (row, rowIndex) => {
        // Saving present values
        this.old_date_movement = row.date_movement;
        this.old_batch = row.batches;
        this.old_quantity = row.quantity;

        this.setState({
            bordered_row_id: rowIndex,
            edit_color: 'disabled',
            cancel_color: 'disabled',
            done_color: green[500],
        });

        let mov_id = row.id;
        axios
            .get('http://127.0.0.1:5000/batches/movement/' + mov_id, {})
            .then((response) => {
                let temp_batches = response.data.map((r) => {
                    return {
                        value: r.code,
                        label: r.code,
                    };
                });
                this.setState({
                    batches_select: temp_batches,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    setRowStyle = (row, rowIndex) => {
        const style = {};
        if (rowIndex === this.state.bordered_row_id) {
            // style.backgroundColor = '#c8e6c9';
            style.border = '3px solid red';
        }

        style.height = '0px';
        style.fontSize = 13;
        style.padding = '0px 0';

        return style;
    };

    setEditCellStyle = (cell, row, rowIndex, colIndex) => {
        if (rowIndex === this.state.bordered_row_id) {
            return {
                backgroundColor: '#c8e6c9',
            };
        }
        // return {
        //     backgroundColor: '#FFFFFF'
        // };
    };

    handleCommitAllEditsForMovement = (movement_id, date_movement, batch, quantity, rowIndex) => {
        if (rowIndex === this.state.bordered_row_id) {
            // Handle here the commit of changes to database

            const movement_info = {
                id: movement_id,
                date_movement: date_movement,
                batch: batch,
                quantity: quantity,
            };

            axios
                .post('http://127.0.0.1:5000/edit_movement', { movement_info })
                .then((response) => {
                    alert('Item with ID: ' + response.data['ID'] + ' was altered');
                })
                .catch((err) => {
                    console.log(err);
                });

            // alter movement from the original table
            this.props.onTableEdit(movement_info);

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
        } else if (column.dataField === 'batches') {
            this.old_batch = oldValue;
        } else if (column.dataField === 'quantity') {
            this.old_quantity = oldValue;
        }
    };

    formatHeader = () => {
        const sorted_header = [
            {
                dataField: 'id',
                text: 'ID',
                sort: true,
                hidden: true,
            },
            {
                dataField: 'date_movement',
                text: 'Date',
                // filter: dateFilter(
                //     {
                //         // dateStyle: { fontSize: 10, height: '39px', width: '130px',  valign:"top", margin: '5px' },
                //         style: { fontSize: 8, width: '150px'}
                //     }
                // ),
                filter: textFilter({
                    style: { fontSize: 9, width: '77px' }, //     fontStyle: 'italic',
                    placeholder: 'dd-mm-yyyy',
                }),
                formatter: this.dateFormatter,
                editor: {
                    // type: Type.DATE,
                    type: Type.TEXT,
                    style: { fontSize: 10 },
                },
                editable: this.setEditableCell,
                sort: true,
                headerStyle: (column, colIndex) => {
                    return { width: '88px', height: '0px', fontSize: 12 };
                },
                style: this.setEditCellStyle,
            },
            {
                dataField: 'operator',
                text: 'User',
                filter: textFilter({
                    style: { fontSize: 9, width: '110px' },
                    placeholder: 'Name Surname',
                }),
                headerStyle: (column, colIndex) => {
                    return { width: '120px', height: '0px', fontSize: 12 };
                },
                editable: false,
                sort: true,
            },
            {
                dataField: 'category',
                text: 'Category',
                filter: textFilter({
                    style: { fontSize: 9, width: '110px' },
                    placeholder: 'category name',
                }),
                headerStyle: (column, colIndex) => {
                    return { width: '120px', height: '0px', fontSize: 12 };
                },
                editable: false,
                sort: true,
            },
            {
                dataField: 'company',
                text: 'Company',
                filter: textFilter({
                    style: { fontSize: 9, width: '110px' },
                    placeholder: 'company name',
                }),
                headerStyle: (column, colIndex) => {
                    return { width: '120px', height: '0px', fontSize: 12 };
                },
                editable: false,
                sort: true,
            },
            {
                dataField: 'code_item',
                text: 'Code',
                sort: true,
                filter: textFilter({
                    style: { fontSize: 9, width: '45px' },
                    placeholder: 'code',
                }),
                editable: false,
                headerStyle: (column, colIndex) => {
                    return { width: '55px', height: '0px', fontSize: 12 };
                },
            },
            {
                dataField: 'item',
                text: 'Item',
                filter: textFilter({
                    style: { fontSize: 9, width: this.state.window_size -70},
                    placeholder: 'item description',
                }),
                formatter: this.itemFormatter,
                headerFormatter: this.itemHeaderFormatter,
                headerStyle: (column, colIndex) => {
                    return { height: '0px', fontSize: 12, width: this.state.window_size + 10 -70};
                },
                style: { whiteSpace: 'wrap', overflowX: 'auto' },
                editable: false,
                sort: true,
            },
            {
                dataField: 'batches',
                text: 'Batch',
                filter: textFilter({
                    style: { fontSize: 9, width: '60px' },
                    placeholder: 'code',
                }),
                style: this.setEditCellStyle,
                headerStyle: (column, colIndex) => {
                    return { height: '0px', fontSize: 12, display: 'table-cell', width: '70px' };
                },
                editor: {
                    type: Type.SELECT,
                    options: this.state.batches_select,
                    style: { fontSize: 10 },
                },
                editable: this.setEditableCell,
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
                headerStyle: (column, colIndex) => {
                    return { height: '0px', fontSize: 12, display: 'table-cell', width: '70px' };
                },
            },
            {
                dataField: 'deleteIcon',
                isDummyField: true,
                text: 'Actions',
                editable: false,
                headerStyle: (column, colIndex) => {
                    return { width: '115px', height: '0px', fontSize: 12 };
                },
                formatter: (cell, row, rowIndex, extraData) => {
                    // TODO: change the user name here
                    if (row.operator !== 'Tom' && this.state.bordered_row_id === -1) {
                        return (
                            <div>
                                <CancelIcon
                                    fontSize={'small'}
                                    color={extraData[0]}
                                    onClick={(e) => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementDelete(row.id, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <EditIcon
                                    fontSize={'small'}
                                    color={extraData[1]}
                                    onClick={(e) => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementEdit(row, rowIndex);
                                    }}
                                />
                            </div>
                        );
                    } else if (row.operator !== 'Tom' && this.state.bordered_row_id !== -1 && rowIndex !== -1 && rowIndex === this.state.bordered_row_id) {
                        return (
                            <div>
                                <CancelIcon
                                    fontSize={'small'}
                                    color={extraData[0]}
                                    onClick={(e) => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementDelete(row.id, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <EditIcon
                                    fontSize={'small'}
                                    color={extraData[1]}
                                    onClick={(e) => {
                                        extraData[0] === 'disabled' ? '' : this.handleMovementEdit(row, rowIndex);
                                    }}
                                />
                                &nbsp;&nbsp;
                                <DoneAllIcon
                                    fontSize={'small'}
                                    style={{ color: extraData[2] }}
                                    onClick={(e) =>
                                        extraData[0] === 'gray' ? '' : this.handleCommitAllEditsForMovement(row.id, row.date_movement, row.batches, row.quantity, rowIndex)
                                    }
                                />
                                &nbsp;&nbsp;
                                <ReplayIcon 
                                    fontSize={'small'}
                                    style={{ color: extraData[2] }} 
                                    onClick={(e) => (extraData[0] === 'gray' ? '' : this.handleAbortMovementEdit(rowIndex))} />
                            </div>
                        );
                    } else {
                        return (
                            <h5>
                                <CancelIcon fontSize={'small'} color="disabled" />
                                &nbsp;&nbsp;
                                <EditIcon fontSize={'small'} color="disabled" />
                            </h5>
                        );
                    }
                },
                formatExtraData: [this.state.cancel_color, this.state.edit_color, this.state.done_color],
            },
        ];

        return sorted_header;
    };

    render() {
        if (!this.props.data) return null;

        return (
            <div>
                <BootstrapTable
                    ref={(n) => (this.table = n)}
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.props.data}
                    columns={this.formatHeader()}
                    rowStyle={this.setRowStyle}
                    cellEdit={cellEditFactory({
                        mode: 'click',
                        blurToSave: true,
                        afterSaveCell: this.handleEditCell,
                    })}
                    filter={filterFactory()}
                    filterPosition="top"
                    pagination={paginationFactory()}
                    noDataIndication="Empty table"
                    // caption="Caption here"
                    // caption={<CaptionElement />}
                    // tabIndexCell
                    // selectRow={{ mode: 'checkbox' }}
                    bordered={false}
                    striped
                    hover
                    condensed
                    defaultSorted={[
                        {
                            dataField: 'id',
                            order: 'desc',
                        },
                    ]}
                    // style={{overflowX: 'auto !important'}}
                    table-responsive
                    bootstrap4
                />
            </div>
        );
    }
}

export default MovementsTable;
