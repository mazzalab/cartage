import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles(theme => ({
    menuitem: {
        fontSize: 12,
    },
    userInfo: {
        fontWeight: 'bold',
    },
    formControl: {
        // paddingTop: "5px",
        // margin: theme.spacing(1),
        minWidth: 140,
    },
    selectEmpty: {
        // marginTop: theme.spacing(300),
        fontSize: 10,
    },
}));

function InfoPaper(props) {
    const classes = useStyles();
    const [value, setValue] = useState('select');

    const stores = [];
    for (const [idx, store] of props.stores.entries()) {
        stores.push(
            <MenuItem className={classes.menuitem} value={store.id} key={store.id}>
                {store.name}
            </MenuItem>,
        );
    }
    const handleChange = event => {
        setValue(event.target.value);
        props.onStoreSelect(event.target.value);
    };
    return (
        <FormControl className={classes.formControl}>
            <InputLabel className={classes.userInfo}>{props.userinfo.name} {props.userinfo.surname}</InputLabel>
            <Select value={value} onChange={handleChange} className={classes.selectEmpty}>
                <MenuItem className={classes.menuitem} value="select">
                    <em>select</em>
                </MenuItem>
                {stores}
            </Select>
        </FormControl>
    );
}

export default InfoPaper;
