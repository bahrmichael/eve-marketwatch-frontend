import React from 'react';

export default class Documentation extends React.Component {

    render() {
        return (
            <>
            <h2>How do we calculate if an item is overpriced?</h2>
            <p>EVE Marketwatch uses the formula "8 / (Math.lolng(record.price) + 3)" to calculate the acceptable percentage. 
                An Atron for example, which costs ~450k in Jita, would allow for a markup of 50%. 
                A Tengu however which costs ~150m, would only allow for a markup of 36%.
                An item is considered overpriced, if the local price is higher than Jita plus the acceptable percentage.</p>
            </>
        );
    }
}