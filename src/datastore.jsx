import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import '../static/css/bootstrap_4_3_1.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import InfoPaper from './components/InfoPaper';
import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';
import QuickInfoBox from './components/QuickInfoBox';

import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import PlotItemTrend from './components/PlotItemTrend';

import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const drawerWidth = 180;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(6) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(1),
    },

    plotStyle: {
        marginTop: '9px',
        padding: '11px',
        backgroundColor: '#ffffff',
        marginLeft: '0px',
        marginBottom: '3px',
        height: '200px',
    },
    userInfoStyle: {
        marginTop: '9px',
        padding: '11px',
        backgroundColor: '#bc9460',
        marginLeft: '0px',
        marginBottom: '3px',
    },
    movementInfoStyle: {
        marginTop: '9px',
        padding: '11px',
        backgroundColor: '#60a3bc',
        marginBottom: '3px',
        marginLeft: '6px',
    },
    paperAddBarStyle: {
        marginTop: '9px',
        padding: '9px',
        marginBottom: '3px',
        marginLeft: '6px',
    },
    paperMovementStyle: {
        marginTop: '9px',
        padding: '9px',
        marginBottom: '3px',
        overflowX: 'auto',
        // whiteSpace: 'nowrap'
    },
    grid: {
        margin: 0,
        flexGrow: 0,
        maxWidth: '100%',
        flexBasis: '100%',
        padding: 0,
        // overflowX: 'hidden',
        spacing: 0,
    },
}));

export default function MainLayout() {
    const classes = useStyles();
    const theme = useTheme();

    const [open, setOpen] = React.useState(false);
    const [stores, setStores] = React.useState([]);
    const [current_storeid, setCurrent_storeid] = React.useState('');
    const [user_info, setUser_info] = React.useState('');
    const [movements, setMovements] = React.useState([]);
    const [all_categories, setAll_categories] = React.useState([]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        //TODO: Get here user information for which loading related information to be rendered into the table
        // const uid = this.props.uid
        const uid = 1;

        // Get stores related to this user
        let all_stores = 'http://127.0.0.1:5000/stores/uid/' + uid;
        let user_info = 'http://127.0.0.1:5000/users/uid/' + uid;

        const request_stores = axios.get(all_stores);
        const request_userinfo = axios.get(user_info);

        axios
            .all([request_stores, request_userinfo])
            .then(
                axios.spread((...responses) => {
                    const response_stores = responses[0];
                    const response_userinfo = responses[1];

                    setStores(response_stores.data);
                    setUser_info(response_userinfo.data);
                }),
            )
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleTableAddRequest = (current_selection) => {
        //TODO: Get here user information for which loading related information to be rendered into the table
        // const uid = this.props.uid
        const uid = 1;

        var today = new Date();
        var today_temp = `${('0' + today.getUTCDate()).slice(-2)}/${('0' + (today.getUTCMonth() + 1)).slice(-2)}/${today.getUTCFullYear()}`;
        var today_temp_4yable = `${today.getUTCFullYear()}-${('0' + (today.getUTCMonth() + 1)).slice(-2)}-${('0' + today.getUTCDate()).slice(-2)}`;

        const date_movement = {
            date_movement: today_temp,
        };
        const quantity = {
            quantity: current_selection.quantity,
        };

        const item = {
            itemId: current_selection.itemId,
        };
        const batch = {
            batchId: current_selection.batchId,
        };
        const operator = {
            operator: uid,
        };

        axios
            .post('http://127.0.0.1:5000/add_movement', {
                date_movement,
                quantity,
                item,
                batch,
                operator,
            })
            .then((response) => {
                // TODO: check if response is OK
                let res = response.data;
                var newMovements = movements;
                newMovements.unshift({
                    id: res['movement_id'],
                    code_item: res['item_code'],
                    operator: res['operator_name'] + ' ' + res['operator_surname'],
                    date_movement: today_temp_4yable,
                    item: res['item_name'],
                    category: current_selection.categoryName,
                    batches: current_selection.batchCode, //res['batch_code'],
                    company: current_selection.companyName,
                    quantity: current_selection.quantity,
                });

                setMovements(newMovements);
            })
            .catch((err) => {
                alert('Insert error.\nMessage: ' + err);
            });
    };

    const handleTableDelete = (movement_id) => {
        var filteredData = movements.filter((el) => el.id !== movement_id);
        setMovements(filteredData);
    };

    const handleTableEdit = (movement_info) => {
        let new_mov_table = JSON.parse(JSON.stringify(movements));
        for (let mov in new_mov_table) {
            if (mov.id === movement_info.id) {
                new_mov_table.date_movement = movement_info.date_movement;
                new_mov_table.batches = movement_info.batch;
                new_mov_table.quantity = movement_info.quantity;
                break;
            }
        }

        setMovements(new_mov_table);
    };

    const handleStoreSelect = (storeid) => {
        let categories_url = 'http://127.0.0.1:5000/categories/store/' + storeid;
        let movements_url = 'http://127.0.0.1:5000/movements/store/' + storeid;

        const request_categories = axios.get(categories_url);
        const request_movements = axios.get(movements_url);

        axios
            .all([request_categories, request_movements])
            .then(
                axios.spread((...responses) => {
                    const response_categories = responses[0];
                    const response_movements = responses[1];

                    setAll_categories(response_categories.data);
                    setMovements(response_movements.data);
                    setCurrent_storeid(storeid);
                }),
            )
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
                </div>
                <Divider />
                <List>
                    {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon fontSize="small"/> : <MailIcon fontSize="small"/>}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['All mail', 'Trash', 'Spam'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon fontSize="small"/> : <MailIcon fontSize="small"/>}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div style={{ padding: 0 }}>
                    <Grid container spacing={0}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} className={classes.plotStyle}>
                                <PlotItemTrend />
                            </Paper>
                        </Grid>

                        <Grid container spacing={0}>
                            <Grid item xs={12} md={2}>
                                <Paper elevation={2} className={classes.userInfoStyle}>
                                    <InfoPaper stores={stores} userinfo={user_info} onStoreSelect={handleStoreSelect} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Paper className={classes.paperAddBarStyle} elevation={2}>
                                    <AddMovementBar sid={current_storeid} all_categories={all_categories} onTableAddRequest={handleTableAddRequest} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Paper className={classes.movementInfoStyle} elevation={2}>
                                    <QuickInfoBox sid={current_storeid} />
                                </Paper>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Paper className={classes.paperMovementStyle} elevation={2}>
                                <Grid container style={{ margin: 0 }}>
                                    <Grid item xs={10} md={10}>
                                        <MovementsTable data={movements} userinfo={user_info} onTableDelete={handleTableDelete} onTableEdit={handleTableEdit} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </main>
        </div>
    );
}

const rootElement = document.getElementById('root');
const uid = rootElement.getAttribute('uid');
// const StyledMainLayout = withStyles(styles)(MainLayout);
ReactDOM.render(<MainLayout uid={uid} />, rootElement);
