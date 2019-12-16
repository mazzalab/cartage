import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { HotTable, HotColumn } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

class SmartTable extends React.Component {
    constructor(props) {
        super(props);

        this.hotTableComponent = React.createRef();

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
                contextMenu: true
            }
        };
    }

    render() {
        return (
            <HotTable
                settings={this.state.general_settings}
                licenseKey="non-commercial-and-evaluation"
                addEvent={}
            >
                {/* <HotColumn title="First column header" />
                <HotColumn settings={this.state.secondColumnSettings} /> */}
            </HotTable>
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


ReactDOM.render(
    <SmartTable />,
    document.getElementById('root')
);

module.hot.accept();