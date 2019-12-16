import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { HotTable, HotColumn } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

class SmartTable extends React.Component {
    constructor(props) {
        super(props);

        this.handleHOTChange = this.handleHOTChange.bind(this);

        this.state = {
            secondColumnSettings: {
                title: "Second column header",
                readOnly: true
            },
            general_settings: {
                ref: "hot",
                data: Handsontable.helper.createSpreadsheetData(6, 10),
                colWidths: 100,
                width: '100%',
                height: 320,
                rowHeights: 23,
                rowHeaders: false,
                colHeaders: true,
                colHeaders: ['A', 'B', 'Long column header label', 'D', 'Another long label', 'E', 'F', 'G', 'H', 'T'],
                manualColumnMove: true,
                manualColumnResize: true,
                headerTooltips: {
                    rows: false,
                    columns: true,
                    onlyTrimmed: true
                },
                stretchH: 'all',
                contextMenu: true,
                afterChange: ((changes) => {
                    alert('changed!');
                    console.log('changed!');
                })
            }
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