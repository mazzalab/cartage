import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import './styles.css';
import AddMovementBar from './AddMovementBar';

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
    constructor(props) {
        var _isMounted = false;

        super(props);
        this.handleHOTChange = this.handleHOTChange.bind(this);

        this.state = {
            data: [{ 'id': 1 }],
            columns: [{
                dataField: 'id',
                text: 'Product IDs'
            }],
            categorie: [],
            ditta: [],
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

        axios.all([requestAll, requestCat, requestDit])
        .then(axios.spread((...responses) => {
            const responseAll = responses[0].data;
            const responseCat = responses[1].data;
            const responseDit = responses[2].data;

            if (this._isMounted) {
                var sorted_header = this.formatHeader(data);

                this.setState({ columns: sorted_header });
                this.setState({ data: responseAll });
                // this.setState({ rowCounts: responseAll.length })

                this.setState({ catogorie: responseCat})
                this.setState({ ditte: responseDit})
            }
        })).catch(errors => {
            console.log(errors)
        })


        // axios.get(`http://127.0.0.1:5000/`)
        //     .then(res => {
        //         const data = res.data;

        //         if (this._isMounted) {
        //             var sorted_header = this.formatHeader(data);

        //             this.setState({ columns: sorted_header });
        //             this.setState({ data: data });
        //             // this.setState({ rowCounts: data.length })
        //         }
        //     })
        //     .catch(err => console.log(err))

        // fetch('http://127.0.0.1:5000/')
        //     .then(response => response.json())
        //     .then(data => {
        //         var sorted_header = this.formatHeader(data);

        //         if (this._isMounted) {
        //             this.setState({ columns: sorted_header });
        //             this.setState({ data: data });
        //             // this.setState({ rowCounts: data.length })
        //         }
        //     });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    quantitaFormatter(cell, row) {
        let col = 'black'
        if (cell <= 3) {
            col = '#009e73';  // green

        } else if (cell === 0) {
            col = '#DC3220';  // red
        }

        return (<span><strong style={{ color: col }}>{cell}</strong></span>);
    }

    articoloFormatter(cell, row) {
        return (
            <span><strong style={{ color: '#0072b2' }}>{cell}</strong></span>
        );
    }

    articoloHeaderFormatter(column, colIndex, { sortElement, filterElement }) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* {sortElement} */}
                {column.text}
                {filterElement}
            </div>
        );
    }

    dateFormatter(cell, row) {
        let dateObj = cell;
        if (typeof cell !== 'object') {
            dateObj = new Date(cell);
        }

        return `${('0' + dateObj.getUTCDate()).slice(-2)}/${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${dateObj.getUTCFullYear()} - 
        ${('0' + (dateObj.getUTCHours())).slice(-2)}:${('0' + (dateObj.getUTCMinutes())).slice(-2)}:${(dateObj.getUTCSeconds())}`;
    }

    formatHeader(data) {
        const sorted_header = [{
            dataField: 'id',
            text: 'ID',
            hidden: true
            // sort: true,
            // onSort: (field, order) => {
            //     console.log('....');
            //   }
        }, {
            dataField: 'code',
            text: 'Product ID'
            // sort: true,
            // onSort: (field, order) => {
            //     console.log('....');
            //   }
        }, {
            dataField: 'operatore',
            text: 'Operatore',
            filter: textFilter(),
            style: {
                fontStyle: 'italic',
                // fontSize: '18px'
            }
            // sort: true
        }, {
            dataField: 'data_evento',
            text: 'Data evento',
            filter: dateFilter(),
            formatter: this.dateFormatter,
            // editor: {
            //     type: Type.DATE
            // },
            // sort: true
        }, {
            dataField: 'articolo',
            text: 'Articolo',
            sort: true,
            filter: textFilter(),
            formatter: this.articoloFormatter,
            headerFormatter: this.articoloHeaderFormatter
        }, {
            dataField: 'categoria',
            text: 'Categoria',
            filter: textFilter()
        }, {
            dataField: 'lotto',
            text: 'Lotto',
            filter: textFilter()
        }, {
            dataField: 'ditta',
            text: 'Ditta',
            filter: textFilter()
        }, {
            dataField: 'quantita',
            text: 'Quantità',
            align: 'center',
            type: 'number',
            filter: textFilter(),
            formatter: this.quantitaFormatter
        }
            // }, {
            //     dataField: 'df1',
            //     isDummyField: true,
            //     text: 'Status',
            //     formatter: (cellContent, row) => {
            //         if (row.quantita !== 0) {
            //             return (
            //                 <h5>
            //                     <span className="btn btn-success"> Available</span>
            //                 </h5>
            //             );
            //         }
            //         return (
            //             <h5>
            //                 <span className="label label-default"> Backordered</span>
            //             </h5>
            //         );
            //     }
            //    }
        ];

        const keys = (data[0] && Object.keys(data[0])) || [];
        if (sorted_header.every(sh => keys.indexOf(sh.dataField) > -1)) {
            return sorted_header;
        } else {
            return [{
                dataField: 'error',
                text: 'Database and Schema not matching'
            }]
        }
    }

    handleHOTChange(changes, source) {
        alert('changed!');
        console.log(changes);
    }

    handleClick(e) {
        this.refs.hot.hotInstance.setDataAtCell(0, 0, 'new value')
    }

    render() {
        return (
            <div>
                <AddMovementBar categorie={this.state.categorie} ditte={this.state.ditta}/>
                <h5>Row Count:<span className="badge">{this.state.rowCount}</span></h5>
                <BootstrapTable
                    onDataSizeChange={this.handleDataChange}
                    keyField="id"
                    data={this.state.data}
                    columns={this.state.columns}
                    filter={filterFactory()}
                    filterPosition="top"
                    pagination={paginationFactory()}
                    bordered={false}
                    noDataIndication="Table is Empty"
                    // caption="Caption here"
                    caption={<CaptionElement />}
                    tabIndexCell
                    selectRow={{ mode: 'checkbox' }}
                    defaultSorted={[{
                        dataField: 'articolo',
                        order: 'desc'
                    }]}
                    bootstrap4
                />
                <button onClick={(e) => this.handleClick(e)}>Click Me</button>
            </div>
        );
    }
}


const title = 'React with Webpack and Babel!!';

ReactDOM.render(
    <SmartTable />,
    document.getElementById('root')
);

// module.hot.accept();