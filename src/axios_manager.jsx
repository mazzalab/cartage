import axios from 'axios';
import React from 'react';

export const axioscall_categories_4combo = () => {
    return axios.get('http://127.0.0.1:5000/categories')
    .then((response) => {
        const responseCat = response.data;

        let items_category = responseCat.map(r => {
            return <option key={r.id + '_' + r.name}>{r.name}</option>;
        });
        items_category.unshift(<option key={'empty_category'}>{'select'}</option>);
        return items_category;
    })
    .catch(errors => {
        console.log(errors);
        return [<option key="error_category">error</option>];
    })
};

export const axioscall_addMovement = (code_item, operator, date_movement, batch, quantity, item, category, company, onTableAddRequest) => {
    return axios.post('http://127.0.0.1:5000/add_movement', {
            code_item,
            operator,
            date_movement,
            batch,
            quantity
        })
        .then(response => {
            onTableAddRequest(
                response.data['ID'],
                code_item,
                operator,
                date_movement,
                item,
                category,
                batch,
                company,
                quantity,
            );

            return 'Inserted item with ID: ' + response.data['ID'];
        })
        .catch(err => {
            return 'Insert error.\nMessage: ' + err;
        });
};
