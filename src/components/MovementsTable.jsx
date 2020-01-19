// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React from 'react';
import axios from 'axios';

import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { green } from '@material-ui/core/colors';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, dateFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';


const CaptionElement = () => <h3 style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}>History</h3>;

// export const axiosInstance = axios.create({
//     baseURL: 'https://iamsourabhh.com/',
//     timeout: 1000,
//     responseType: "json"
//   });

class MovementsTable extends React.Component {
    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            data: [{ 'id': 1 }],
            // columns: [{
            //     dataField: 'id',
            //     text: 'Product IDs'
            // }],
            rowCount: 10,
            bordered_row_id: -1,

            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray'
        }
    }

    componentDidMount() {
        this._isMounted = true;

        axios.get("http://127.0.0.1:5000/")
            .then(response => {
                if (this._isMounted) {
                    this.setState({ data: response.data });
                }
            }).catch(err => {
                console.log(err);
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleDataChange = ({ dataSize }) => {
        this.setState({ rowCount: dataSize });
    }

    quantityFormatter(cell, row) {
        let col = 'black';

        if (cell > 0)
            col = '#009e73';  // green
        else if (cell < 0)
            col = '#DC3220';  // red

        return (<span><strong style={{ color: col }}>{cell}</strong></span>);
    }

    itemFormatter(cell, row) {
        return (
            <span><strong style={{ color: '#0072b2' }}>{cell}</strong></span>
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

        // return `${('0' + dateObj.getUTCDate()).slice(-2)}/${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${dateObj.getUTCFullYear()} - 
        // ${('0' + (dateObj.getUTCHours())).slice(-2)}:${('0' + (dateObj.getUTCMinutes())).slice(-2)}:${(dateObj.getUTCSeconds())}`;
        return `${('0' + dateObj.getUTCDate()).slice(-2)}/${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${dateObj.getUTCFullYear()}`;
    }

    // handleClick(e) {
    //     this.refs.hot.hotInstance.setDataAtCell(0, 0, 'new value')
    // }

    handleMovementDelete = (e, movement_id) => {
        if (window.confirm('Are you sure you wish to delete this item?')) {
            // axios call here to remove event_id from the database

            const movement_id_obj = {
                id: movement_id
            };

            axios.post("http://127.0.0.1:5000/deleteMovement", {
                eid_obj: movement_id_obj
            }).then(response => {
                alert('Removed movement with ID: ' + response.data['ID']);
            }).catch(err => {
                console.log(err);
            });

            // remove event_id from the table
            this.removeMovementFromTable(movement_id);
        }
    }

    removeMovementFromTable = (movement_id) => {
        console.log(movement_id);
        var filteredData = this.state.data.filter(el => el.id !== movement_id);
        this.setState({ data: filteredData });
    }

    handleMovementEdit = (e, row_id) => {
        this.setState({
            bordered_row_id: row_id,
            edit_color: 'disabled',
            cancel_color: 'disabled',
            done_color: green[500]
        });
    }

    setRowStyle = (row, rowIndex) => {
        const style = {};
        if (row.id === this.state.bordered_row_id) {
            // style.backgroundColor = '#c8e6c9';
            style.border = '3px solid red';
        }

        return style;
    };

    setEditCellStyle = (cell, row, rowIndex, colIndex) => {
        if (rowIndex + 1 === this.state.bordered_row_id) {
            return {
                backgroundColor: '#c8e6c9'
            };
        }
        return {
            backgroundColor: '#FFFFFF'
        };
    }

    handleCommitAllEditsForMovement = (e, row_id) => {
        if (row_id === this.state.bordered_row_id) {
            // Handle here the commit of changes to database

            // button reset
            this.setState({
                bordered_row_id: -1,
                cancel_color: 'secondary',
                edit_color: 'primary',
                done_color: 'gray'
            })
        }
    }

    setEditableCell = (content, row, rowIndex, columnIndex) => {
        return rowIndex === this.state.bordered_row_id - 1;
    }

    formatHeader = (data) => {
        const sorted_header = [{
            dataField: 'id',
            text: 'ID',
            hidden: true,
        }, {
            dataField: 'date_movement',
            text: 'Movement date',
            filter: dateFilter(),
            formatter: this.dateFormatter,
            editable: this.setEditableCell,
            sort: true,
            headerStyle: (column, colIndex) => {
                return { width: '220px' };
            },
            style: this.setEditCellStyle
        }, {
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
                options: this.state.operators_maintable
            },
            editable: this.setEditableCell,
            sort: true
        }, {
            dataField: 'code_item',
            text: 'Item code',
            sort: true,
            filter: textFilter(),
            editable: false
            // onSort: (field, order) => {
            //     console.log('....');
            //   }
        }, {
            dataField: 'category',
            text: 'Category',
            filter: textFilter(),
            editable: false,
            sort: true
        }, {
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
            sort: true
            // headerStyle: (column, colIndex) => {
            //     return { width: '400px' }; 
            // }
        }, {
            dataField: 'batches',
            text: 'Batch',
            filter: textFilter(),
            editable: false,
            sort: true
        }, {
            dataField: 'company',
            text: 'Company',
            filter: textFilter(),
            editable: false,
            sort: true
        }, {
            dataField: 'quantity',
            text: 'Quantity',
            align: 'center',
            type: 'number',
            // filter: textFilter(),
            formatter: this.quantityFormatter,
            editable: this.setEditableCell,
            sort: true,
            style: this.setEditCellStyle
        }, {
            dataField: 'deleteIcon',
            isDummyField: true,
            text: 'Actions',
            editable: false,
            // headerStyle: (column, colIndex) => {
            //     return { width: '70px' }; 
            // },
            formatter: (cell, row, rowIndex, extraData) => {
                if (row.operator !== 'Tom') {
                    return (
                        <div>
                            <CancelIcon color={extraData[0]} onClick={(e) => {
                                extraData[0] === "disabled" ? "" : this.handleMovementDelete(e, row.id)
                            }} />&nbsp;&nbsp;
                            <EditIcon color={extraData[1]} onClick={e => {
                                extraData[0] === "disabled" ? "" : this.handleMovementEdit(e, row.id)
                            }} />&nbsp;&nbsp;
                            <DoneAllIcon style={{ color: extraData[2] }} onClick={e =>
                                extraData[0] === "gray" ? "" : this.handleCommitAllEditsForMovement(e, row.id)
                            } />
                        </div>
                    )
                }
                return (
                    <h5>
                        <CancelIcon color="disabled" />&nbsp;&nbsp;
                        <EditIcon color="disabled" />&nbsp;&nbsp;
                        <DoneAllIcon style={{ color: "gray" }} />
                    </h5>
                );
            },
            formatExtraData: [this.state.cancel_color, this.state.edit_color, this.state.done_color]
        }
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
    }

    render() {
        return (
            <div>

                <BootstrapTable
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.state.data}
                    //columns={this.state.columns}
                    columns={this.formatHeader()}
                    rowStyle={this.setRowStyle}
                    cellEdit={cellEditFactory({ mode: 'dbclick', blurToSave: true })}
                    filter={filterFactory()}
                    filterPosition="top"
                    pagination={paginationFactory()}
                    bordered={true}
                    noDataIndication="Empty table"
                    // caption="Caption here"
                    caption={<CaptionElement />}
                    // tabIndexCell
                    // selectRow={{ mode: 'checkbox' }}
                    defaultSorted={[{
                        dataField: 'date_movement',
                        order: 'desc'
                    }]}
                    bootstrap4
                />
                <button onClick={(e) => this.handleClick(e)}>Click Me</button>
            </div>
        );
    }
}

export default MovementsTable;