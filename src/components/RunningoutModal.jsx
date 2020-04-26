import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Fade from '@material-ui/core/Fade';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
    paper_bcg: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    table: {
        maxWidth: 650,
        maxHeight: 600
    },
    tablecell: {
        fontSize: 12,
    },
    redTablecell: {
        fontSize: 12,
        color: 'red',
        fontWeight: 'bold'
    },
    headerCell: {
        fontWeight: 'bold'
    }
}));

function RunningoutModal(props) {
    const classes = useStyles();
    const [runningoutInfo, setRunningoutInfo] = useState('Empty table');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const stylizeTableCell = (batch_quantity) => {
        if(batch_quantity == 0){
            return(<TableCell className={classes.redTablecell} align="right">{batch_quantity}</TableCell>)
        } else{
            return (<TableCell className={classes.tablecell} align="right">{batch_quantity}</TableCell>)
        }
    }

    React.useEffect(() => {
        if (props.runningoutInfo !== '') {
            let tags = props.runningoutInfo.map((i) => (
                <TableRow key={i.batch_code}>
                    <TableCell className={classes.tablecell} align="right">
                        {i.item_code_item}
                    </TableCell>
                    <TableCell className={classes.tablecell} align="right">
                        {i.item_name}
                    </TableCell>
                    <TableCell className={classes.tablecell} align="right">
                        {i.batch_code}
                    </TableCell>
                    {stylizeTableCell(i.batch_quantity)}
                </TableRow>
            ));

            setRunningoutInfo(tags);
        }
    }, [props]);

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={props.open}
            onClose={props.onCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={props.open}>
                <div className={classes.paper_bcg}>
                    <h3 id="transition-modal-title" align="center">Running out items</h3>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="dense running out table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.headerCell} align="right">Item code</TableCell>
                                    <TableCell className={classes.headerCell} align="right">Description</TableCell>
                                    <TableCell className={classes.headerCell} align="right">Batch</TableCell>
                                    <TableCell className={classes.headerCell} align="right">Quantity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>{runningoutInfo}</TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 25, 50]}
                        component="div"
                        count={runningoutInfo.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </div>
            </Fade>
        </Modal>
    );
}

export default RunningoutModal;