import axios from 'axios';
import React from 'react';

export const axioscall_categories_4combo = () => {
    let items_category = [<option key="error_category">error</option>];

    const requestCat = axios.get('http://127.0.0.1:5000/categories');
    axios
        .all([requestCat])
        .then(
            axios.spread((...responses) => {
                const responseCat = responses[0].data;

                items_category = responseCat.map(r => {
                    return <option key={r.id + '_' + r.name}>{r.name}</option>;
                });
                items_category.unshift(<option key={'empty_category'}>{'select'}</option>);
            }),
        )
        .catch(errors => {
            console.log(errors);
        });

    return items_category;
};
