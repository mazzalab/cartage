import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import './styles.css';
import AddMovementBar from './components/AddMovementBar';
import CancelIcon from '@material-ui/icons/Cancel';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, dateFilter } from 'react-bootstrap-table2-filter';
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
            categorie: [],
            ditte: [],
            rowCount: 10
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
                var items_categoria = responseCat.map(r => { return <option key={r.categoria}>{r.categoria}</option> });
                var items_operatore = responseOpe.map(r => { return <option key={r.operatore}>{r.operatore}</option> });

                items_ditta.unshift(<option key={'empty_ditta'}>{'select'}</option>)
                items_categoria.unshift(<option key={'empty_categoria'}>{'select'}</option>)
                items_operatore.unshift(<option key={'empty_operatore'}>{'select'}</option>)

                if (this._isMounted) {
                    // var sorted_header = this.formatHeader(responseAll);

                    this.setState({
                        // columns: sorted_header,
                        data: responseAll,
                        categorie: items_categoria,
                        ditte: items_ditta,
                        operatori: items_operatore
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

    handleEventDelete = (e, event_id) => {
        if (window.confirm('Are you sure you wish to delete this item?')){
            alert("Removing: " + event_id);

            // axios call here to remove event_id from the database
            // remove event_id from the table
        } 
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
            sort: true
        }, {
            dataField: 'articolo',
            text: 'Articolo',
            filter: textFilter(),
            formatter: this.articoloFormatter,
            headerFormatter: this.articoloHeaderFormatter,
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
            // headerStyle: (column, colIndex) => {
            //     return { width: '70px' }; 
            // },
            formatter: (cellContent, row) => {
                if (row.operatore === 'Tom') {
                    return (
                        <CancelIcon color="secondary" onClick={(e) => this.handleEventDelete(e, row.id)}/>
                    );
                }
                return (
                    <h5>
                        <CancelIcon color="disabled" />
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

    handleHOTChange(changes, source) {
        alert('changed!');
        console.log(changes);
    }

    handleClick(e) {
        this.refs.hot.hotInstance.setDataAtCell(0, 0, 'new value')
    }

    onTableUpdate = (productid, operatore, dataevento, articolo, categoria, lotto, ditta, quantita) => {
        var oldData = this.state.data;
        oldData.push({
            code: productid['productid'], operatore: operatore['operatore'], data_evento: dataevento['dataevento'], articolo: articolo['articolo'],
            categoria: categoria['categoria'], lotto: lotto['lotto'], ditta: ditta['ditta'], quantita: quantita['quantita']
        });
        this.setState({ data: oldData });
    }

    render() {
        return (
            <div>
                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                <AddMovementBar operatori={this.state.operatori} categorie={this.state.categorie} ditte={this.state.ditte} onTableUpdate={this.onTableUpdate} />
                {/* </div> */}
                <h5>Row Count:<span className="badge">{this.state.rowCount}</span></h5>
                <BootstrapTable
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.state.data}
                    //columns={this.state.columns}
                    columns={this.formatHeader()}
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