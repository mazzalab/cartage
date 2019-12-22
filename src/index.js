import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { HotTable, HotColumn } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

class SmartTable extends React.Component {
    constructor(props) {
        var _isMounted = false;

        super(props);
        this.handleHOTChange = this.handleHOTChange.bind(this);
        this.state = {
            secondColumnSettings: {
                title: "Second column header",
                readOnly: true
            },
            general_settings: {
                ref: "hot",
                data: [],
                colWidths: 100,
                width: '100%',
                height: 320,
                rowHeights: 23,
                rowHeaders: false,
                colHeaders: true,
                // colHeaders: [],
                manualColumnMove: true,
                manualColumnResize: true,
                headerTooltips: {
                    rows: false,
                    columns: true,
                    onlyTrimmed: true
                },
                stretchH: 'all',
                contextMenu: true,
                // afterChange: ((changes) => {
                //     alert('changed!');
                //     console.log('changed!');
                // })
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;

        fetch('http://127.0.0.1:5000/')
            .then(response => response.json())
            .then(data => {
                var keys = (data[0] && Object.keys(data[0])) || [];
                var csv = []
                
                var i=0
                for (var line of data){
                    csv[i] = keys.map(key => line[key]);
                    i++;
                }

                console.log(csv);

                var gsettings = { ...this.state.general_settings };
                gsettings.data = csv;
                gsettings.colHeaders = keys;
                if (this._isMounted) {
                    this.setState({ general_settings: gsettings });
                }
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
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
                <HotTable
                    settings={this.state.general_settings}
                    licenseKey="non-commercial-and-evaluation"
                    ref="hot"
                >
                    {/* <HotColumn title="First column header" />
                <HotColumn settings={this.state.secondColumnSettings} /> */}
                </HotTable>
                <button onClick={(e) => this.handleClick(e)}>Click Me</button>
            </div>
        );
    }
}

const searchFiled = document.getElementById('search_field');

Handsontable.dom.addEvent(searchFiled, 'keyup', function (event) {
    var search = this.hotTableComponent.current.hotInstance.getPlugin('search');
    var queryResult = search.query(this.value);

    console.log(queryResult);
    this.hotTableComponent.current.hotInstance.render();
});

const title = 'React with Webpack and Babel!!';

ReactDOM.render(
    <SmartTable />,
    document.getElementById('root')
);

module.hot.accept();