import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import './styles.css';
import AddMovementBar from './components/AddMovementBar';

import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { green } from '@material-ui/core/colors';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, dateFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


const CaptionElement = () => <h3 style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}>History</h3>;

// export const axiosInstance = axios.create({
//     baseURL: 'https://iamsourabhh.com/',
//     timeout: 1000,
//     responseType: "json"
//   });

class SmartTable extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.handleHOTChange = this.handleHOTChange.bind(this);

        this.state = {
            data: [{ 'id': 1 }],
            // columns: [{
            //     dataField: 'id',
            //     text: 'Product IDs'
            // }],
            operatori: [],
            operatori_maintable: [],
            categorie: [],
            categorie_maintable: [],
            ditte: [],
            ditte_maintable: [],

            rowCount: 10,
            bordered_row_id: -1,
            nonEditableRows: [-1]
        }
    }

    handleDataChange = ({ dataSize }) => {
        this.setState({ rowCount: dataSize });
    }

    componentDidMount() {
        this._isMounted = true;

        const requestAll = axios.get('http://127.0.0.1:5000/');
        const requestCat = axios.get('http://127.0.0.1:5000/categorie');
        const requestDit = axios.get('http://127.0.0.1:5000/ditte');
        const requestOpe = axios.get('http://127.0.0.1:5000/operatori');

        axios.all([requestAll, requestCat, requestDit, requestOpe])
            .then(axios.spread((...responses) => {
                const responseAll = responses[0].data;
                const responseCat = responses[1].data;
                const responseDit = responses[2].data;
                const responseOpe = responses[3].data;

                var items_ditta = responseDit.map(r => { return <option key={r.ditta}>{r.ditta}</option> });
                var items_ditta4table = responseDit.map(r => { return {value: r.ditta, label: r.ditta} });
                var items_categoria = responseCat.map(r => { return <option key={r.categoria}>{r.categoria}</option> });
                var items_categoria4table = responseCat.map(r => { return { value: r.categoria, label: r.categoria } });
                var items_operatore = responseOpe.map(r => { return <option key={r.operatore}>{r.operatore}</option> });
                var items_operatore4table = responseOpe.map(r => { return { value: r.operatore, label: r.operatore } });

                items_ditta.unshift(<option key={'empty_ditta'}>{'select'}</option>)
                items_categoria.unshift(<option key={'empty_categoria'}>{'select'}</option>)
                items_operatore.unshift(<option key={'empty_operatore'}>{'select'}</option>)

                if (this._isMounted) {
                    // var sorted_header = this.formatHeader(responseAll);

                    this.setState({
                        // columns: sorted_header,
                        data: responseAll,
                        categorie: items_categoria,
                        categorie_maintable: items_categoria4table,
                        ditte: items_ditta,
                        ditte_maintable: items_ditta4table,
                        operatori: items_operatore,
                        operatori_maintable: items_operatore4table
                    })
                    // this.setState({ rowCounts: responseAll.length })
                }
            }))
            .catch(errors => {
                console.log(errors)
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    quantitaFormatter(cell, row) {
        let col = 'black';

        if (cell > 0)
            col = '#009e73';  // green
        else if (cell < 0)
            col = '#DC3220';  // red

        return (<span><strong style={{ color: col }}>{cell}</strong></span>);
    }

    articoloFormatter(cell, row) {
        return (
            <span><strong style={{ color: '#0072b2' }}>{cell}</strong></span>
        );
    }

    articoloHeaderFormatter(column, colIndex, { sortElement, filterElement }) {
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

    handleHOTChange(changes, source) {
        alert('changed!');
        console.log(changes);
    }

    handleClick(e) {
        this.refs.hot.hotInstance.setDataAtCell(0, 0, 'new value')
    }

    onTableAdd = (productid, operatore, dataevento, articolo, categoria, lotto, ditta, quantita) => {
        var oldData = this.state.data;
        oldData.push({
            code: productid['productid'], operatore: operatore['operatore'], data_evento: dataevento['dataevento'], articolo: articolo['articolo'],
            categoria: categoria['categoria'], lotto: lotto['lotto'], ditta: ditta['ditta'], quantita: quantita['quantita']
        });
        this.setState({ data: oldData });
    }

    handleEventDelete = (e, event_id) => {
        if (window.confirm('Are you sure you wish to delete this item?')) {
            // axios call here to remove event_id from the database

            const eid_obj = {
                id: event_id
            };

            axios.post("http://127.0.0.1:5000/deleteMovement", {
                eid_obj
            }).then(response => {
                alert('Removed event with ID: ' + response.data['ID']);
            }).catch(err => {
                console.log(err);
            });

            // remove event_id from the table
            this.removeMovementIdfromTable(event_id);
        }
    }

    removeMovementIdfromTable = (event_id) => {
        console.log(event_id);
        var filteredData = this.state.data.filter(el => el.id !== event_id);
        this.setState({ data: filteredData });
    }
       
    handleEventEdit = (e, row_id) => {
        this.setState({ bordered_row_id: row_id })

        // generate array of not editable rows here and update this.state.nonEditableRows: [-1]
    }

    setRowStyle = (row, rowIndex) => {
        const style = {};
        if (row.id === this.state.bordered_row_id) {
            style.backgroundColor = '#c8e6c9';
            style.border = '3px solid red';
        }

        return style;
    };

    handleCommitAllEditForEvent = (e, row_id) => {
        if (row_id === this.state.bordered_row_id) {
            this.setState({ bordered_row_id: -1 });
        }

        // Handle here the commit of changes to database
        // and the reset of all styles for edited cells
    }

    

    formatHeader(data) {
        const sorted_header = [{
            dataField: 'id',
            text: 'ID',
            hidden: true,
        }, {
            dataField: 'data_evento',
            text: 'Data evento',
            filter: dateFilter(),
            formatter: this.dateFormatter,
            sort: true,
            headerStyle: (column, colIndex) => {
                return { width: '220px' };
            }
        }, {
            dataField: 'operatore',
            text: 'Operatore',
            filter: textFilter(),
            style: {
                fontStyle: 'italic',
                // fontSize: '18px'
            },
            editor: {
                type: Type.SELECT,
                options: this.state.operatori_maintable
            },
            sort: true
        }, {
            dataField: 'code',
            text: 'Product ID',
            sort: true,
            filter: textFilter()
            // onSort: (field, order) => {
            //     console.log('....');
            //   }
        }, {
            dataField: 'categoria',
            text: 'Categoria',
            filter: textFilter(),
            editor: {
                type: Type.SELECT,
                options: this.state.categorie_maintable
            },
            sort: true
        }, {
            dataField: 'articolo',
            text: 'Articolo',
            filter: textFilter(),
            formatter: this.articoloFormatter,
            headerFormatter: this.articoloHeaderFormatter,
            editor: {
                type: Type.SELECT,
                options: this.state.articoli_maintable
              },
            sort: true,
            // headerStyle: (column, colIndex) => {
            //     return { width: '400px' }; 
            // }
        }, {
            dataField: 'lotto',
            text: 'Lotto',
            filter: textFilter(),
            sort: true
        }, {
            dataField: 'ditta',
            text: 'Ditta',
            filter: textFilter(),
            editor: {
                type: Type.SELECT,
                options: this.state.ditte_maintable
              },
            sort: true
        }, {
            dataField: 'quantita',
            text: 'Quantità',
            align: 'center',
            type: 'number',
            filter: textFilter(),
            formatter: this.quantitaFormatter,
            sort: true
        }, {
            dataField: 'deleteIcon',
            isDummyField: true,
            text: 'Status',
            editable: false,
            // headerStyle: (column, colIndex) => {
            //     return { width: '70px' }; 
            // },
            formatter: (cellContent, row) => {
                if (row.operatore === 'Tom') {
                    return (
                        <div>
                            <CancelIcon color="secondary" onClick={(e) => this.handleEventDelete(e, row.id)} />&nbsp;&nbsp;
                            <EditIcon color="primary" onClick={e => this.handleEventEdit(e, row.id)} />&nbsp;&nbsp;
                            <DoneAllIcon style={{ color: green[500] }} onClick={e => this.handleCommitAllEditForEvent(e, row.id)} />
                        </div>
                    );
                }
                return (
                    <h5>
                        <CancelIcon color="disabled" />&nbsp;&nbsp;
                        <EditIcon color="disabled" />&nbsp;&nbsp;
                        <DoneAllIcon color="disabled" />
                    </h5>
                );
            }
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
                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                <AddMovementBar operatori={this.state.operatori} categorie={this.state.categorie} ditte={this.state.ditte} onTableAdd={this.onTableAdd} />
                {/* </div> */}
                <h5>Row Count:<span className="badge">{this.state.rowCount}</span></h5>
                <BootstrapTable
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.state.data}
                    //columns={this.state.columns}
                    columns={this.formatHeader()}
                    rowStyle={this.setRowStyle}
                    cellEdit={cellEditFactory({ mode: 'dbclick', blurToSave: true, nonEditableRows: () => this.state.nonEditableRows })}
                    filter={filterFactory()}
                    filterPosition="top"
                    pagination={paginationFactory()}
                    bordered={true}
                    noDataIndication="Table is Empty!"
                    // caption="Caption here"
                    caption={<CaptionElement />}
                    tabIndexCell
                    // selectRow={{ mode: 'checkbox' }}
                    defaultSorted={[{
                        dataField: 'data_evento',
                        order: 'desc'
                    }]}
                    bootstrap4
                />
                <button onClick={(e) => this.handleClick(e)}>Click Me</button>
            </div>
        );
    }
}


ReactDOM.render(
    <SmartTable />,
    document.getElementById('root')
);

// module.hot.accept();