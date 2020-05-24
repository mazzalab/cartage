import React, { useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import ExpiringModal from './ExpiringModal';
import RunningoutModal from './RunningoutModal';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Battery20Icon from '@material-ui/icons/Battery20';
import UpdateIcon from '@material-ui/icons/Update';

const useStyles = makeStyles((theme) => ({
    listbox: {
        margin: 0,
        padding: 1,
    },
    icons: {
        fontSize: 17,
    },
    itemIcon: {
        margin: 0,
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // paper_bcg: {
    //     backgroundColor: theme.palette.background.paper,
    //     border: '2px solid #000',
    //     boxShadow: theme.shadows[5],
    //     padding: theme.spacing(2, 4, 3),
    //   },
}));

function QuickInfoBox(props) {
    const classes = useStyles();
    const [expiring, setExpiring] = useState(0);
    const [expired, setExpired] = useState(0);
    const [expiringDetails, setExpiringDetails] = useState('');
    const [runningout, setRunningout] = useState(0);
    const [ranout, setRanout] = useState(0);
    const [runningoutDetails, setRunningoutDetails] = useState('');
    const [openExpiring, setOpenExpiring] = React.useState(false);
    const [openRunningout, setOpenRunningout] = React.useState(false);

    const count_runningout_items = (rs) => {
        let uniq = new Set();
        for (let r in rs) {
            uniq.add(rs[r].item_id);
        }
        return uniq.size;
    };

    const count_ranout_items = (rs) => {
        let uniq = {};
        for (let r in rs) {
            let key = rs[r].item_id;
            let value = rs[r].batch_quantity;
            if (key in uniq) uniq[key] += value;
            else uniq[key] = value;
        }

        var filtered = Object.fromEntries(Object.entries(uniq).filter(([k, v]) => v == 0));
        return Object.keys(filtered).length;
    };

    const count_expired_items = (rs) => {
        let count = 0;
        for (let r in rs) {
            if (new Date(rs[r].batch_date_expiry) <= new Date()) count++;
        }
        return count;
    };
    
    React.useEffect(() => {
        if (props.sid !== 'select' && props.sid !== "") {
            let url1 = 'http://127.0.0.1:5000/expiring/store/' + props.sid;
            let url2 = 'http://127.0.0.1:5000/runningout/store/' + props.sid;

            const requestOne = axios.get(url1);
            const requestTwo = axios.get(url2);

            axios
                .all([requestOne, requestTwo])
                .then(
                    axios.spread((...responses) => {
                        // Report expiring and expired batches (quantity > 0)
                        setExpiringDetails(responses[0].data);
                        setExpiring(responses[0].data.length);
                        setExpired(count_expired_items(responses[0].data));

                        // Report running out and termined items (but not expired)
                        setRunningout(count_runningout_items(responses[1].data));
                        setRunningoutDetails(responses[1].data);
                        setRanout(count_ranout_items(responses[1].data));
                    }),
                )
                .catch((errors) => {
                    console.log(errors.message);
                });
        } else{
            // Reset all fields
            setExpiring(0);
            setExpired(0);
            setExpiringDetails('');
            setRunningout(0);
            setRanout(0)
            setRunningoutDetails('')
        }
    }, [props]);

    const handleOpenExpiringModal = () => {
        setOpenExpiring(true);
    };

    const handleCloseExpiringModal = () => {
        setOpenExpiring(false);
    };

    const handleOpenRunningoutModal = () => {
        setOpenRunningout(true);
    };

    const handleCloseRunningoutModal = () => {
        setOpenRunningout(false);
    };

    return (
        <div>
            {/* Box text */}
            <List component="nav" aria-label="main mailbox folders" className={classes.root} disablePadding>
                <ListItem button className={classes.listbox} onClick={handleOpenExpiringModal}>
                    <ListItemIcon>
                        <UpdateIcon className={classes.icons} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <div style={{ margin: -25, marginTop: -7, color: 'white', fontSize: 11 }}>
                                Expiring: {expiring} ({expired})
                            </div>
                        }
                    />
                </ListItem>
                <ListItem button className={classes.listbox} onClick={handleOpenRunningoutModal}>
                    <ListItemIcon>
                        <Battery20Icon className={classes.icons} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <div style={{ margin: -25, marginTop: -7, color: 'white', fontSize: 11 }}>
                                Running out: {runningout} ({ranout})
                            </div>
                        }
                    />
                </ListItem>
            </List>
            
            {/* Expiring batches modal window */}
            <ExpiringModal open={openExpiring} onCloseModal={handleCloseExpiringModal} expiringInfo={expiringDetails}/>
            
            {/* Running out items modal window */}
            <RunningoutModal open={openRunningout} onCloseModal={handleCloseRunningoutModal} runningoutInfo={runningoutDetails}/>
        </div>
    );
}

export default QuickInfoBox;
