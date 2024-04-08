import React from 'react';

const InfoIcon = () => {
    const iconStyle = {
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: '#1671ef',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '10px',
        color: '#fff',
        margin: '0 0 0 8px',
        fontFamily: 'serif',
        lineHeight: '1'
    };

    return (
        <div style={iconStyle}>
            <span>i</span>
        </div>
    );
};

export default InfoIcon;