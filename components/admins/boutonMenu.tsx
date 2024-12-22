import React, { useState } from 'react';
import { View } from 'lucide-react-native';

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
        <View style={styles.container}>
            <View
                style={styles.button(activeButton === 'first')}
                onClick={() => handleButtonClick('first', onFirstClick)}
            >
                <View style={styles.text}>{first}</View>
            </View>
            <View
                style={styles.button(activeButton === 'second')}
                onClick={() => handleButtonClick('second', onSecondClick)}
            >
                <View style={styles.text}>{second}</View>
            </View>
            <View
                style={styles.button(activeButton === 'third')}
                onClick={() => handleButtonClick('third', onThirdClick)}
            >
                <View style={styles.text}>{third}</View>
            </View>
        </View>
    );
};

export default BoutonMenu;
