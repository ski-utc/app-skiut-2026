import React, { useState } from 'react';

interface ButtonProps {
    first: string;
    second: string;
    third: string;
    onFirstClick: () => void;
    onSecondClick: () => void;
    onThirdClick: () => void;
}

const BoutonMenu: React.FC<ButtonProps> = ({ 
    first, 
    second, 
    third, 
    onFirstClick, 
    onSecondClick, 
    onThirdClick 
}) => {
    const [activeButton, setActiveButton] = useState<string>('first');

    const styles = {
        container: {
            width: '100%',
            height: '100%',
            borderBottom: '2px #EAEAEA solid',
            display: 'flex',
        },
        button: (isActive: boolean) => ({
            flexGrow: 1,
            height: 41,
            padding: '12px 10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: isActive ? '1px #E64034 solid' : 'none',
            cursor: 'pointer',
            backgroundColor: isActive ? '#F9F9F9' : 'transparent',
        }),
        text: {
            color: 'black',
            fontSize: 14,
            fontFamily: 'Inter',
            fontWeight: 500,
            wordWrap: 'break-word',
            textAlign: 'center',
        },
    };

    const handleButtonClick = (button: string, onClick: () => void) => {
        setActiveButton(button);
        onClick();
    };

    return (
        <div style={styles.container}>
            <div
                style={styles.button(activeButton === 'first')}
                onClick={() => handleButtonClick('first', onFirstClick)}
            >
                <div style={styles.text}>{first}</div>
            </div>
            <div
                style={styles.button(activeButton === 'second')}
                onClick={() => handleButtonClick('second', onSecondClick)}
            >
                <div style={styles.text}>{second}</div>
            </div>
            <div
                style={styles.button(activeButton === 'third')}
                onClick={() => handleButtonClick('third', onThirdClick)}
            >
                <div style={styles.text}>{third}</div>
            </div>
        </div>
    );
};

export default BoutonMenu;
