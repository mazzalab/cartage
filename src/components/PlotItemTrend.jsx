import React, { useState } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { ResponsiveLine } from '@nivo/line'


// const useStyles = makeStyles((theme) => ({
//     paper_bcg: {
//         backgroundColor: theme.palette.background.paper,
//         border: '2px solid #000',
//         boxShadow: theme.shadows[5],
//         padding: theme.spacing(2, 4, 3),
//     },
//     modal: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     table: {
//         maxWidth: 650,
//         maxHeight: 600
//     },
//     tablecell: {
//         fontSize: 12,
//     },
//     redTablecell: {
//         fontSize: 12,
//         color: 'red',
//         fontWeight: 'bold'
//     },
//     headerCell: {
//         fontWeight: 'bold'
//     }
// }));

function PlotItemTrend(props) {
    // const classes = useStyles();
    const [plotData, setplotData] = useState();
        
    React.useEffect(() => {
        let pdata = [
            {
              "id": "pizza",
              "color": "hsl(226, 70%, 50%)",
              "data": [
                {
                  "x": "plane",
                  "y": 273
                },
                {
                  "x": "helicopter",
                  "y": 137
                },
                {
                  "x": "boat",
                  "y": 111
                },
                {
                  "x": "train",
                  "y": 133
                },
                {
                  "x": "subway",
                  "y": 177
                },
                {
                  "x": "bus",
                  "y": 17
                },
                {
                  "x": "car",
                  "y": 32
                },
                {
                  "x": "moto",
                  "y": 72
                },
                {
                  "x": "bicycle",
                  "y": 148
                },
                {
                  "x": "horse",
                  "y": 1
                },
                {
                  "x": "skateboard",
                  "y": 4
                },
                {
                  "x": "others",
                  "y": 252
                }
              ]
            }
        ]

        setplotData(pdata);
    }, [props]);

    return (
        <ResponsiveLine
            data={plotData}
            margin={{ top: 10, right: 50, bottom: 50, left: 30 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
            gridYValues={ [10, 50, 200] }
            curve="step"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'transportation',
                legendOffset: 36,
                legendPosition: 'middle'
            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'count',
                legendOffset: -40,
                legendPosition: 'middle',
                tickValues: [10, 150]
            }}
            colors={{ scheme: 'nivo' }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabel="y"
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
                {
                    anchor: 'top-left',
                    direction: 'column',
                    justify: false,
                    translateX: 50,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
        />
    )
}

export default PlotItemTrend;