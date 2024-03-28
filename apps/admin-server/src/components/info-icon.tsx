import React from 'react';

const InfoIcon = () => {
    const iconStyle = {
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: '#9543fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '10px',
        color: '#fff',
        margin: '0 0 3px 8px',
        fontFamily: 'serif'
    };

    return (
        <div style={iconStyle}>
            <span>i</span>
        </div>
    );
};

export default InfoIcon;
